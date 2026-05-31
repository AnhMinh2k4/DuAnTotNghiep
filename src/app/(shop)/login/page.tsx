import { redirect } from "next/navigation";
import { AuthForm } from "@/components/shop/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/account");
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <AuthForm mode="login" />
    </main>
  );
}
