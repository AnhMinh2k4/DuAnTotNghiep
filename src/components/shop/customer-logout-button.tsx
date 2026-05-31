"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function CustomerLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="hm-btn-secondary">
      <LogOut size={16} />
      Đăng xuất
    </button>
  );
}
