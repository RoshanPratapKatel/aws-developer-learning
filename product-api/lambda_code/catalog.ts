import { PRODUCTS } from "./data/products";
import type { ApiResponse, Product } from "./types";

export function createResponse(
  statusCode: number,
  body: object | null,
): ApiResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: body === null ? "" : JSON.stringify(body),
  };
}

export function getProduct(productId: string): Product | undefined {
  return Object.hasOwn(PRODUCTS, productId) ? PRODUCTS[productId] : undefined;
}

export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS);
}

export function getProductsByCategory(category: string): Product[] {
  return getAllProducts().filter(
    (product) => product.category.toLowerCase() === category.toLowerCase(),
  );
}