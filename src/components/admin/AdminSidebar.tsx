"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/promos", label: "Hero slides" },
  { href: "/admin/reels", label: "Reels" },
  { href: "/admin/blog", label: "Blog" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-paper-soft px-4 py-6">
      <div className="px-2">
        <Logo size="sm" showTagline={false} />
      </div>
      <span className="mt-1 px-2 text-xs text-ink-faint">Admin</span>

      <nav className="mt-8 flex flex-col gap-1">
        {links.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-ink text-paper" : "text-ink-soft hover:bg-line/50 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <Link href="/" className="rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-line/50 hover:text-ink">
          ← View store
        </Link>
        <button
          onClick={logout}
          className="rounded-lg px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-line/50 hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
