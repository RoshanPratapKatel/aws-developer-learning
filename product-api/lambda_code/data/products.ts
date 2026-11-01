import { Product } from "../types";

// Temporary in-memory catalog; persistent storage comes in a later lesson.
export const PRODUCTS: Record<string, Product > = {
  prod_001: {
    id: "prod_001",
    name: "Wireless Headphones",
    price: 199.99,
    category: "Electronics",
  },
  prod_002: {
    id: "prod_002",
    name: "USB-C Cable",
    price: 12.99,
    category: "Electronics",
  },
  prod_003: {
    id: "prod_003",
    name: "Ceramic Mug",
    price: 8.49,
    category: "Home Goods",
  },
};