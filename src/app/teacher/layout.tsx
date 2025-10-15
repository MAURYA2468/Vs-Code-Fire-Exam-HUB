import AppLayout from "@/components/main/AppLayout";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout requiredRole="teacher">{children}</AppLayout>;
}
