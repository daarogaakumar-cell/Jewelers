import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 font-heading text-8xl font-bold text-gold-300">
        404
      </div>
      <h1 className="font-heading text-2xl font-bold text-charcoal-700 sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-charcoal-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let us help
        you find what you need.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gold-600 hover:shadow-gold active:scale-[0.97]"
        >
          Go Home
        </Link>
        <Link
          href="/categories"
          className="inline-flex items-center justify-center rounded-lg border border-charcoal-200 px-6 py-3 text-sm font-medium text-charcoal-600 transition-colors hover:bg-charcoal-50"
        >
          Browse Categories
        </Link>
      </div>
    </div>
  );
}
