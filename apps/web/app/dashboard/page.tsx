import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard Santri Attendance
          </h1>

          <p className="mt-2 text-slate-500">
            Selamat datang, Admin 👋
          </p>
        </div>

        {/* Statistik */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">
              Total Santri
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              120
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">
              Hadir Hari Ini
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              110
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">
              Tidak Hadir
            </p>

            <h2 className="mt-2 text-3xl font-bold text-red-600">
              10
            </h2>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-slate-800">
            Menu
          </h2>

          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/dashboard/santri" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
              Data Santri
            </Link>

            <Link href="/dashboard/absensi" className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">
              Absensi
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}