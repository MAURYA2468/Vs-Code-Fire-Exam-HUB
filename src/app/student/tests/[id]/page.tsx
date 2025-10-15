import TestTaker from "@/components/student/TestTaker";
import { Test } from "@/lib/types";

// This component is a wrapper to fetch data on the server if possible,
// but the actual test taking logic which relies on localStorage will be client-side.
// In this fully-offline model, we can't do server-side fetching, so we just pass the ID.

export default function TakeTestPage({ params }: { params: { id: string } }) {
  return <TestTaker testId={params.id} />;
}
