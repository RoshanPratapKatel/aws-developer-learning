export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}
