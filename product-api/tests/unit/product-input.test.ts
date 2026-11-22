import { productInputSchema } from "../../lambda_code/schemas/product-input";

const keyboard = {
  title: "Wireless keyboard",
  category: "Computers",
  description: "Compact keyboard with a USB receiver",
  price: 29.99,
};

test.each([0.01, 29.99, 99_999_999.99])("accepts a product priced at %p", price => {
  const input = { ...keyboard, price };
  expect(productInputSchema.parse(input)).toEqual(input);
});

test.each([0, -1, 29.999, 100_000_000, "29.99"])("rejects invalid price %p", price => {
  const result = productInputSchema.safeParse({ ...keyboard, price });
  expect(result.error?.issues).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: ["price"] }),
  ]));
});

test("reports invalid fields together, including a missing description", () => {
  const result = productInputSchema.safeParse({ title: "", category: "Books", price: 5 });
  expect(result.error?.issues.map(issue => issue.path[0]).sort())
    .toEqual(["category", "description", "title"]);
});

test.each([
  { title: "x".repeat(201) },
  { description: "x".repeat(1001) },
  { id: "client-supplied" },
])("rejects out-of-contract input", fields => {
  expect(productInputSchema.safeParse({ ...keyboard, ...fields }).success).toBe(false);
});
