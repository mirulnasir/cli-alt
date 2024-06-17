import { DeliveryTimeSetup, deliveryVehicleSetupSchema } from "../models/delivery-time/setup.js";
import { readFile } from "../utils/file.js";
import { fromError } from 'zod-validation-error';

/**
 * Finds the optimal combination of objects from the array that sum up to or less than the target sum.
 * Each object contains an index and value, and the array is not sorted.
 * 
 * @param {{index: number, value: number}[]} items - The array of objects to find the optimal combination from.
 * @param {number} targetSum - The target sum to achieve.
 * @returns {{index: number, value: number}[]} - The optimal combination of objects that sum up to or less than the target sum.
 * 
 * @example
 * const items = [
 *   { index: 0, value: 50 },
 *   { index: 1, value: 75 },
 *   { index: 2, value: 185 },
 *   { index: 3, value: 110 },
 *   { index: 4, value: 155 }
 * ]
 * const targetSum = 200;
 * const result = findOptimalCombination(items, targetSum);
 * // result will be:
 * { index: 1, value: 75 }, { index: 3, value: 110 }
 */
export const findMaxSumCombination = (items: { index: number, value: number }[], targetSum: number): { index: number, value: number }[] => {
    let bestSum = 0;
    let bestCombination: { index: number, value: number }[] = [];
    const findCombination = (currentIndex: number, currentSum: number, currentCombination: { index: number, value: number }[]) => {
        if (currentSum > targetSum) {
            return;
        }
        if (currentSum > bestSum) {
            bestSum = currentSum;
            bestCombination = currentCombination;
        }
        for (let i = currentIndex; i < items.length; i++) {
            const item = items[i];
            findCombination(i + 1, currentSum + (item?.value as number), [...currentCombination, (item as typeof bestCombination[0])]);
        }
    }

    findCombination(0, 0, []);
    return bestCombination;
}




type IndexValue = {
    index: number;
    value: number
}
/**
 * Get unique combinations of index-value pairs from the array that sum up to or less than the target sum.
 * Generates combinations, then removes the used numbers from the array and generates combinations again
 * until the array is empty.
 * 
 * @param {IndexValue[]} arr - The array of index-value pairs to find the combinations from.
 * @param {number} target - The target sum to achieve.
 * @returns {Map<number, IndexValue[][]>} - A map where the key is the sum and the value is an array of arrays, 
 * each containing index-value pairs that sum up to or less than the target sum.
 */
export const getUniqueCombinationsToTargetSum = (arr: IndexValue[], target: number): Map<number, IndexValue[][]> => {
    let resultMap = new Map<number, IndexValue[][]>()
    const compare = [...arr]
    let remaining = compare
    while (remaining.length > 0) {
        const indexValueArr = findMaxSumCombination(remaining, target)
        const sum = indexValueArr.reduce((acc, val) => acc + val.value, 0)
        const existingSum = resultMap.get(sum)
        resultMap.set(sum, existingSum ? [...existingSum, indexValueArr] : [indexValueArr])
        const indicesToRemove = indexValueArr.map(item => item.index)
        remaining = remaining.filter(rem => !indicesToRemove.includes(rem.index))
    }
    return resultMap
}
// console.log('allcombination', allCombinations(example, 300), { example })

/**
 * Get the original array indices for each element in the sub-array.
 * Ensures that no index is repeated, even if the same value appears multiple times in the original array.
 *
 * @param {number[]} arr - The original array of numbers.
 * @param {number[]} subArr - The sub-array of numbers to find indices for.
 * @returns {number[]} - An array of indices corresponding to the elements in the sub-array.
 */
export const getArrayIndicesFromOriginal = (arr: number[], subArr: number[]): number[] => {
    const result = [] as number[]
    const arrCopy = [...arr]; // Create a copy of the array to prevent modification
    for (let i = 0; i < subArr.length; i++) {
        const index = arrCopy.indexOf(subArr[i] as number)
        if (index !== -1) {
            result.push(index)
            arrCopy[index] = -1
        }
    }
    return result
}

// console.log('getArrayIndecesFromOriginal', allCombinations(example, 300).map((subArr) => getArrayIndicesFromOriginal(example, subArr)), { example })

const deliveryVehicleSetupStringToSchema = (deliveryVehicleSetupString: string, schema = deliveryVehicleSetupSchema) => {
    const strArray = deliveryVehicleSetupString.split('\n').filter(Boolean);
    const deliverySetup = schema.safeParse(strArray);

    if (!deliverySetup.success) {
        const validationError = fromError(deliverySetup.error);
        console.error(validationError.toString());
        return null; // Early return on failure to parse
    }

    return deliverySetup.data ? { ...deliverySetup.data } : null;
}
export const getDeliveryTimeSetup = async (filePath: string): Promise<DeliveryTimeSetup | null> => {
    const file = await readFile(filePath)
    if (!file) return null
    return deliveryVehicleSetupStringToSchema(file)
}

