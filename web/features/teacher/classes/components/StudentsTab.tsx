export default function StudentsTab({ classStudents, getStudentStats }: any) {
  return (
    <table className="w-full border">
      <tbody>
        {classStudents.map((s: any, i: number) => {
          const stats = getStudentStats(s.id)

          return (
            <tr key={s.id} className="border-t">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{s.name}</td>
              <td className="p-2">{stats.attendance}%</td>
              <td className="p-2">{stats.avgScore ?? '-'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}