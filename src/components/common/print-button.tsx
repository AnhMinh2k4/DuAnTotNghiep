"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "In hóa đơn" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="hm-btn-primary print:hidden">
      <Printer size={16} />
      {label}
    </button>
  );
}
