import { AdminShellFeature } from '@/features/admin/admin-shell'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShellFeature>{children}</AdminShellFeature>
}
