import { PackageCostSetup } from "../../models/total-cost/setup.js";
import { getUniqueCombinationsToTargetSum } from "../../services/delivery-time.js";
import { CostCalculator } from "../../services/total-cost.js";



// # Start of Selection

type Delivery = {
    id: string
    sumWeight: number
    maxDistance: number
    packages: PackageCostSetup[]
}


type AssignedJob = Omit<Delivery, 'packages'> & {
    packages: (PackageCostSetup & {
        deliveryTime: number

    })[]
} & {
    roundTripTime: number;
};

interface IVehicle {
    addJob(job: Pick<Delivery, 'packages'>): void;
    getAllJobs(): AssignedJob[];
    getTotalDeliveryTime(): number;
}
type VehicleProps = {
    id: number
    maxSpeed: number
    maxWeight: number
}
class Vehicle implements IVehicle {
    private id: number;
    private jobs: AssignedJob[];
    private maxSpeed: number;
    private maxWeight: number;
    private totalRoundTripTime: number

    constructor({ id, maxSpeed, maxWeight }: VehicleProps) {
        this.id = id;
        this.maxSpeed = maxSpeed;
        this.maxWeight = maxWeight;
        this.totalRoundTripTime = 0
        this.jobs = [];
    }

    public getId() {
        return this.id
    }
    public getmisc() {
        return { id: this.id, weight: this.maxWeight }
    }
    public addJob(delivery: Delivery): void {
        const roundTripTime = this.calculateJobDeliveryTime(delivery);
        const packages: AssignedJob['packages'] = delivery.packages.map((pkg) => ({
            ...pkg,
            deliveryTime: parseFloat((Math.floor(pkg.packageDistance / this.maxSpeed * 100) / 100).toFixed(2))
        }))
        this.jobs.push({ ...delivery, roundTripTime, packages });
        this.totalRoundTripTime += roundTripTime
    }
    public getPackageDeliveryTime(packageName: string): number {
        for (const job of this.jobs) {
            const foundPackage = job.packages.find(pkg => pkg.packageName === packageName);
            if (foundPackage) {
                return foundPackage.deliveryTime;
            }
        }
        throw new Error('Cannot find package')
    }

    public getAllJobs(): AssignedJob[] {
        return this.jobs;
    }

    public getTotalDeliveryTime(): number {
        // return this.jobs.reduce((acc, job) => acc + job.deliveryTime, 0);
        return this.totalRoundTripTime
    }

    private calculateJobDeliveryTime(delivery: Delivery): number {
        const distance = Math.max(...delivery.packages.map(pkg => pkg.packageDistance));
        return parseFloat((Math.floor((distance / this.maxSpeed) * 2 * 100) / 100).toFixed(2))
    }
}

type DeliverySystemProps = {
    numberOfVehicles: number
    packages: PackageCostSetup[]
    maxSpeed: number,
    maxWeight: number
    costCalculator: CostCalculator
}
type MaybeAssignedPackage = PackageCostSetup & { deliveryId?: string, vehicleId?: number, cost?: number, discount?: number, deliveryTime?: number }

type MaybeAssignedDelivery = Delivery & { packages: MaybeAssignedPackage[] } & { vehicleId?: number }
class DeliverySystem {
    private vehicles: Vehicle[];
    private packages: MaybeAssignedPackage[];
    private maxWeight: number;
    private sortedDeliveries: MaybeAssignedDelivery[];
    private mappedDeliveries: Map<string, MaybeAssignedDelivery>;
    private maxSpeed: number;
    private costCalculator: CostCalculator

    constructor({ maxSpeed, maxWeight, numberOfVehicles, packages, costCalculator }: DeliverySystemProps) {
        this.vehicles = this.initVehicles({ maxSpeed, maxWeight, numberOfVehicles });
        this.maxSpeed = maxSpeed;
        this.maxWeight = maxWeight;
        this.sortedDeliveries = [];
        this.packages = packages;
        this.mappedDeliveries = new Map();
        this.costCalculator = costCalculator
    }

    public getMaxSpeed(): number {
        return this.maxSpeed;
    }

    public addPackage(deliveryPackage: PackageCostSetup): void {
        this.packages.push(deliveryPackage);
    }

