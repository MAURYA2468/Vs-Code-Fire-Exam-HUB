import AuthLayout from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";

export default function TeacherSignupPage() {
  return (
    <AuthLayout>
      <AuthForm mode="signup" userRole="teacher" />
    </AuthLayout>
  );
}
