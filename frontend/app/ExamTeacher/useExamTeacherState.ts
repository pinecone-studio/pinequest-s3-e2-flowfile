"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createChoiceOption,
  createQuestion,
  createQuestionPreview,
  getInitialContent,
  getQuestionTypeUpdate,
  getStoredExamPayload,
  updateQuestion,
} from "./helpers";
import { initialExamSettings, initialExamSummary, teacherQuestions } from "./mockData";
import type { ExamSummary, TeacherQuestionType } from "./types";

export function useExamTeacherState() {
  const router = useRouter();
  const [questions, setQuestions] = useState(teacherQuestions);
  const [activeId, setActiveId] = useState(teacherQuestions[3]?.id ?? teacherQuestions[0].id);
  const [contentById, setContentById] = useState<Record<string, string>>(
    getInitialContent(teacherQuestions),
  );
  const [settings, setSettings] = useState(initialExamSettings);
  const [summary, setSummary] = useState(initialExamSummary);
  const activeQuestion = questions.find((question) => question.id === activeId) ?? questions[0];

  function handleChangeContent(value: string) {
    setContentById((current) => ({ ...current, [activeQuestion.id]: value }));
    setQuestions((current) =>
      updateQuestion(current, activeQuestion.id, (question) => ({
        ...question,
        preview: createQuestionPreview(value),
        prompt: value,
      })),
    );
  }

  function handleSelectType(type: TeacherQuestionType) {
    setQuestions((current) =>
      updateQuestion(current, activeQuestion.id, (question) =>
        getQuestionTypeUpdate(question, type),
      ),
    );
  }

  function handleCreateQuestion() {
    const newQuestion = createQuestion(questions.length + 1);
    setQuestions((current) => [...current, newQuestion]);
    setContentById((current) => ({ ...current, [newQuestion.id]: newQuestion.prompt }));
    setActiveId(newQuestion.id);
  }

  function handleNavigate(mode: "draft" | "finalized") {
    sessionStorage.setItem("teacherExamStatus", mode);
    sessionStorage.setItem("teacherExamPayload", getStoredExamPayload(summary));
    router.push("/TeacherDashboard");
  }

  function handleDiscardQuestion() {
    if (questions.length === 1) {
      return;
    }

    const nextQuestions = questions.filter((question) => question.id !== activeQuestion.id);
    setQuestions(nextQuestions);
    setActiveId(nextQuestions[0].id);
  }

  return {
    activeQuestion,
    contentById,
    questions,
    settings,
    summary,
    setActiveId,
    handleAddOption: () =>
      setQuestions((current) =>
        updateQuestion(current, activeQuestion.id, (question) => ({
          ...question,
          options: [...(question.options ?? []), createChoiceOption(question.options?.length ?? 0)],
        })),
      ),
    handleAddToExam: () =>
      setQuestions((current) =>
        updateQuestion(current, activeQuestion.id, (question) => ({ ...question, inExam: true })),
      ),
    handleChangeContent,
    handleChangePoints: (value: number) =>
      setQuestions((current) =>
        updateQuestion(current, activeQuestion.id, (question) => ({
          ...question,
          points: Math.max(0, value),
        })),
      ),
    handleChangeSummary: (field: keyof ExamSummary, value: number) =>
      setSummary((current) => ({ ...current, [field]: Math.max(0, value) })),
    handleChangeTimer: (field: "timerMinutes" | "timerSeconds", value: number) =>
      setQuestions((current) =>
        updateQuestion(current, activeQuestion.id, (question) => ({
          ...question,
          [field]: Math.max(0, value),
        })),
      ),
    handleCreateQuestion,
    handleDiscardQuestion,
    handleNavigate,
    handleOptionChange: (optionId: string, value: string) =>
      setQuestions((current) =>
        updateQuestion(current, activeQuestion.id, (question) => ({
          ...question,
          options: question.options?.map((option) =>
            option.id === optionId ? { ...option, text: value } : option,
          ),
        })),
      ),
    handleRemoveOption: (optionId: string) =>
      setQuestions((current) =>
        updateQuestion(current, activeQuestion.id, (question) => ({
          ...question,
          options: question.options?.filter((option) => option.id !== optionId),
        })),
      ),
    handleSelectCorrectOption: (optionId: string) =>
      setQuestions((current) =>
        updateQuestion(current, activeQuestion.id, (question) => ({
          ...question,
          options: question.options?.map((option) => ({
            ...option,
            isCorrect: option.id === optionId,
          })),
        })),
      ),
    handleSelectType,
    handleToggleSetting: (field: "lockNavigation" | "randomizeOrder") =>
      setSettings((current) => ({ ...current, [field]: !current[field] })),
  };
}
