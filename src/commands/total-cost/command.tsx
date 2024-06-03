import { Box, Text } from "ink"
import React from "react"

type Props = {
    flags: any,
}
export default function TotalCostCommand({ flags, }: Props) {
    return (
        <Box>
            <Text backgroundColor={'blue'}>Total Cost: {JSON.stringify(flags)}</Text>
        </Box>
    )
}

