import TestGate from "@/components/student/TestGate";

export default function TakeTestPage({ params }: { params: { id: string } }) {
  return <TestGate testId={params.id} />;
}
