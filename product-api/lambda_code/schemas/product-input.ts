import { z } from "zod";

const priceSchema = z.number()
  .positive()
  .max(99_999_999.99)
  .refine(price => price === Number(price.toFixed(2)), {
    message: "Price must have at most two decimal places",
  });

export const productInputSchema = z.strictObject({
  title: z.string().min(1).max(200),
  category: z.enum(["Electronics", "Audio", "Computers", "Accessories", "Home"]),
  description: z.string().min(1).max(1000),
  price: priceSchema,
});

export type ProductInput = z.infer<typeof productInputSchema>;
