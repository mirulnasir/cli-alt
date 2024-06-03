import { Box, useApp, useInput, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import React, { useState } from 'react';

type Props = {
	input: string[]
	flags: Record<string, string>
}
export default function App({ input, flags }: Props) {
	const { exit } = useApp()
	const [page] = useState<'main' | 'help'>('main')
	useInput((_, key) => {
		if (key.escape) {
			if (page === 'main') {
				exit()
			}
		}
	})
	return (
		<Box justifyContent='center' alignItems='center' flexDirection='column'>
			<Gradient name="atlas">
				<BigText text='Hello' />
			</Gradient>
			<Text>
				Input: {JSON.stringify(input)}
			</Text>
			<Text>
				Flags: {JSON.stringify(flags)}
			</Text>
			<Text >
				You can pres 'Escape' to exit

			</Text>
		</Box>
	);
}
