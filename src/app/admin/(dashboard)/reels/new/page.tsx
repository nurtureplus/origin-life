import { ReelForm } from "@/components/admin/ReelForm";

export default function NewReelPage() {
  return (
    <div>
      <h1 className="text-display text-3xl font-medium">New reel</h1>
      <div className="mt-8">
        <ReelForm />
      </div>
    </div>
  );
}
