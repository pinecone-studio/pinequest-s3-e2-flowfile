export default function StudentSidebar({ attempts, users }: any) {
  return (
    <div className="border p-3">
      {attempts.map((a: any) => {
        const user = users.find((u: any) => u.id === a.studentId)

        return (
          <div key={a.id} className="p-2 border-b">
            {user?.name}
          </div>
        )
      })}
    </div>
  )
}