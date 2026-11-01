import type { APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";

export async function handler(): Promise<APIGatewayProxyResult> {
  return createResponse(200, null);
}
