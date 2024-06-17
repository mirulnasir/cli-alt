export const maxSumArray = (arr: number[], target: number): number[] => {
    let maxSum = 0
    let maxSumArray = [] as number[]
    const recurse = (index: number, sum: number, currentArray: number[]) => {
        if (sum > target) {
            return
        }
        if (sum > maxSum) {
            maxSum = sum
            maxSumArray = currentArray
        }
        for (let i = index; i < arr.length; i++) {
            recurse(i + 1, sum + (arr[i] as number), [...currentArray, (arr[i] as number)])
        }
    }
    recurse(0, 0, [])
    return maxSumArray
}

export const getIndicesOfMaximum = (arr: number[], target: number): number[] => {
    let maxSum = 0
    let maxSumArray = [] as number[]
    const recurse = (index: number, sum: number, currentArray: number[]) => {
        if (sum > target) {
            return
        }
        if (sum > maxSum) {
            maxSum = sum
            maxSumArray = currentArray
        }
        for (let i = index; i < arr.length; i++) {
            recurse(i + 1, sum + (arr[i] as number), [...currentArray, i])
        }
    }
    recurse(0, 0, [])
    return maxSumArray
}


