"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout, profile, type User } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await profile();
        setUser(res.user);
      } catch (e: any) {
        setErr(e?.message ?? "Unauthorized");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function onLogout() {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : err ? (
            <p className="text-sm text-red-600">{err}</p>
          ) : (
            <>
              <Link href="/followups">
                <Button variant="outline">FollowUps</Button>
              </Link>

              <p className="text-sm">
                Welcome, <b>{user?.name}</b>
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Button className="w-full" onClick={onLogout}>
                Logout
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
