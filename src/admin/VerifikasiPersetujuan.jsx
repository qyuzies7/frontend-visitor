import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

import {
  getVerificationsAll,
  getVisitTypeMap,
  adminLogout,
  ORIGIN,
  fetchDocumentBlob,
  filenameFromHeaders,
} from "../api";

const statusConfig = {
  Menunggu:   { bg: "#FEF5E7", color: "#D69E2E", label: "Menunggu" },
  Disetujui:  { bg: "#E7FEED", color: "#47D62E", label: "Disetujui" },
  Ditolak:    { bg: "#FFDEDB", color: "#FF0000", label: "Ditolak" },
  // Style untuk DIBATALKAN agar berbeda (abu-abu):
  Dibatalkan: { bg: "#F2F2F2", color: "#7A7A7A", label: "Dibatalkan" },
};

// Normalisasi status backend -> ID (menangkap 'cancelled/canceled/dibatalkan')
function mapStatusID(raw) {
  if (raw === 1 || raw === "1" || String(raw).toLowerCase() === "true") return "Disetujui";
  if (raw === 2 || raw === "2") return "Ditolak";
  if (raw === 3 || raw === "3") return "Dibatalkan";
  if (raw === 0 || raw === "0") return "Menunggu";

  const s = String(raw || "").trim().toLowerCase();

  if (s.includes("approve") || s.includes("accepted") || s === "accept" || s.includes("disetujui") || s === "setuju")
    return "Disetujui";

  if (s.includes("reject") || s.includes("declin") || s.includes("ditolak") || s === "tolak")
    return "Ditolak";

  // tangkap bentuk pembatalan apapun
  if (
    s.includes("cancel") || s.includes("canceled") || s.includes("cancelled") ||
    s.includes("batal")  || s.includes("dibatal")
  ) return "Dibatalkan";

  if (
    s === "" || s.includes("pending") || s.includes("process") ||
    s.includes("proses") || s.includes("menunggu") ||
    s.includes("waiting") || s.includes("review")
  ) return "Menunggu";

  return "Menunggu";
}

