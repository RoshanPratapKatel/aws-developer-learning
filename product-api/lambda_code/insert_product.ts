import type { APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";

export async function handler(): Promise<APIGatewayProxyResult> {
  return createResponse(501, {
    error: "NotImplementedError",
    message:
      "POST /products is implemented in the data module of this learning plan",
  });
}
