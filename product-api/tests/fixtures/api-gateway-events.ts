import type { APIGatewayProxyEvent } from "aws-lambda";

interface ProductRequest {
  method: "GET" | "POST" | "PUT";
  id?: string;
  category?: string;
  body?: string;
  userArn?: string;
}

function productEvent({ method, id, category, body, userArn }: ProductRequest): APIGatewayProxyEvent {
  const path = id === undefined ? "/products" : `/products/${id}`;
  const resource = id === undefined ? "/products" : "/products/{id}";

  return {
    httpMethod: method,
    path,
    resource,
    pathParameters: id === undefined ? null : { id },
    queryStringParameters: category === undefined ? null : { category },
    multiValueQueryStringParameters: category === undefined ? null : { category: [category] },
    headers: { "Content-Type": "application/json" },
    multiValueHeaders: { "Content-Type": ["application/json"] },
    body: body ?? null,
    isBase64Encoded: false,
    stageVariables: null,
    requestContext: {
      accountId: "123456789012",
      apiId: "test-api",
      authorizer: undefined,
      httpMethod: method,
      path: `/dev${path}`,
      protocol: "HTTP/1.1",
      requestId: "test-request",
      requestTimeEpoch: 0,
      resourceId: "test-resource",
      resourcePath: resource,
      stage: "dev",
      identity: {
        accessKey: null, accountId: null, apiKey: null, apiKeyId: null, caller: null,
        clientCert: null, cognitoAuthenticationProvider: null, cognitoAuthenticationType: null,
        cognitoIdentityId: null, cognitoIdentityPoolId: null, principalOrgId: null,
        sourceIp: "127.0.0.1", user: null, userAgent: "jest", userArn: userArn ?? null,
      },
    },
  };
}

export function getProductEvent(id: string) {
  return productEvent({ method: "GET", id });
}

export function listProductsEvent({ category }: { category?: string } = {}) {
  return productEvent({ method: "GET", category });
}

export function postProductEvent(product: unknown, { userArn }: { userArn?: string } = {}) {
  return productEvent({ method: "POST", body: JSON.stringify(product), userArn });
}

export function putProductEvent(id: string, product: unknown, { userArn }: { userArn?: string } = {}) {
  return productEvent({ method: "PUT", id, body: JSON.stringify(product), userArn });
}
