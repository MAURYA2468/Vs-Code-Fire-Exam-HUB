import AuthLayout from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";

export default function StudentLoginPage() {
  return (
    <AuthLayout>
      <AuthForm mode="login" userRole="student" />
    </AuthLayout>
  );
}