    public addVehicle(vehicle: Vehicle): void {
        this.vehicles.push(vehicle);
    }

    public getVehicle(id: number): Vehicle | undefined {
        return this.vehicles.find(vehicle => vehicle.getId() === id);
    }

    private initVehicles({ maxSpeed, maxWeight, numberOfVehicles }: Omit<DeliverySystemProps, 'packages' | 'costCalculator'>): Vehicle[] {
        return Array.from({ length: numberOfVehicles }, (_, i) => new Vehicle({ id: i, maxSpeed, maxWeight }));
    }

    public planDelivery(): void {
        if (this.vehicles.length === 0 || this.packages.length === 0) {
            throw new Error('Incomplete setup. No vehicle or package.');
        }
        this.sortedDeliveries = this.groupPackagesToMaxWeight();
    }

    public assignDeliveriesToVehicles(): void {
        if (this.sortedDeliveries.length === 0) {
            throw new Error('No delivery available, please plan delivery');
        }
        for (const delivery of this.sortedDeliveries) {
            const availableVehicle = this.getFirstAvailableVehicle();
            availableVehicle.addJob(delivery);
            const vehicleId = availableVehicle.getId();
            delivery.vehicleId = vehicleId;
            delivery.packages.forEach(pkg => {
                const deliveryTime = availableVehicle.getPackageDeliveryTime(pkg.packageName)

                this.updatePackageWithDeliveryCost(pkg.packageName, { deliveryId: delivery.id, vehicleId, deliveryTime });
            });
        }
        this.mappedDeliveries = new Map(this.sortedDeliveries.map(delivery => [delivery.id, delivery]));
    }

    public getSortedDeliveries(): MaybeAssignedDelivery[] {
        return this.sortedDeliveries;
    }

    public getDeliveryById(id: string): MaybeAssignedDelivery | null {
        return this.mappedDeliveries.get(id) ?? null;
    }

    public getPackageById(id: string): MaybeAssignedPackage {
        const pkg = this.packages.find(pkg => pkg.packageName === id);
        if (!pkg) throw new Error('Cannot find package with the id');
        return pkg;
    }
    private updatePackageWithDeliveryCost(id: string, { deliveryId, vehicleId, deliveryTime }: Required<Pick<MaybeAssignedPackage, 'vehicleId' | 'deliveryId' | 'deliveryTime'>>): MaybeAssignedPackage {
        const pkg = this.getPackageById(id);
        pkg.deliveryId = deliveryId;
        pkg.vehicleId = vehicleId;
        const { costDiscounted, discountValue } = this.costCalculator.calculatePackageCost(pkg)
        pkg.cost = costDiscounted
        pkg.discount = discountValue
        pkg.deliveryTime = deliveryTime
        return pkg;
    }

    private getFirstAvailableVehicle(): Vehicle {
        if (this.vehicles.length === 0) {
            throw new Error('Please add vehicle');
        }
        return this.vehicles.reduce((prev, curr) => prev.getTotalDeliveryTime() < curr.getTotalDeliveryTime() ? prev : curr);
    }

    private groupPackagesToMaxWeight(): MaybeAssignedDelivery[] {
        const weights = this.packages.map((pkg, i) => ({ index: i, value: pkg.packageWeight }));
        const allCombinations = getUniqueCombinationsToTargetSum(weights, this.maxWeight);

        return Array.from(allCombinations.entries())
            .flatMap(([sumWeight, indexValueArrs]) => indexValueArrs.map(indexValueArr => {
                const packages = indexValueArr.map(indexValue => {
                    const pkg = this.packages[indexValue.index];
                    if (!pkg) throw new Error('Package not found');
                    return pkg;
                });
                const maxDistance = Math.max(...packages.map(pkg => pkg.packageDistance));
                const id = packages.map(pkg => pkg.packageName).join('&');
                return { id, sumWeight, packages, maxDistance };
            }))
            .sort((a, b) => b.sumWeight === a.sumWeight ? a.maxDistance - b.maxDistance : b.sumWeight - a.sumWeight);
    }


}

export { DeliverySystem, Vehicle };
