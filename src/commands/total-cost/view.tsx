import { Box, Text } from "ink"
import React from "react"

type Props = {
    value: number
}
export default function TotalCostView({ value }: Props) {
    return (
        <Box>
            <Text >Total Cost: {value}</Text>
        </Box>
    )
}

