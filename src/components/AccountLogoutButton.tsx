"use client";

import { useRouter } from "next/navigation";
import { clearCustomer } from "@/lib/use-customer";
import { buttonClass } from "@/lib/button";

export function AccountLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Drop the cached session straight away, otherwise the header keeps showing
    // the signed-out customer's name until the next full page load.
    clearCustomer();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className={buttonClass({ variant: "secondary" })}
    >
      Sign out
    </button>
  );
}
