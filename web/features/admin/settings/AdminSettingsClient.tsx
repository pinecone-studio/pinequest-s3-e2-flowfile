'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Bell, Shield, Database, Mail } from 'lucide-react'

export function AdminSettingsClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Тохиргоо</h1>
        <p className="text-muted-foreground">Системийн тохиргоог удирдах</p>
      </div>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2">
          <TabsTrigger value="general" className="gap-2"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Ерөнхий</span></TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Мэдэгдэл</span></TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Аюулгүй байдал</span></TabsTrigger>
          <TabsTrigger value="email" className="gap-2"><Mail className="h-4 w-4" /><span className="hidden sm:inline">И-мэйл</span></TabsTrigger>
          <TabsTrigger value="system" className="gap-2"><Database className="h-4 w-4" /><span className="hidden sm:inline">Систем</span></TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Ерөнхий тохиргоо</CardTitle><CardDescription>Системийн үндсэн тохиргоо</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label htmlFor="siteName">Системийн нэр</Label><Input id="siteName" defaultValue="е-Шалгалт" /></div>
              <div className="space-y-2"><Label htmlFor="language">Хэл</Label><Select defaultValue="mn"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mn">Монгол</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="timezone">Цагийн бүс</Label><Select defaultValue="asia-ulaanbaatar"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asia-ulaanbaatar">Asia/Ulaanbaatar (GMT+8)</SelectItem><SelectItem value="asia-hovd">Asia/Hovd (GMT+7)</SelectItem></SelectContent></Select></div>
              <Separator />
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Засвар үйлчилгээний горим</Label><p className="text-sm text-muted-foreground">Идэвхжүүлсэн үед хэрэглэгчид нэвтрэх боломжгүй</p></div><Switch /></div>
              <Button>Хадгалах</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Мэдэгдлийн тохиргоо</CardTitle><CardDescription>И-мэйл болон системийн мэдэгдлүүд</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Шинэ шалгалтын мэдэгдэл</Label><p className="text-sm text-muted-foreground">Шинэ шалгалт үүсгэсэн үед мэдэгдэл илгээх</p></div><Switch defaultChecked /></div>
              <Separator />
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Шалгалт дуусах мэдэгдэл</Label><p className="text-sm text-muted-foreground">Шалгалт дуусахад мэдэгдэл илгээх</p></div><Switch defaultChecked /></div>
              <Separator />
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Дүн гарсан мэдэгдэл</Label><p className="text-sm text-muted-foreground">Шалгалтын дүн гарсан үед сурагчдад мэдэгдэл илгээх</p></div><Switch defaultChecked /></div>
              <Button>Хадгалах</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Аюулгүй байдал</CardTitle><CardDescription>Нууц үг болон нэвтрэх тохиргоо</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label>Нууц үгийн хамгийн бага урт</Label><Select defaultValue="8"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="6">6 тэмдэгт</SelectItem><SelectItem value="8">8 тэмдэгт</SelectItem><SelectItem value="10">10 тэмдэгт</SelectItem><SelectItem value="12">12 тэмдэгт</SelectItem></SelectContent></Select></div>
              <Separator />
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Хоёр шатлалт баталгаажуулалт</Label><p className="text-sm text-muted-foreground">Админ нарт 2FA шаардах</p></div><Switch /></div>
              <Separator />
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Автомат гарах</Label><p className="text-sm text-muted-foreground">30 минут идэвхгүй байсан бол автомат гарах</p></div><Switch defaultChecked /></div>
              <Button>Хадгалах</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="email">
          <Card>
            <CardHeader><CardTitle>И-мэйл тохиргоо</CardTitle><CardDescription>SMTP серверийн тохиргоо</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="smtpHost">SMTP сервер</Label><Input id="smtpHost" placeholder="smtp.example.com" /></div>
                <div className="space-y-2"><Label htmlFor="smtpPort">Порт</Label><Input id="smtpPort" placeholder="587" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="smtpUser">Хэрэглэгчийн нэр</Label><Input id="smtpUser" placeholder="user@example.com" /></div>
                <div className="space-y-2"><Label htmlFor="smtpPassword">Нууц үг</Label><Input id="smtpPassword" type="password" placeholder="••••••••" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="fromEmail">Илгээгчийн и-мэйл</Label><Input id="fromEmail" placeholder="noreply@example.com" /></div>
              <div className="flex gap-2"><Button variant="outline">Туршилтын и-мэйл илгээх</Button><Button>Хадгалах</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="system">
          <Card>
            <CardHeader><CardTitle>Системийн тохиргоо</CardTitle><CardDescription>Өгөгдлийн сан болон кеш</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Өгөгдлийн сангийн холболт</span><span className="text-sm font-medium text-green-500">Холбогдсон</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Кеш сервер</span><span className="text-sm font-medium text-green-500">Идэвхтэй</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Файл хадгалалт</span><span className="text-sm font-medium text-green-500">85% боломжтой</span></div>
              </div>
              <Separator />
              <div className="space-y-4"><h4 className="font-medium text-foreground">Засвар үйлчилгээ</h4><div className="flex flex-wrap gap-2"><Button variant="outline">Кеш цэвэрлэх</Button><Button variant="outline">Өгөгдөл нөөцлөх</Button><Button variant="outline">Лог татах</Button></div></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
