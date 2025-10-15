
import SubmissionDetailsViewer from "@/components/student/SubmissionDetailsViewer";

export default function StudentResultDetailsPage({ params }: { params: { submissionId: string } }) {
  return <SubmissionDetailsViewer submissionId={params.submissionId} />;
}
