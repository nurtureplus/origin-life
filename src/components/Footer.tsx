import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper text-ink">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="light" size="md" href={null} />
            <p className="mt-4 max-w-xs text-sm text-ink-soft">
              Precision nutraceuticals formulated at clinical doses. Third-party
              tested. Built to stack.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/products" className="text-ink-soft transition hover:text-ink">All products</Link></li>
              <li><Link href="/shop-by-concern" className="text-ink-soft transition hover:text-ink">Shop by Concern</Link></li>
              <li><Link href="/products?bestseller=1" className="text-ink-soft transition hover:text-ink">Best Sellers</Link></li>
              <li><Link href="/products?category=Energy" className="text-ink-soft transition hover:text-ink">Energy</Link></li>
              <li><Link href="/products?category=Sleep" className="text-ink-soft transition hover:text-ink">Sleep</Link></li>
              <li><Link href="/products?category=Focus" className="text-ink-soft transition hover:text-ink">Focus</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/about" className="text-ink-soft transition hover:text-ink">About Us</Link></li>
              <li><Link href="/blog" className="text-ink-soft transition hover:text-ink">Blog</Link></li>
              <li><Link href="/#science" className="text-ink-soft transition hover:text-ink">Science</Link></li>
              <li><Link href="/admin/login" className="text-ink-soft transition hover:text-ink">Admin</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">Support</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/account" className="text-ink-soft transition hover:text-ink">My account</Link></li>
              <li><Link href="/contact" className="text-ink-soft transition hover:text-ink">Contact us</Link></li>
              <li><Link href="/faq" className="text-ink-soft transition hover:text-ink">FAQ</Link></li>
              <li><Link href="/shipping-policy" className="text-ink-soft transition hover:text-ink">Shipping &amp; delivery</Link></li>
              <li><Link href="/returns-policy" className="text-ink-soft transition hover:text-ink">Returns &amp; refunds</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-faint">
            <li><Link href="/privacy-policy" className="transition hover:text-ink">Privacy Policy</Link></li>
            <li><Link href="/terms" className="transition hover:text-ink">Terms &amp; Conditions</Link></li>
            <li><Link href="/disclaimer" className="transition hover:text-ink">Disclaimer</Link></li>
          </ul>

          <div className="mt-6 flex flex-col gap-4 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} OriginLife. All rights reserved.</p>
            <p className="max-w-md sm:text-right">
              Nutritional supplements, not medicines. Not intended to diagnose, treat, cure or
              prevent any disease. These statements have not been evaluated by any regulatory
              authority.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
