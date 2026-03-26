import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";

function NotificationsSettings() {
  return (
 <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Мэдэгдлийн тохиргоо</CardTitle>
              <CardDescription>
                И-мэйл болон системийн мэдэгдлүүд
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Шинэ шалгалтын мэдэгдэл</Label>
                  <p className="text-sm text-muted-foreground">
                    Шинэ шалгалт үүсгэсэн үед мэдэгдэл илгээх
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Шалгалт дуусах мэдэгдэл</Label>
                  <p className="text-sm text-muted-foreground">
                    Шалгалт дуусахад мэдэгдэл илгээх
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Дүн гарсан мэдэгдэл</Label>
                  <p className="text-sm text-muted-foreground">
                    Шалгалтын дүн гарсан үед сурагчдад мэдэгдэл илгээх
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Долоо хоног тутмын тайлан</Label>
                  <p className="text-sm text-muted-foreground">
                    Админ нарт долоо хоног тутам тайлан илгээх
                  </p>
                </div>
                <Switch />
              </div>

              <Button>Хадгалах</Button>
            </CardContent>
          </Card>
        </TabsContent>
  )
}

export default NotificationsSettings