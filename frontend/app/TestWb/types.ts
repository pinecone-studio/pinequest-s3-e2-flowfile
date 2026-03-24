export type QuestionKind = "text" | "essay" | "choice";

export type ChoiceOption = {
  id: string;
  label: string;
  text: string;
  isCorrect?: boolean;
};

export type QuestionItem = {
  id: string;
  badge: string;
  prompt: string;
  helperText: string;
  kind: QuestionKind;
  visual?: "atom";
  mathLines?: string[];
  placeholder: string;
  choices?: ChoiceOption[];
};
