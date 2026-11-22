import { listProducts } from "../../lambda_code/data/list-products";
import { handler } from "../../lambda_code/query_products";
import { listProductsEvent } from "../fixtures/api-gateway-events";

jest.mock("../../lambda_code/data/list-products");

test("passes the requested category to the listing helper and returns its products", async () => {
  const products = [{ id: "p1", category: "Audio" }];
  jest.mocked(listProducts).mockResolvedValue(products);

  const response = await handler(listProductsEvent({ category: "Audio" }));

  expect(listProducts).toHaveBeenCalledWith("Audio");
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body)).toEqual(products);
});
