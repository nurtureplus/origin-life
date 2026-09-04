import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function AccountForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      scope="customer"
      label="Mobile number or email"
      placeholder="10-digit mobile number"
      backHref="/account/login"
      backLabel="Back to sign in"
    />
  );
}
