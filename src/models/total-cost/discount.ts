import z from 'zod';



export const discountCodeSchema = z.object({
    code: z.string(),
    discount: z.object({
        value: z.union([
            z.number({
                required_error: 'Discount value is required'
            }).nonnegative({ message: 'Discount percentage cannot be less than 0' }).max(100),
            z.literal('NA')
        ]),
        type: z.enum(['percentage', 'fixed', 'NA'], {
            required_error: 'Discount type is required'
        })
    }),
    distance: z.object({
        min: z.number().min(0),
        max: z.number()
    }).refine(data => data.min < data.max, {
        message: 'Minimum distance should be less than maximum distance',
        path: ['distance']
    }),
    weight: z.object({
        min: z.number().min(0),
        max: z.number()
    }).refine(data => data.min < data.max, {
        message: 'Minimum weight should be less than maximum weight',
        path: ['weight']
    }),
})


export const discountCodeArraySchema = z.array(discountCodeSchema).nonempty().refine(
    data => {
        const codes = data.map(code => code.code);
        return codes.length === new Set(codes).size;
    },
    {
        message: 'Discount codes should be unique',
    }
)

export type DiscountCode = z.infer<typeof discountCodeSchema>
