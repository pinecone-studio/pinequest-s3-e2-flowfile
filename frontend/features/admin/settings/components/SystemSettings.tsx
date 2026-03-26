import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TabsContent } from '@/components/ui/tabs'
import React from 'react'

function SystemSettings() {
  return (
  <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Системийн тохиргоо</CardTitle>
              <CardDescription>Өгөгдлийн сан болон кеш</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Өгөгдлийн сангийн холболт
                  </span>
                  <span className="text-sm font-medium text-green-500">
                    Холбогдсон
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Кеш сервер
                  </span>
                  <span className="text-sm font-medium text-green-500">
                    Идэвхтэй
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Файл хадгалалт
                  </span>
                  <span className="text-sm font-medium text-green-500">
                    85% боломжтой
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">
                  Засвар үйлчилгээ
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">Кеш цэвэрлэх</Button>
                  <Button variant="outline">Өгөгдөл нөөцлөх</Button>
                  <Button variant="outline">Лог татах</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">
                  Системийн мэдээлэл
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Хувилбар</span>
                    <span className="font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Сүүлд шинэчлэгдсэн
                    </span>
                    <span className="font-medium">2024-01-15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Серверийн цаг</span>
                    <span className="font-medium">2024-01-20 14:30:00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
  )
}

export default SystemSettings