function toFileURL(v) {
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const clean = String(v).replace(/^\/+/, "");
  const finalPath =
    clean.startsWith("storage/") || clean.startsWith("uploads/")
      ? clean
      : `storage/${clean}`;
  return `${ORIGIN}/${finalPath}`;
}
function filenameOf(v, fallback = "-") {
  if (!v) return fallback;
  try {
    const u = new URL(v);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return decodeURIComponent(last || fallback);
  } catch {
    const last = String(v).split("/").filter(Boolean).pop();
    return last || fallback;
  }
}
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
function formatTanggal(val) {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d)) return String(val);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function VerifikasiPersetujuan() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [queryDebounced, setQueryDebounced] = useState("");
  const [rows, setRows] = useState([]);
  const [typesMap, setTypesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const dropdownRef = useRef(null);
  const lastRequestId = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = localStorage.getItem("adminName") || "Admin";

  useEffect(() => {
    (async () => {
      try {
        const map = await getVisitTypeMap();
        setTypesMap(map);
      } catch {
        setTypesMap({});
      }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQueryDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Ambil SEMUA verifikasi (termasuk DIBATALKAN) — backend sekarang sudah dicari via beberapa endpoint kandidat di api.js
  const fetchList = async () => {
    const reqId = ++lastRequestId.current;
    setLoading(true);
    setErr("");
    try {
      const res = await getVerificationsAll({ include: "documents,visitType" });
      const payload = Array.isArray(res?.data) ? res.data : res?.data?.data || [];

      const list = payload.map((x) => {
        const reference =
          x.reference_number || x.reference || x.ref_no || x.ref || x.id || "";

        const nama = x.applicant_name || x.full_name || x.name || "-";

        const jenisId  = x.visit_type_id ?? x.type_id ?? x.visit_type?.id ?? null;
        const jenisRaw = x.visit_type_name || x.visit_type || x.type?.name || x.category;
        const jenis    = jenisRaw || (jenisId && typesMap[jenisId]) || "-";

        const tanggalTampil =
          x.visit_date || x.visit_start_date || x.date || x.created_at;

        const tanggalSortRaw =
          x.created_at || x.submitted_at || x.updated_at ||
          x.visit_start_date || x.visit_date || x.date;

        const docAny =
          x.document_url || x.attachment_url || x.document_path ||
          (Array.isArray(x.documents) ? (x.documents[0]?.url || x.documents[0]) : "") ||
          x.document;

        const dokumenPath = docAny || null;
        const dokumenUrl  = toFileURL(docAny) || null;
        const dokumenName = x.document_original_name || x.original_name || filenameOf(docAny, "-");

        const statusRaw =
          x.status ?? x.approval_status ?? x.review_status ??
          x.state  ?? x.application_status ?? "";

        const status = mapStatusID(statusRaw);

        const sortKey = (() => {
          const d = new Date(tanggalSortRaw || tanggalTampil);
          return isNaN(d) ? 0 : d.getTime();
        })();

        return {
          reference,
          nama,
          jenis,
          tanggal: tanggalTampil,
          dokumenUrl,
          dokumenName,
          dokumenPath,
          status,
          sortKey,
        };
      });

      // PENTING: TIDAK memfilter “Dibatalkan”. Biarkan ikut tampil di “Semua”.
      list.sort((a, b) => b.sortKey - a.sortKey);
      if (reqId === lastRequestId.current) setRows(list);
    } catch (e) {
      if (reqId === lastRequestId.current) {
        setErr(e?.response?.data?.message || e?.message || "Gagal memuat data verifikasi");
      }
    } finally {
      if (reqId === lastRequestId.current) setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [typesMap]);

  useEffect(() => {
    const onFocus = () => fetchList();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  useEffect(() => {
    const onDirty = (e) => {
      if (!e?.detail || e.detail.type === "verification") fetchList();
    };
    window.addEventListener("app:data-dirty", onDirty);
    return () => window.removeEventListener("app:data-dirty", onDirty);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // search & filter
  const searched = useMemo(() => {
    const qq = queryDebounced.toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) =>
      [r.nama || "", r.jenis || "", r.reference || ""].join(" ").toLowerCase().includes(qq)
    );
  }, [rows, queryDebounced]);

  // Hanya tiga filter (tanpa “Dibatalkan”). “Dibatalkan” tetap terlihat saat filter “Semua”.
  const filtered = useMemo(() => {
    if (statusFilter === "Semua") return searched;
    return searched.filter((r) => r.status === statusFilter);
  }, [searched, statusFilter]);

  // counter (tidak memasukkan Dibatalkan dalam badge count karena tidak ada tombolnya)
  const pendingCount  = useMemo(() => rows.filter((r) => r.status === "Menunggu").length, [rows]);
  const approvedCount = useMemo(() => rows.filter((r) => r.status === "Disetujui").length, [rows]);
  const rejectedCount = useMemo(() => rows.filter((r) => r.status === "Ditolak").length,   [rows]);

  const handleMenuClick = (path) => navigate(path);
  const handleLogout = async () => {
    try { await adminLogout(); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    navigate("/admin");
    setShowDropdown(false);
  };

  const onOpenDoc = async (row, e) => {
    e.preventDefault();
    if (!row?.dokumenPath && !row?.dokumenUrl) return;
    try {
      const resp = await fetchDocumentBlob(row.dokumenPath || row.dokumenUrl);
      const blobUrl = URL.createObjectURL(resp.data);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      const name = filenameFromHeaders(resp, row.dokumenName) || row.dokumenName || "dokumen";
      try {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = name;
      } catch {}
    } catch {
      if (row.dokumenUrl) window.open(row.dokumenUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#6A8BB0] font-poppins overflow-x-hidden">
      {/* Sidebar */}
      <aside
        className="bg-[#E6E6E6] flex flex-col py-8 px-7 border-r border-[#eaeaea] h-screen fixed top-0 left-0 z-20"
        style={{ width: 360 }}
      >
        <img src={kaiLogo} alt="KAI Logo" className="w-[120px] mb-6 mx-auto" />
        <div className="text:[18px] font-poppins font-medium text-[#242424] text-center mb-7 leading-[20px]">
          Admin Panel Kartu Visitor
        </div>
        <div className="w-full flex justify-center mb-12">
          <div style={{ width: "100%", height: 2, background: "#C4C4C4", borderRadius: 2, margin: "0 auto" }} />
        </div>

        <nav className="flex flex-col gap-4 mt-2">
          {[
            { label: "Dashboard", icon: "streamline-plump:user-pin-remix",   path: "/admin/dashboard" },
            { label: "Verifikasi & Persetujuan", icon: "streamline-sharp:time-lapse-solid", path: "/admin/verifikasi" },
            { label: "Kartu Visitor", icon: "solar:card-recive-outline",     path: "/admin/kartu-visitor" },
            { label: "Riwayat Pengembalian", icon: "solar:card-search-broken", path: "/admin/riwayat" },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleMenuClick(item.path)}
                className={`flex items-center gap-4 px-4 py-2 text-left transition-all hover:opacity-80
                  ${isActive
                    ? "bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD] text-white font-semibold rounded-[15px]"
                    : "bg-transparent text-[#474646] font-semibold hover:bg-gray-100 rounded-[15px]"
                  } text-[17px]`}
                style={isActive ? { boxShadow: "0 2px 8px rgba(90,90,140,0.07)" } : {}}
              >
                <span className="flex items-center">
                  <Icon icon={item.icon} width={32} height={32} />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col px-2 md:px-12 py-10 transition-all"
        style={{ marginLeft: 360, minHeight: "100vh", width: "100%" }}
      >
        {/* Header */}
        <div className="flex gap-8 mb-10 flex-wrap">
          <div
            className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
            style={{ minHeight: 70, width: "100%", maxWidth: 900 }}
          >
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">
              Verifikasi & Persetujuan
            </span>

            <div className="relative ml-auto" style={{ minWidth: 200 }} ref={dropdownRef}>
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{ background: "rgba(106,139,176,0.13)", borderRadius: 15, zIndex: 0 }}
              />
              <button
                className="relative flex items-center gap-2 px-5 py-2 cursor-pointer z-10 hover:opacity-80 transition-opacity"
                style={{ borderRadius: 15, background: "transparent" }}
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <span className="w-[38px] h-[38px] rounded-full bg-[#6A8BB0] flex items-center justify-center text-white text-[24px] font-poppins font-semibold mr-2">
                  {(adminName[0] || "A").toUpperCase()}
                </span>
                <span className="font-poppins font-medium text-[18px] leading-[36px] text-[#474646]">
                  {adminName}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute top:[62px] right-0 bg-white rounded-[12px] shadow-lg px-6 py-3 z-20 border min-w-[146px] flex items-center gap-3">
                  <Icon icon="ic:round-logout" width={34} color="#d61d1d" />
                  <button
                    className="w-full text-left text-[#474646] font-poppins font-medium text-[18px] py-2 hover:bg-[#F1F2F6] rounded-md transition-colors"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="max-w-[900px] mx-auto w-full mb-6">
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
              {err}
            </div>
          </div>
        )}

        <div
          className="mx-auto bg-[#fff] rounded-[20px] shadow-md px-8 py-7"
          style={{ borderRadius: 20, width: "100%", maxWidth: 900 }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center mb-5">
            {/* Search */}
            <div
              className="flex items-center flex-1 bg-white px-4 py-2 rounded-[11px] border border-[#E4E4E4] md:mr-3"
              style={{ maxWidth: 520 }}
            >
              <Icon icon="ic:round-search" width={28} color="#474646" className="mr-2" />
              <input
                type="text"
                placeholder="Cari nama / jenis kunjungan / referensi"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 outline-none bg-transparent border-0 text-[17px] font-poppins font-light italic text-[#474646]"
                style={{ fontStyle: "italic", fontWeight: 300 }}
              />
            </div>

            {/* Filters: tanpa 'Dibatalkan' */}
            <div className="w-full md:w-auto overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="inline-flex flex-nowrap whitespace-nowrap gap-x-2">
                {[
                  { key: "Semua"     },
                  { key: "Menunggu"  },
                  { key: "Disetujui" },
                  { key: "Ditolak"   },
                ].map(({ key }) => {
                  const isActive = statusFilter === key;
                  const bg = key === "Semua" ? "#F4F4F4" : (statusConfig[key]?.bg || "#F4F4F4");
                  const color = key === "Semua" ? "#474646" : (statusConfig[key]?.color || "#474646");

                  const count =
                    key === "Menunggu"  ? rows.filter(r => r.status === "Menunggu").length :
                    key === "Disetujui" ? rows.filter(r => r.status === "Disetujui").length :
                    key === "Ditolak"   ? rows.filter(r => r.status === "Ditolak").length : null;

                  return (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      className="inline-flex items-center justify-center px-3 py-1 rounded-[10px] text-[14px] font-poppins font-medium border whitespace-nowrap"
                      style={{
                        background: bg,
                        color,
                        borderColor: isActive ? "#6A8BB0" : "#E4E4E4",
                        minWidth: 100,
                        height: 30,
                      }}
                      title={`Tampilkan ${key.toLowerCase()}`}
                    >
                      {key}{count != null ? ` (${count})` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F4F4F4" }}>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Nama<br/>Pemohon</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Jenis<br/>Kunjungan</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Tanggal<br/>Kunjungan</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Dokumen</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Status</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="py-3 px-2">
                          <span className="block w-full h-5 bg-gray-200 animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length > 0 ? (
                  filtered.map((row, idx) => (
                    <tr key={row.reference || `${row.nama}-${idx}`} className={idx % 2 === 0 ? "" : "bg-[#F8F8F8]"}>
                      <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">{row.nama}</td>
                      <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">{row.jenis}</td>
                      <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">{formatTanggal(row.tanggal)}</td>
                      <td className="py-2 px-2 text-center">
                        {row.dokumenUrl ? (
                          <a
                            href={row.dokumenUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => onOpenDoc(row, e)}
                            className="font-poppins font-semibold text-[15px]"
                            style={{ color: "#1E3A8A", textDecoration: "underline" }}
                            title={row.dokumenName}
                          >
                            Lihat
                          </a>
                        ) : (
                          <span className="text-[#999]">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div
                          className="font-poppins font-semibold text:[15px] px-5 py-1 rounded-[8px] inline-flex justify-center items-center whitespace-nowrap"
                          style={{
                            background: statusConfig[row.status]?.bg || "#eee",
                            color: statusConfig[row.status]?.color || "#555",
                            minWidth: "110px",
                          }}
                        >
                          {statusConfig[row.status]?.label || row.status || "-"}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          className="px-5 py-1 font-poppins font-semibold text-white text-[15px] rounded-[8px] transition-all whitespace-nowrap"
                          style={{ background: "#8E8E8E" }}
                          onClick={() => navigate(`/admin/detail/${encodeURIComponent(row.reference || "")}`)}
                          disabled={!row.reference}
                          title={!row.reference ? "Reference tidak tersedia" : "Lihat Detail"}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-[#aaa] font-poppins font-medium">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        input::placeholder { font-family: 'Poppins', sans-serif; font-weight: 300; font-style: italic; }
        body { overflow-x: hidden; }
        .no-scrollbar::-webkit-scrollbar { height: 0px; }
        .no-scrollbar { scrollbar-width: none; }
        @media (max-width: 900px) {
          aside { width: 100vw !important; position: static !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
