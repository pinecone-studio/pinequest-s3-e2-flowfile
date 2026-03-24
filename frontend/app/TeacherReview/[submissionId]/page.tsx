import { getSubmissionById } from "../data";
import { ReviewDetailClient } from "./ReviewDetailClient";

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const submission = getSubmissionById(submissionId);

  return <ReviewDetailClient submission={submission} />;
}
