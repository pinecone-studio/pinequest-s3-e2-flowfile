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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import React from "react";

function GeneralSettings() {
  return (
    <TabsContent value="general">
      <Card>
        <CardHeader>
          <CardTitle>Ерөнхий тохиргоо</CardTitle>
          <CardDescription>Системийн үндсэн тохиргоо</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Системийн нэр</Label>
            <Input id="siteName" defaultValue="е-Шалгалт" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Хэл</Label>
            <Select defaultValue="mn">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mn">Монгол</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Цагийн бүс</Label>
            <Select defaultValue="asia-ulaanbaatar">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asia-ulaanbaatar">
                  Asia/Ulaanbaatar (GMT+8)
                </SelectItem>
                <SelectItem value="asia-hovd">Asia/Hovd (GMT+7)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Засвар үйлчилгээний горим</Label>
              <p className="text-sm text-muted-foreground">
                Идэвхжүүлсэн үед хэрэглэгчид нэвтрэх боломжгүй
              </p>
            </div>
            <Switch />
          </div>

          <Button>Хадгалах</Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default GeneralSettings;
