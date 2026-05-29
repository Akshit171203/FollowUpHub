"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Bell, Clock, TestTube } from "lucide-react";
import { apiFetch } from "@/lib/api";

/**
 * NotificationSettings Component
 * 
 * Full-featured notification preferences UI:
 * - Quiet Hours toggle, start/end time pickers
 * - Preview text with smart formatting
 * - Test notification button
 * - Saves to backend preferences API
 */

export function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  // Preferences state
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");
  const [inAppEnabled, setInAppEnabled] = useState(true);

  // Ref to prevent double-fetch in Strict Mode
  const initialized = useRef(false);

  // Load preferences from backend
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadPreferences();
    }
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ preferences: any }>("/api/notifications/preferences");
      
      if (res?.preferences) {
        setInAppEnabled(res.preferences.inAppEnabled ?? true);
        setQuietHoursEnabled(res.preferences.quietHoursEnabled ?? false);
        setQuietHoursStart(res.preferences.quietHoursStart || "22:00");
        setQuietHoursEnd(res.preferences.quietHoursEnd || "08:00");
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
      toast.error("Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      
      await apiFetch("/api/notifications/preferences", {
        method: "PATCH",
        body: JSON.stringify({
          inAppEnabled,
          quietHoursEnabled,
          quietHoursStart,
          quietHoursEnd,
          emailEnabled: true, // Keep existing value
          typesDisabled: [], // Keep existing value
        }),
      });

      toast.success("Notification settings saved!");
    } catch (err) {
      console.error("Failed to save preferences:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      setTestingNotification(true);
      
      const res = await apiFetch<{ success: boolean; message: string }>("/api/notifications/test", {
        method: "POST",
      });

      if (res?.success) {
        toast.success(res.message || "Test notification sent!");
      }
    } catch (err) {
      console.error("Failed to send test notification:", err);
      toast.error("Failed to send test notification");
    } finally {
      setTestingNotification(false);
    }
  };

  // Generate preview text
  const getPreviewText = (): string => {
    if (!quietHoursEnabled) {
      return "Quiet hours disabled - all notifications active";
    }

    // Parse times
    const [startHour, startMin] = quietHoursStart.split(":").map(Number);
    const [endHour, endMin] = quietHoursEnd.split(":").map(Number);

    // Format to 12-hour with AM/PM
    const formatTime = (hour: number, min: number): string => {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${min.toString().padStart(2, "0")} ${period}`;
    };

    const start = formatTime(startHour, startMin);
    const end = formatTime(endHour, endMin);

    // Check for edge case: start === end
    if (quietHoursStart === quietHoursEnd) {
      return "⚠️ Muted 24/7 (start time equals end time)";
    }

    return `🔕 Muted from ${start} to ${end}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col">
      {/* In-App Notifications */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50">
            <Bell className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="in-app-toggle" className="text-[15px] font-semibold text-zinc-900 tracking-tight cursor-pointer">
              In-App Notifications
            </Label>
            <span className="text-[13px] text-zinc-500 mt-0.5 max-w-[400px]">
              Receive toast popups for new activity while using the app.
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <Switch
            id="in-app-toggle"
            checked={inAppEnabled}
            onCheckedChange={setInAppEnabled}
          />
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="p-5 sm:p-6 flex flex-col gap-5 border-b border-zinc-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100/50">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="quiet-hours-toggle" className="text-[15px] font-semibold text-zinc-900 tracking-tight cursor-pointer">
                Quiet Hours
              </Label>
              <span className="text-[13px] text-zinc-500 mt-0.5 max-w-[400px]">
                Automatically pause alerts during scheduled times.
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <Switch
              id="quiet-hours-toggle"
              checked={quietHoursEnabled}
              onCheckedChange={setQuietHoursEnabled}
            />
          </div>
        </div>

        {/* Time Picker & Preview */}
        {quietHoursEnabled && (
          <div className="rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-5 mt-2 ml-0 sm:ml-14 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="quiet-start" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Start Time
                </Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="font-mono bg-white border-zinc-200 focus:border-indigo-500 transition-colors h-10 rounded-lg text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end" className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  End Time
                </Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="font-mono bg-white border-zinc-200 focus:border-indigo-500 transition-colors h-10 rounded-lg text-[14px]"
                />
              </div>
            </div>

            {/* Preview Text */}
            <div className="flex items-start gap-3 pt-3 border-t border-zinc-200/60">
              <div className="mt-0.5">
                {quietHoursStart === quietHoursEnd ? (
                  <Bell className="h-4 w-4 text-amber-500" />
                ) : (
                  <Clock className="h-4 w-4 text-indigo-500" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-[14px] font-semibold text-zinc-900">
                  {getPreviewText().replace('🔕 ', '').replace('⚠️ ', '')}
                </p>
                {quietHoursStart !== quietHoursEnd && (
                  <p className="text-[12px] font-medium text-zinc-500">
                    Notifications effectively resume at {new Date(`2000-01-01T${quietHoursEnd}`).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 sm:p-6 flex items-center justify-end gap-3 bg-zinc-50/50 rounded-b-2xl">
        <Button
          variant="outline"
          onClick={sendTestNotification}
          disabled={testingNotification}
          className="gap-2 h-10 px-5 rounded-lg font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-[13px]"
        >
          <TestTube className="h-4 w-4" />
          {testingNotification ? "Sending..." : "Test Notification"}
        </Button>
        <Button 
          onClick={savePreferences} 
          disabled={saving} 
          className="min-w-[120px] h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold transition-all shadow-sm active:scale-95 text-[13px]"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
