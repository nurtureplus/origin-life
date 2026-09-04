import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toProductDTO } from "@/lib/format";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-display text-3xl font-medium">Edit product</h1>
      <div className="mt-8">
        <ProductForm product={toProductDTO(product)} />
      </div>
    </div>
  );
}
