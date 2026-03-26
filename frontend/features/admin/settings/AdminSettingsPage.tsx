"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Shield, Database, Mail, Globe } from "lucide-react";
import GeneralSettings from "./components/GeneralSettings";
import NotificationsSettings from "./components/NotificationsSettings";
import SecuritySettings from "./components/SecuritySettings";
import EmailSettings from "./components/EmailSettings";
import SystemSettings from "./components/SystemSettings";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Тохиргоо</h1>
        <p className="text-muted-foreground">Системийн тохиргоог удирдах</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Ерөнхий</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Мэдэгдэл</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Аюулгүй байдал</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">И-мэйл</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Систем</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <GeneralSettings />

        {/* Notification Settings */}
        <NotificationsSettings />

        {/* Security Settings */}
        <SecuritySettings />

        {/* Email Settings */}
        <EmailSettings />

        {/* System Settings */}
        <SystemSettings />
      </Tabs>
    </div>
  );
}
