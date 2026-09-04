"use client";

import Link from "next/link";
import { useState } from "react";
import { useCustomer } from "@/lib/use-customer";
import { CONCERNS } from "@/lib/concerns";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { customer } = useCustomer();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink"
      >
        {open ? (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 4l12 12M16 4 4 16" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-paper px-6 py-6 shadow-lg">
          <nav className="flex flex-col gap-1 text-sm">
            <Link
              href="/shop-by-concern"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 font-medium text-ink transition hover:bg-paper-soft"
            >
              Shop by Concern
            </Link>
            <div className="grid grid-cols-2 gap-1">
              {CONCERNS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-ink-soft transition hover:bg-paper-soft hover:text-ink"
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <div className="mt-2 border-t border-line pt-2">
              <Link href="/products?bestseller=1" onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-ink-soft transition hover:bg-paper-soft hover:text-ink">
                Best Sellers
              </Link>
              <Link href="/about" onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-ink-soft transition hover:bg-paper-soft hover:text-ink">
                About Us
              </Link>
              <Link href="/blog" onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-ink-soft transition hover:bg-paper-soft hover:text-ink">
                Blog
              </Link>
              <Link
                href={customer ? "/account" : "/account/login"}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-2.5 text-ink-soft transition hover:bg-paper-soft hover:text-ink"
              >
                {customer ? `Account (${customer.name.split(" ")[0]})` : "Login"}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
