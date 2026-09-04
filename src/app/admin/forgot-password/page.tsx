import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Admin — Forgot password",
};

export default function AdminForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="flex justify-center pt-16">
        <Logo variant="light" size="md" href={null} showTagline={false} />
      </div>
      <ForgotPasswordForm
        scope="admin"
        label="Admin email"
        placeholder="admin@originlife.co"
        backHref="/admin/login"
        backLabel="Back to admin sign in"
      />
    </div>
  );
}
