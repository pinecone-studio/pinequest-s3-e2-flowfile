export default function GradingHeader({ count }: any) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold">Үнэлгээ</h1>
      <p className="text-sm text-gray-500">
        {count} шалгалт үнэлгээ хүлээж байна
      </p>
    </div>
  )
}