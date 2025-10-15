import AuthLayout from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";

export default function TeacherLoginPage() {
  return (
    <AuthLayout>
      <AuthForm mode="login" userRole="teacher" />
    </AuthLayout>
  );
}
