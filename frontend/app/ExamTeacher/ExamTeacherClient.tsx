"use client";

import { ExamCanvas } from "./ExamCanvas";
import { ExamTeacherHeader } from "./ExamTeacherHeader";
import { QuestionSidebar } from "./QuestionSidebar";
import { TeacherPanel } from "./TeacherPanel";
import { useExamTeacherState } from "./useExamTeacherState";

export function ExamTeacherClient() {
  const state = useExamTeacherState();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f9ff_0%,_#eef4ff_100%)] px-4 py-8 text-slate-900 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ExamTeacherHeader
          onFinalize={() => state.handleNavigate("finalized")}
          onSaveDraft={() => state.handleNavigate("draft")}
        />
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_260px]">
          <QuestionSidebar
            activeId={state.activeQuestion.id}
            onCreateQuestion={state.handleCreateQuestion}
            onSelect={state.setActiveId}
            questions={state.questions}
          />
          <ExamCanvas
            content={state.contentById[state.activeQuestion.id] ?? ""}
            onAddToExam={state.handleAddToExam}
            onAddOption={state.handleAddOption}
            onChangeContent={state.handleChangeContent}
            onDiscard={state.handleDiscardQuestion}
            onOptionChange={state.handleOptionChange}
            onRemoveOption={state.handleRemoveOption}
            onSelectCorrectOption={state.handleSelectCorrectOption}
            onSelectType={state.handleSelectType}
            question={state.activeQuestion}
          />
          <TeacherPanel
            lockNavigation={state.settings.lockNavigation}
            onChangePoints={state.handleChangePoints}
            onChangeSummary={state.handleChangeSummary}
            onChangeTimer={state.handleChangeTimer}
            onToggleSetting={state.handleToggleSetting}
            points={state.activeQuestion.points}
            randomize={state.settings.randomizeOrder}
            summary={state.summary}
            timerMinutes={state.activeQuestion.timerMinutes}
            timerSeconds={state.activeQuestion.timerSeconds}
          />
        </div>
      </div>
    </main>
  );
}
