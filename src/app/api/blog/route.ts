import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { BLOG_CATEGORIES, isBlogCategory } from "@/lib/blog";
import { readJsonBody, badRequest } from "@/lib/request";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const category = req.nextUrl.searchParams.get("category");
  // Drafts are only ever exposed to a signed-in admin.
  const session = all ? await requireAdminSession(req) : null;

  const posts = await prisma.blogPost.findMany({
    where: {
      ...(all && session ? {} : { published: true }),
      ...(isBlogCategory(category) ? { category } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody(req);
  if (!body) return badRequest();
  if (!body.slug || !body.title || !body.content) {
    return NextResponse.json({ error: "Slug, title, and content are required" }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        slug: body.slug,
        title: body.title,
        excerpt: body.excerpt || "",
        content: body.content,
        coverImage: body.coverImage || "/blog/adaptogens.svg",
        category: isBlogCategory(body.category) ? body.category : BLOG_CATEGORIES[0],
        author: body.author || "OriginLife",
        readMinutes: Number(body.readMinutes ?? 4),
        featured: Boolean(body.featured),
        published: body.published !== false,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create post. Check the slug is unique." },
      { status: 400 }
    );
  }
}
