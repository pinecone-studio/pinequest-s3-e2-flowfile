export type SubmissionItem = {
  id: string;
  score: string;
  status: "active" | "graded" | "in-progress" | "not-submitted";
  studentName: string;
  subtitle: string;
};

export type ReviewSubmission = {
  assignmentTitle: string;
  feedbackDraft: string;
  grader: string;
  id: string;
  questionBody: string;
  questionTitle: string;
  score: number;
  scoreMax: number;
  status: SubmissionItem["status"];
  studentName: string;
  studentResponse: string[];
  subtitle: string;
  wordCount: number;
};

export const reviewSubmissions: ReviewSubmission[] = [
  {
    id: "saikhnaa",
    assignmentTitle: "Final Thesis Review",
    feedbackDraft: "Strong thesis and vivid evidence. Tighten the second paragraph and clarify the final comparison.",
    grader: "Eleanor Vance",
    questionBody:
      "Focus on the shift from agrarian to urban centers and how rapid population growth outpaced infrastructure. Discuss specific legislative acts or contemporary accounts that highlighted these conditions.",
    questionTitle:
      "Analyze the socio-economic implications of the Industrial Revolution on urban housing in 19th-century London.",
    score: 17,
    scoreMax: 20,
    status: "active",
    studentName: "Saikhnaa A.",
    studentResponse: [
      "The transformative arc of the 19th century remains one of the most stark examples of human progress clashing with human dignity. As steam-powered factories replaced the quiet rhythms of the English countryside, London found itself the epicenter of a tectonic shift.",
      "By 1851, for the first time in history, more people in Britain lived in cities than in rural areas. The housing infrastructure, largely unregulated and built for profit over habitability, developed into cramped and unsanitary districts.",
      "Legislatively, the response was agonizingly slow. The Public Health Act of 1848 represented a turning point, yet it took years for effective reforms to reach the poorest neighborhoods.",
    ],
    subtitle: "Pending Grade",
    wordCount: 1248,
  },
  {
    id: "julian",
    assignmentTitle: "Final Thesis Review",
    feedbackDraft: "Good structure, but the argument needs stronger support from named sources.",
    grader: "Eleanor Vance",
    questionBody: "Review and grade the submission.",
    questionTitle: "Industrial era essay response",
    score: 18.5,
    scoreMax: 20,
    status: "graded",
    studentName: "Julian Thorne",
    studentResponse: ["Previously graded response."],
    subtitle: "18.5 / 20",
    wordCount: 980,
  },
  {
    id: "maya",
    assignmentTitle: "Final Thesis Review",
    feedbackDraft: "Draft saved.",
    grader: "Eleanor Vance",
    questionBody: "Review and grade the submission.",
    questionTitle: "Industrial era essay response",
    score: 0,
    scoreMax: 20,
    status: "in-progress",
    studentName: "Maya Patel",
    studentResponse: ["Draft saved review."],
    subtitle: "Draft Saved",
    wordCount: 0,
  },
  {
    id: "leo",
    assignmentTitle: "Final Thesis Review",
    feedbackDraft: "",
    grader: "Eleanor Vance",
    questionBody: "Review and grade the submission.",
    questionTitle: "Industrial era essay response",
    score: 0,
    scoreMax: 20,
    status: "not-submitted",
    studentName: "Leo Sterling",
    studentResponse: ["No submission yet."],
    subtitle: "Not Submitted",
    wordCount: 0,
  },
];

export function getSubmissionById(id: string) {
  return reviewSubmissions.find((submission) => submission.id === id) ?? reviewSubmissions[0];
}
