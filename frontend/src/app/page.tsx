import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">FollowUpHub</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If this card looks styled, Tailwind is working.
        </p>
        <Link className="mt-4 inline-block underline" href="/login">
          Go to Login
        </Link>
      </div>
    </main>
  );
}
