import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";

function SecuritySettings() {
  return (
 <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Аюулгүй байдал</CardTitle>
              <CardDescription>Нууц үг болон нэвтрэх тохиргоо</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Нууц үгийн хамгийн бага урт</Label>
                <Select defaultValue="8">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 тэмдэгт</SelectItem>
                    <SelectItem value="8">8 тэмдэгт</SelectItem>
                    <SelectItem value="10">10 тэмдэгт</SelectItem>
                    <SelectItem value="12">12 тэмдэгт</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Хоёр шатлалт баталгаажуулалт</Label>
                  <p className="text-sm text-muted-foreground">
                    Админ нарт 2FA шаардах
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Автомат гарах</Label>
                  <p className="text-sm text-muted-foreground">
                    30 минут идэвхгүй байсан бол автомат гарах
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Нэвтрэх оролдлогын хязгаар</Label>
                  <p className="text-sm text-muted-foreground">
                    5 удаа буруу нэвтрэх оролдлогын дараа түр хаах
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button>Хадгалах</Button>
            </CardContent>
          </Card>
        </TabsContent>
  )
}

export default SecuritySettings