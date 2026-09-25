"use client";

import { useState, useEffect } from "react";

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
  nama: string;
  kelas: string;
}

const SANTRI_API = "http://localhost:3001/santri";
const ABSENSI_API = "http://localhost:3001/absensi";

const STATUS_OPTIONS = ["Hadir", "Izin", "Sakit", "Alpha"];

export default function AbsensiPage() {
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAbsensi, setEditingAbsensi] = useState<Absensi | null>(null);
  const [formData, setFormData] = useState({
    santri_id: "",
    tanggal: "",
    status: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchSantri = async () => {
    const res = await fetch(SANTRI_API);
    if (!res.ok) throw new Error("Gagal memuat data santri");
    return res.json();
  };

  const fetchAbsensi = async () => {
    const res = await fetch(ABSENSI_API);
    if (!res.ok) throw new Error("Gagal memuat data absensi");
    return res.json();
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [santriData, absensiData] = await Promise.all([
          fetchSantri(),
          fetchAbsensi(),
        ]);
        if (mounted) {
          setSantriList(santriData);
          setAbsensiList(absensiData);
        }
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
    return () => { mounted = false; };
  }, []);

  const resetForm = () => {
    setFormData({ santri_id: "", tanggal: "", status: "" });
    setFormError(null);
    setEditingAbsensi(null);
    setShowForm(false);
  };

  const handleEdit = (absensi: Absensi) => {
    setFormData({
      santri_id: String(absensi.santri_id),
      tanggal: absensi.tanggal.split("T")[0],
      status: absensi.status,
    });
    setEditingAbsensi(absensi);
    setShowForm(true);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const url = editingAbsensi ? `${ABSENSI_API}/${editingAbsensi.id}` : ABSENSI_API;
      const method = editingAbsensi ? "PUT" : "POST";

      const payload = {
        santri_id: Number(formData.santri_id),
        tanggal: formData.tanggal,
        status: formData.status,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menyimpan data");
      }

      const updatedList = await fetchAbsensi();
      setAbsensiList(updatedList);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data absensi ini?")) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${ABSENSI_API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data");
      const updatedList = await fetchAbsensi();
      setAbsensiList(updatedList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "Hadir":
        return `${base} bg-green-100 text-green-800`;
      case "Izin":
        return `${base} bg-blue-100 text-blue-800`;
      case "Sakit":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "Alpha":
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-slate-100 text-slate-800`;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Absensi Santri</h1>
            <p className="mt-1 text-slate-500">Kelola data absensi santri pesantren</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            + Tambah Absensi
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center text-slate-500">
            Memuat data absensi...
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Nama Santri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {absensiList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Belum ada data absensi
                      </td>
                    </tr>
                  ) : (
                    absensiList.map((absensi) => (
                      <tr key={absensi.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-800">{formatDate(absensi.tanggal)}</td>
                        <td className="px-6 py-4 text-slate-800">{absensi.nama}</td>
                        <td className="px-6 py-4 text-slate-600">{absensi.kelas}</td>
                        <td className="px-6 py-4">
                          <span className={getStatusBadge(absensi.status)}>
                            {absensi.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(absensi)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(absensi.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingAbsensi ? "Edit Absensi" : "Tambah Absensi"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700 text-sm" role="alert">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Santri
                  </label>
                  <select
                    value={formData.santri_id}
                    onChange={(e) => setFormData({ ...formData, santri_id: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Pilih santri</option>
                    {santriList.map((santri) => (
                      <option key={santri.id} value={santri.id}>
                        {santri.nama} - {santri.kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Pilih status</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? "Menyimpan..." : editingAbsensi ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}