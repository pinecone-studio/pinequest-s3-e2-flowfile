export default function ResultsList({ results }: any) {
  return (
    <div>
      {results.map((r: any) => (
        <div key={r.id}>{r.id}</div>
      ))}
    </div>
  )
}