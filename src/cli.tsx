#!/usr/bin/env node
// import React from 'react';
// import { render } from 'ink';
import meow from 'meow';
// import App from './app.js';

const cli = meow(
	`
	Usage
	  $ cli-alt

	Commands
	  total-cost calculate total cost
	  best-deal find the best deal

	Examples
	  $ cli-alt --name=Jane
	  Hello, Jane
`,
	{
		importMeta: import.meta,
		autoHelp: true,
		flags: {


			name: {
				type: 'string',
			},
		},
	},
);

// const safeFlags = Object.fromEntries(
// 	Object.entries(cli.flags).map(([key, value]) => [key, String(value)])
// );

switch (cli.input[0]) {
	case 'total-cost':
		await import('./commands/total-cost/index.js')
		break;
	case 'delivery-time':
		await import('./commands/delivery-time/index.js')
		break;
	default:
		cli.showHelp(0)
}
