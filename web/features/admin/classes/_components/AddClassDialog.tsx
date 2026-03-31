import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { User } from '@/lib/types'

export function AddClassDialog({ open, onOpenChange, teachers }: {
  open: boolean; onOpenChange: (open: boolean) => void; teachers: User[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Шинэ анги нэмэх</DialogTitle>
          <DialogDescription>Ангийн мэдээллийг оруулна уу.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="className">Ангийн нэр</Label>
            <Input id="className" placeholder="Жишээ: 10А" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">Түвшин</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Түвшин сонгох" /></SelectTrigger>
              <SelectContent>
                {['7','8','9','10','11','12'].map(g => (
                  <SelectItem key={g} value={g}>{g}-р анги</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher">Ангийн багш</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Багш сонгох" /></SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Цуцлах</Button>
          <Button onClick={() => onOpenChange(false)}>Хадгалах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
