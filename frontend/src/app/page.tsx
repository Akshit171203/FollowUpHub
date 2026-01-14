import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/FollowUpHub.png"
            alt="FollowUpHub Logo"
            width={64}
            height={64}
            className="rounded-md"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">FollowUpHub</h1>
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
