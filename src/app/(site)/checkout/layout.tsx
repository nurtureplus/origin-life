import type { Metadata } from "next";

// Nothing under /checkout is meant for search results — it is either
// per-customer or a step in a purchase. robots.txt already disallows the path;
// this covers the case where a URL is reached some other way and indexed
// anyway, which a Disallow rule alone does not prevent.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
