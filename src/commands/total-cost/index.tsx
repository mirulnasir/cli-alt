import React from "react";
import { render } from "ink";
import meow from "meow";
import type { Options, Flag, FlagType, } from 'meow'
import TotalCostCommand from "./command.js"

const flags: Record<string, Flag<FlagType, any>> = {
    help: { type: "boolean", alias: "h" },
    interactive: { type: "boolean", alias: "i", default: false },
    input: {
        type: 'string', alias: 'in', isRequired: (
            flags
        ) => {
            return !flags['interactive'] && !flags['help']
        }
    },
    output: {
        type: 'string', alias: 'out', isRequired: (
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




render(<TotalCostCommand flags={cli.flags} />)

