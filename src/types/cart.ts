export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  stock: number;
  variantId?: number;
  variantSku?: string;
  variantName?: string;
  selectedOptions?: Record<string, string>;
};

export type CheckoutPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  provinceId: number;
  shippingAddress: string;
  paymentMethod?: "COD" | "BANK_TRANSFER";
  note?: string;
  couponCode?: string;
  items: Array<{
    productId: number;
    variantId?: number;
    selectedOptions?: Record<string, string>;
    quantity: number;
  }>;
};
