import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReelForm } from "@/components/admin/ReelForm";

export default async function EditReelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reel = await prisma.reel.findUnique({ where: { id } });
  if (!reel) notFound();

  return (
    <div>
      <h1 className="text-display text-3xl font-medium">Edit reel</h1>
      <div className="mt-8">
        <ReelForm reel={reel} />
      </div>
    </div>
  );
}
