
import SubmissionViewer from "@/components/teacher/SubmissionViewer";

export default function SubmissionPage({ params }: { params: { id: string, submissionId: string } }) {
  return <SubmissionViewer testId={params.id} submissionId={params.submissionId} />;
}
