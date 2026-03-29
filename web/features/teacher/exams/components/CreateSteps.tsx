import StepSource from "./StepSource"
import StepGeneral from "./StepGeneral"
import StepQuestions from "./StepQuestions"
import StepSchedule from "./StepSchedule"

export default function CreateSteps(props: any) {
  const { step } = props

  return (
    <div className="flex-1 p-4">
      {step === 1 && <StepSource {...props} />}
      {step === 2 && <StepGeneral {...props} />}
      {step === 3 && <StepQuestions {...props} />}
      {step === 4 && <StepSchedule {...props} />}
    </div>
  )
}