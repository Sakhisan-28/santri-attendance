"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, logout } from "@/lib/api";

interface Santri {
  id: number;
  nama: string;
  kelas: string;
  status: string;
}

interface Absensi {
  id: number;
  santri_id: number;
  tanggal: string;
  status: string;
}

function toLocalDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function Dashboard() {
  const [totalSantri, setTotalSantri] = useState<number | null>(null);
  const [hadirHariIni, setHadirHariIni] = useState<number | null>(null);
  const [tidakHadirHariIni, setTidakHadirHariIni] = useState<number | null>(
    null,
  );
  const [username] = useState(() =>
    typeof window === "undefined"
      ? "Admin"
      : (localStorage.getItem("username") ?? "Admin"),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [santriList, absensiList] = await Promise.all([
          apiFetch<Santri[]>("/santri"),
          apiFetch<Absensi[]>("/absensi"),
        ]);
        if (!mounted) return;
        const today = toLocalDateString();
        const todayRows = absensiList.filter(
          (a) => String(a.tanggal).slice(0, 10) === today,
        );
        setTotalSantri(santriList.length);
        setHadirHariIni(
          todayRows.filter((a) => a.status === "Hadir").length,
        );
        setTidakHadirHariIni(
          todayRows.filter((a) => a.status !== "Hadir").length,
        );
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    {
      label: "Total Santri",
      value: totalSantri,
      className: "text-slate-800",
    },
    {
      label: "Hadir Hari Ini",
      value: hadirHariIni,
      className: "text-green-600",
    },
    {
      label: "Tidak Hadir",
      value: tidakHadirHariIni,
      className: "text-red-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Dashboard Santri Attendance
            </h1>

            <p className="mt-2 text-slate-500">
              Selamat datang, {username} 👋
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700" role="alert">
            {error}
          </div>
        )}

        {/* Statistik */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-slate-500">
                {stat.label}
              </p>

              <h2 className={`mt-2 text-3xl font-bold ${stat.className}`}>
                {loading ? "…" : (stat.value ?? "-")}
              </h2>
            </div>
          ))}
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
