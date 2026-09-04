import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromoForm } from "@/components/admin/PromoForm";

export default async function EditPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promo = await prisma.promo.findUnique({ where: { id } });
  if (!promo) notFound();

  return (
    <div>
      <h1 className="text-display text-3xl font-medium">Edit hero slide</h1>
      <div className="mt-8">
        <PromoForm promo={promo} />
      </div>
    </div>
  );
}
