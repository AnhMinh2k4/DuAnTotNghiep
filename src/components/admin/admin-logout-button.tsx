"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="hm-btn-secondary h-10 px-4">
      <LogOut size={16} />
      <span className="hidden sm:inline">Đăng xuất</span>
    </button>
  );
}
