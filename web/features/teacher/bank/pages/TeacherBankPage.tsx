'use client'

import { useExamBank } from "@/hooks/use-examBank"
import BankHeader from "../components/BankHeader"
import BankList from "../components/BankList"

export default function TeacherBankPage() {
  const { exams } = useExamBank()

  return (
    <div className="p-6">
      <BankHeader />
      <BankList exams={exams} />
    </div>
  )
}