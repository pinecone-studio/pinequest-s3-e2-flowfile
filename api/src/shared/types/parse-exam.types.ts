export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay';
export type SubjectProfile =
  | 'mongolian_language'
  | 'language'
  | 'math'
  | 'chemistry'
  | 'science'
  | 'social_science'
  | 'generic';
export type SectionType =
  | 'meta'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'essay'
  | 'multiple_choice'
  | 'short_answer'
  | 'table_context'
  | 'generic';

export type ImportedQuestionPayload = {
  question?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
  timerMinutes?: number;
  imageUrl?: string;
};

export type RawQuestionBlock = {
  questionNumber: number;
  rawBlock: string;
  sectionType?: SectionType;
  sharedContext?: string;
  imageMarker?: string;
};

export type PendingSharedContext = {
  text?: string;
  imageMarker?: string;
  sectionType?: SectionType;
};

export type AnthropicResponse = {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  error?: {
    message?: string;
  };
};

export type ParseExamResult = {
  questions: ImportedQuestionPayload[];
  parser: 'anthropic' | 'local';
  fileType: string;
  subjectProfile: SubjectProfile;
};
