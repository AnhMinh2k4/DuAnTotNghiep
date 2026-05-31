type CurrencyValue = number | string | {
  toNumber?: () => number;
  toString: () => string;
};

export function currencyToNumber(value: CurrencyValue) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value.toString());
}

export function formatCurrency(value: CurrencyValue) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(currencyToNumber(value));
}
