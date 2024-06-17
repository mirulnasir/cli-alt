import React from 'react';
import type { Flag, FlagType, Options, } from 'meow';
import meow from "meow";
import { CostCalculator, getDiscountCode, getTotalCostSetup } from "../../services/total-cost.js";
import { render } from 'ink';
import TotalCostView from './view.js';
import fs from 'fs'
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
    `
	Usage
	  $ cli-alt total-cost 

    Options
    --interactive, i    interactive mode
    --setup, s          (required if interactive mode is off) setup file
    --discount, d       (required if interactive mode is off) discount file
    --help, h           help
`,
    options

)

if (cli.flags["help"]) {
    cli.showHelp(0)
}

const checkFiles = async () => {
    const setupFile = cli.flags["setup"] as string
    const discountFile = cli.flags["discount"] as string
    const [setup, discountCodes] = await Promise.all([
        getTotalCostSetup(setupFile),
        getDiscountCode(discountFile)
    ]);

    return { setup, discountCodes }
}

const { setup, discountCodes
} = await checkFiles()

if (!setup || !discountCodes) {
    console.error("Error: setup or discount codes not found")
    process.exit(1)
}
// const totalCost = calculateTotalCost(setup, discountCodes)
const costcalculator = new CostCalculator({ baseDeliveryCost: setup.baseDeliveryCost, discountCodes })
const totalCost = costcalculator.calculateTotalCost(setup.packageCostSetup)
const pkgCost = costcalculator.calculatePackageCost(setup.packageCostSetup[2]!)
console.log('pkgCost', pkgCost)
const getOutput = () => {
    const out = setup.packageCostSetup.map((pkg) => {
        const { costDiscounted, discountValue } = costcalculator.calculatePackageCost(pkg)
        return `${pkg.packageName} ${discountValue} ${costDiscounted}`

    })
    return out.join('\r\n')
}
fs.writeFile('out.txt', getOutput(), (err) => {
    if (err)
        console.log(err);
    else {
        console.log("File written successfully\n");
        console.log("The written has the following contents:");
        console.log(fs.readFileSync("out.txt", "utf8"));
    }
})
render(<TotalCostView value={totalCost} />)

