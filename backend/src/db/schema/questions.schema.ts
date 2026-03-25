import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { exams } from "./exams.schema";

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id),
  orderIndex: integer("order_index").notNull(),
  content: text("content").notNull(),
  inputType: text("input_type", {
    enum: [
      "mcq",
      "short_text",
      "rich_text",
      "math_formula",
      "chem_formula",
      "handwritten",
      "voice_record",
    ],
  }).notNull(),
  subjectHint: text("subject_hint"),
  points: integer("points").notNull().default(1),
  isRequired: integer("is_required", { mode: "boolean" })
    .notNull()
    .default(true),
  optionsJson: text("options_json"), 
  correctAnswer: text("correct_answer"), 
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
