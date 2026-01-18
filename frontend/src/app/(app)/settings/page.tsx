import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { DesktopNotificationToggle } from "@/components/notifications/DesktopNotificationToggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your notification preferences and quiet hours
        </p>
      </div>

      {/* Desktop Notifications (Client-Side) */}
      <Card className="shadow-sm border-zinc-200">
        <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-indigo-600" />
            Desktop Notifications
          </CardTitle>
          <CardDescription>
            Browser notifications when the app is not focused (client-side preference)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-base font-medium text-zinc-900">
                Enable desktop notifications
              </p>
              <p className="text-sm text-zinc-500">
                Show native browser alerts even when tab is closed
              </p>
            </div>
            <DesktopNotificationToggle />
          </div>
        </CardContent>
      </Card>

      {/* Server-Backed Preferences */}
      <NotificationSettings />
    </div>
  );
}
