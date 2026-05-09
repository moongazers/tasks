import { product, type Product } from "../data/products";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let cartCount = 0;
const skuStock: Record<string, number> = {};

function initStock() {
  product.skus.forEach((sku) => {
    skuStock[sku.id] = sku.stock;
  });
}
initStock();

export async function fetchProduct(): Promise<Product> {
  await delay(600);
  return product;
}

export interface AddToCartResult {
  success: boolean;
  cartCount: number;
  remainingStock: number;
}

export async function addToCart(
  skuId: string,
  quantity: number
): Promise<AddToCartResult> {
  await delay(300);
  const current = skuStock[skuId] ?? 0;
  if (current < quantity) {
    throw new Error("Insufficient stock");
  }
  skuStock[skuId] = current - quantity;
  cartCount += quantity;
  return { success: true, cartCount, remainingStock: skuStock[skuId] };
}
