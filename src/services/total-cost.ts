// import { DiscountCode } from "../models/total-cost/discount.js";
import { PackageCostSetup, TotalCostSetup, totalCostSetupFileSchema } from "../models/total-cost/setup.js"
import { fromError } from 'zod-validation-error';
import { readFile } from "../utils/file.js";
import { DiscountCode, discountCodeArraySchema } from "../models/total-cost/discount.js";

const WEIGHT_COST = 10
const DISTANCE_COST = 5
const calculateDeliveryCost = ({ base, distance, weight }: {
    base: number,
    weight: number,
    distance: number,
}) => {
    return base + (distance * DISTANCE_COST) + (weight * WEIGHT_COST)
}
const totalCostSetupStringToSchema = (packageDeliverySetupString: string, schema = totalCostSetupFileSchema) => {
    const strArray = packageDeliverySetupString.split('\n').filter(Boolean);
    const deliverySetup = schema.safeParse(strArray);

    if (!deliverySetup.success) {
        const validationError = fromError(deliverySetup.error);
        console.error(validationError.toString());
        return null; // Early return on failure to parse
    }

    return deliverySetup.data ? { ...deliverySetup.data } : null;
}



export const getTotalCostSetup = async (filePath: string): Promise<TotalCostSetup | null> => {
    const file = await readFile(filePath)
    if (!file) return null
    return totalCostSetupStringToSchema(file)
}

export const getDiscountCode = async (filePath: string): Promise<DiscountCode[] | null> => {
    const file = await readFile(filePath)
    if (!file) return null
    const discountCodeArray = discountCodeArraySchema.safeParse(JSON.parse(file))
    if (!discountCodeArray.success) {
        const validationError = fromError(discountCodeArray.error);
        console.error(validationError.toString());
        return null; // Early return on failure to parse
    }
    return discountCodeArray.data
}

class DiscountService {
    private discountCodes: DiscountCode[]
    constructor({ discountCodes }: { discountCodes: DiscountCode[] }) {
        this.discountCodes = discountCodes
    }
    findDiscountForPackage(packageDiscountCode: string, packageName: string): DiscountCode {
        const discount = this.discountCodes.find(code => {

            return code.code === packageDiscountCode
        });
        if (!discount) {
            throw new Error(`Discount code ${packageDiscountCode} not found for package ${packageName}`);
        }
        return discount;
    }

    calculateDiscountValue(discount: DiscountCode, packageDistance: number, packageWeight: number, deliveryCost: number): number {
        const isValidDistance = discount.distance.min <= packageDistance && discount.distance.max >= packageDistance;
        const isValidWeight = discount.weight.min <= packageWeight && discount.weight.max >= packageWeight;
        const isValidDistanceWeight = isValidDistance && isValidWeight;
        const getDiscount = (discount: DiscountCode) => {
            if (typeof discount.discount.value === 'string') {
                return 0;
            }

            switch (discount.discount.type) {
                case 'fixed':
                    return discount.discount.value;
                case 'percentage':
                    return deliveryCost * (discount.discount.value / 100);
                default:
                    return 0;
            }
        }
        return isValidDistanceWeight ? getDiscount(discount) : 0;
    }
}

export class CostCalculator extends DiscountService {

    private baseDeliveryCost: number
    constructor({ baseDeliveryCost, discountCodes }: { baseDeliveryCost: number, discountCodes: DiscountCode[] }) {
        super({ discountCodes })
        this.baseDeliveryCost = baseDeliveryCost
    }
    calculateTotalCost(packages: TotalCostSetup['packageCostSetup']): number {
        let totalCostSum = 0;
        for (const packageCost of packages) {
            const totalCost = this.calculatePackageCost(packageCost);
            totalCostSum += totalCost.costDiscounted;
        }
        return totalCostSum;
    }

    public calculatePackageCost(packageCostSetup: PackageCostSetup): { costOriginal: number, costDiscounted: number, discountValue: number } {
        const { discountCode: packageDiscountCode, packageDistance, packageName, packageWeight } = packageCostSetup;

        const discount = this.getDiscountCode(packageDiscountCode, packageName);
        const deliveryCost = this.computeDeliveryCost(packageDistance, packageWeight);
        const discountValue = this.calculateDiscountValueIfApplicable(discount, packageDistance, packageWeight, deliveryCost);

        return { costOriginal: Math.floor(deliveryCost), costDiscounted: Math.floor(deliveryCost - discountValue), discountValue: Math.floor(discountValue) };
    }

    private getDiscountCode(packageDiscountCode: string, packageName: string): DiscountCode | null {
        if (packageDiscountCode === 'NA') {
            return null;
        }

        try {
            return this.findDiscountForPackage(packageDiscountCode, packageName);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            throw new Error('Failed to retrieve discount code');
        }
    }

    private computeDeliveryCost(packageDistance: number, packageWeight: number): number {
        return calculateDeliveryCost({
            base: this.baseDeliveryCost,
            distance: packageDistance,
            weight: packageWeight
        });
    }

    private calculateDiscountValueIfApplicable(discount: DiscountCode | null, packageDistance: number, packageWeight: number, deliveryCost: number): number {
        if (!discount) {
            return 0;
        }
        return this.calculateDiscountValue(discount, packageDistance, packageWeight, deliveryCost);
    }
}
