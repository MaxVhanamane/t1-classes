export function formatPriceWithComma(price: number | string): string {
    const num = typeof price === "string" ? Number(price) : price;

    if (isNaN(num)) return "0";

    return num.toLocaleString("en-IN"); // Indian format
}
