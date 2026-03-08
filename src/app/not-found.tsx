import Link from "next/link"

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm text-white/45">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Halaman yang kamu cari tidak tersedia atau sudah tidak ada.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}