import TestResults from "@/components/teacher/TestResults";

export default function TestResultsPage({ params }: { params: { id: string } }) {
  return <TestResults testId={params.id} />;
}
