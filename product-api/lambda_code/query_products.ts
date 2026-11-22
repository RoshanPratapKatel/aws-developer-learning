import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";
import { listProducts } from "./data/list-products";

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const products = await listProducts(event.queryStringParameters?.category);

    return createResponse(200, products);
  } catch (error) {
    console.error("Error querying products:", error);
    return createResponse(500, { error: "Internal server error" });
  }
}
