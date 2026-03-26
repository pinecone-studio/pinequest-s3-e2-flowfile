import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";

function EmailSettings() {
  return (
    <TabsContent value="email">
      <Card>
        <CardHeader>
          <CardTitle>И-мэйл тохиргоо</CardTitle>
          <CardDescription>SMTP серверийн тохиргоо</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP сервер</Label>
              <Input id="smtpHost" placeholder="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Порт</Label>
              <Input id="smtpPort" placeholder="587" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Хэрэглэгчийн нэр</Label>
              <Input id="smtpUser" placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Нууц үг</Label>
              <Input id="smtpPassword" type="password" placeholder="••••••••" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromEmail">Илгээгчийн и-мэйл</Label>
            <Input id="fromEmail" placeholder="noreply@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromName">Илгээгчийн нэр</Label>
            <Input id="fromName" placeholder="е-Шалгалт" />
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Туршилтын и-мэйл илгээх</Button>
            <Button>Хадгалах</Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default EmailSettings;
