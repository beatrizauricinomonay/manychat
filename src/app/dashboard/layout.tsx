import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-100 text-slate-900">
      <aside className="flex w-60 shrink-0 flex-col justify-between bg-[#0b1220] text-slate-200">
        <div>
          <div className="flex items-center gap-2 px-5 py-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-400 font-bold text-white">
              IF
            </div>
            <span className="text-lg font-semibold text-white">InstaFlow</span>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-3">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              Automações
            </Link>
            <Link
              href="/dashboard/runs"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              Execuções
            </Link>
          </nav>
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-400">
          Conectado à Instagram Graph API
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
