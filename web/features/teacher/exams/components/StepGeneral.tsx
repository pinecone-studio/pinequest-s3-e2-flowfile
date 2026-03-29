export default function StepGeneral({ title, setTitle, setStep }: any) {
  return (
    <>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button onClick={() => setStep(3)}>Next</button>
    </>
  )
}