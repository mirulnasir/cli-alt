import meow, { Flag, FlagType, Options } from "meow";
import { getDeliveryTimeSetup } from "../../services/delivery-time.js";
import { DeliverySystem, } from "./vehicle.js";
import { CostCalculator, getDiscountCode } from "../../services/total-cost.js";

const flags: Record<string, Flag<FlagType, any>> = {
    help: { type: "boolean", alias: "h" },
    interactive: { type: "boolean", alias: "i", default: false },
    setup: {
        type: 'string', alias: 's', isRequired: (
            flags
        ) => {
            return !flags['interactive'] && !flags['help']
        }
    },
    discount: {
        type: 'string', alias: 'd', isRequired: (
            flags
        ) => {
            return !flags['interactive'] && !flags['help']
        }
    }


}
const options: Options<typeof flags> = {
    importMeta: import.meta,
    autoHelp: true,
    flags,
    version: "0.0.1"

}

const cli = meow(
    `Usage
     $ cli-alt delivery-time
     
     Options:
     -i, --interactive    Interactive mode
     -s, --setup          Setup cost
     -d, --discount       Discount
     `,
    options
)

if (cli.flags['help']) {
    cli.showHelp(0)

}

const checkFiles = async () => {
    const setupPath = cli.flags['setup'] as string
    const discountFile = cli.flags["discount"] as string
    const [setup, discountCodes] = await Promise.all([
        getDeliveryTimeSetup(setupPath),
        getDiscountCode(discountFile)
    ]);

    return { setup, discountCodes }

}
const { setup, discountCodes } = await checkFiles();


if (!setup || !discountCodes) {
    console.error("Error: setup or discount codes not found")
    process.exit(1)
}
const { numberOfVehicles, maxCarriableWeight, maxSpeed, packageCostSetup, baseDeliveryCost } = setup;


// while (numberOfPackages > 0) {
const costCalculator = new CostCalculator({ baseDeliveryCost, discountCodes })

const ds = new DeliverySystem({
    maxSpeed,
    maxWeight: maxCarriableWeight, numberOfVehicles, packages: packageCostSetup,
    costCalculator
})
ds.planDelivery()
ds.assignDeliveriesToVehicles()
console.log('sortedDelivery', ds.getSortedDeliveries())
console.log('pkg', ds.getPackageById('PKG4'))
