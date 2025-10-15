import Grader from "@/components/teacher/Grader";

export default function GradeSubmissionPage({ params }: { params: { id: string, submissionId: string } }) {
  return <Grader testId={params.id} submissionId={params.submissionId} />;
}
