import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit and exceljs read data files (font metrics, XML templates) from their
  // own package directories at runtime, which breaks once they're bundled into
  // the server build. Keeping them external leaves them as plain requires.
  serverExternalPackages: ["pdfkit", "exceljs", "sharp"],

  // A production build and `next dev` both write to `.next` by default, and a
  // build run while the dev server is up leaves it serving a mix of production
  // manifests and dev chunks — which shows up as random routes 404ing even
  // though the code is fine. Set NEXT_DIST_DIR to build somewhere else:
  //   NEXT_DIST_DIR=.next-build npm run build
  // Unset, this is exactly the default.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
