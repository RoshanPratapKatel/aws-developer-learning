import type { ApiResponse } from "./types";

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
