/**
 * Shared pricing helpers to avoid duplicated discount/subtotal logic.
 */

/**
 * Returns price after applying discount percentage.
 * @param price - Original price
 * @param discountPercentage - Optional discount (0–100). If undefined/0, returns price.
 */
export function getDiscountedPrice(
  price: number,
  discountPercentage?: number | null
): number {
  if (!discountPercentage || discountPercentage <= 0) return price;
  return price * (1 - discountPercentage / 100);
}

/**
 * Returns subtotal for an item: (price after discount) * quantity.
 */
export function getItemSubtotal(
  price: number,
  quantity: number,
  discountPercentage?: number | null
): number {
  return getDiscountedPrice(price, discountPercentage) * quantity;
}
