import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI Email Reply Generator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Generate professional, context-aware email replies in seconds using
          advanced NLP models.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="btn-primary text-base px-6 py-3">
            Get Started
          </Link>
          <Link
            href="/login"
            className="border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
