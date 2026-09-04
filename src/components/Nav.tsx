"use client";

import Link from "next/link";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useCustomer } from "@/lib/use-customer";
import { Logo } from "@/components/Logo";
import { ShopByConcernMenu } from "@/components/ShopByConcernMenu";
import { MobileNav } from "@/components/MobileNav";

export function Nav() {
  const items = useCartStore((s) => s.items);
  const open = useCartStore((s) => s.open);
  const mounted = useHasMounted();
  const { customer } = useCustomer();

  const count = mounted ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="container-page relative flex h-18 items-center justify-between py-2.5">
        <Logo size="sm" />

        {/* self-stretch so the dropdown's `top-full` resolves to the bottom of
            the header row, not the middle of it. */}
        <nav className="hidden items-center gap-7 self-stretch text-sm text-ink-soft md:flex">
          <ShopByConcernMenu />
          <Link href="/products?bestseller=1" className="transition hover:text-ink">
            Best Sellers
          </Link>
          <Link href="/about" className="transition hover:text-ink">
            About Us
          </Link>
          <Link href="/blog" className="transition hover:text-ink">
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href={customer ? "/account" : "/account/login"}
            className="hidden items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition hover:border-ink hover:text-ink sm:flex"
          >
            {customer ? (
              <>
                <span>{customer.name.split(" ")[0]}</span>
                {customer.lifeCoins > 0 && (
                  <span
                    title={`${customer.lifeCoins} Life Coins`}
                    className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                  >
                    {customer.lifeCoins}
                  </span>
                )}
              </>
            ) : (
              "Login"
            )}
          </Link>

          <button
            onClick={open}
            aria-label={`Open cart, ${count} items`}
            className="group flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm transition hover:border-ink"
          >
            <span>Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs font-medium text-paper">
              {count}
            </span>
          </button>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
