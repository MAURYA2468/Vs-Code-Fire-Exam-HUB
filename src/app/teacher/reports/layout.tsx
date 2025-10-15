import AppLayout from "@/components/main/AppLayout";

export default function TeacherReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout requiredRole="teacher">{children}</AppLayout>;
}