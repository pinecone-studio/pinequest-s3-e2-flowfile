export default function StepQuestions({ questions, setQuestions, setStep }: any) {
  return (
    <>
      <button onClick={() => setQuestions([...questions, { text: "q" }])}>
        add
      </button>
      <button onClick={() => setStep(4)}>Next</button>
    </>
  )
}