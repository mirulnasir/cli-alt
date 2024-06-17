import { z } from 'zod';

const baseDeliverySchema = z.number().nonnegative()
const numberOfPackagesSchema = z.number({
    invalid_type_error: 'Number of packages should be a number',
}).nonnegative().int('Number of packages should be an integer')
const packageNameSchema = z.string()
const packageWeightSchema = z.number().nonnegative()
const packageDistanceSchema = z.number().nonnegative()
const discountCodeSchema = z.string()
export const deliverySetupSchema = z.tuple([baseDeliverySchema, numberOfPackagesSchema])
export const packageCostArraySchema = z.tuple(
    [
        packageNameSchema,
        packageWeightSchema,
        packageDistanceSchema,
        discountCodeSchema
    ]
)
export type PackageCostSetup = {
    packageName: string;
    packageWeight: number;
    packageDistance: number;
    discountCode: string;
}
const regex = /[\s]+/;

// FIXME : using refine doesn't should error details, need to use superRefine
export const totalCostSetupFileSchema = z.array(z.string()).min(2).refine(
    array => {
        const [setup] = array
        if (!setup) return false
        return deliverySetupSchema.safeParse(setup.trim().split(regex).map(Number)).success
    },
    {
        message: 'Invalid setup',

    }
).refine(
    array => {
        const [_, ...packageCosts] = array
        packageCosts.forEach(packageCost => {
            return packageCostArraySchema.safeParse(packageCost.trim().split(regex)).success
        })
        return true
    },
    {
        message: 'Invalid package costs',
    }
)
    .transform(array => {
        const [setup, ...packageCosts] = array
        if (!setup) throw new Error('Invalid setup')
        if (!packageCosts.length) throw new Error('Invalid package costs')
        const [baseDeliveryCost, numberOfPackages] = setup.split(' ').map(Number)
        const packageCostSetup = packageCosts.map(packageCost => {
            const [packageName, packageWeight, packageDistance, discountCode] = packageCost.trim().split(regex)
            return {
                packageName: packageName as string,
                packageWeight: Number(packageWeight),
                packageDistance: Number(packageDistance),
                discountCode: discountCode as string
            }
        })
        return {
            baseDeliveryCost: Number(baseDeliveryCost),
            numberOfPackages: Number(numberOfPackages),
            packageCostSetup
        }
    }
    )

export type TotalCostSetup = z.infer<typeof totalCostSetupFileSchema>
