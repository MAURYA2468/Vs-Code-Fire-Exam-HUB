import AuthLayout from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";

export default function StudentSignupPage() {
  return (
    <AuthLayout>
      <AuthForm mode="signup" userRole="student" />
    </AuthLayout>
  );
}
