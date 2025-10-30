import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";
import {
  getReturnedCards,
  exportCardCondition,
  downloadBlob,
  fetchDocumentBlob,
  filenameFromHeaders,
  ORIGIN,
  getVerificationDetail,
} from "../api";

function formatTanggal(str) {
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  if (!str) return "-";
  const d = new Date(str);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
const val = (v, f = "-") => (v == null || v === "" ? f : String(v));

function prettyAssistanceLabel(raw) {
  if (!raw) return "-";
  const MAP = {
    akses_pintu: "Hanya akses pintu timur/selatan",
    vip: "Hanya penggunaan ruang VIP",
    protokol: "Hanya pendampingan protokoler",
    protokoler: "Hanya pendampingan protokoler",
    akses_pintu_protokol: "Akses pintu + pendampingan protokoler",
    "akses-pintu-protokol": "Akses pintu + pendampingan protokoler",
    pintu_plus_protokoler: "Akses pintu + pendampingan protokoler",
    vip_protokol: "Ruang VIP + pendampingan protokoler",
    "vip-protokol": "Ruang VIP + pendampingan protokoler",
    akses_pintu_vip_protokol: "Akses pintu + ruang VIP + pendampingan protokoler",
    "akses-pintu-vip-protokol": "Akses pintu + ruang VIP + pendampingan protokoler",
    vip_plus_pendampingan_protokoler: "Ruang VIP + pendampingan protokoler",
    akses_pintu_plus_pendampingan_protokoler: "Akses pintu + pendampingan protokoler",
  };
  const v = String(raw).trim();
  if (MAP[v]) return MAP[v];

  let s = v.replace(/[_-]+/g, " ").trim();
  s = s.replace(/\bplus\b/gi, "+");
  s = s.replace(/\s*\+\s*/g, " + ");
  s = s
    .replace(/\bvip\b/gi, "VIP")
    .replace(/\bprotokol(er)?\b/gi, "pendampingan protokoler")
    .replace(/\bakses pintu\b/gi, "Akses pintu")
    .replace(/\bruang vip\b/gi, "Ruang VIP");
  s = s.replace(/^\s*\w/, (c) => c.toUpperCase()).replace(/\s{2,}/g, " ").trim();
  return s || "-";
}

function normalizeCondition(c) {
  const raw = (c ?? "").toString().trim().toLowerCase();
  if (!raw) return "Baik";
  if (raw === "1" || raw.includes("lost") || raw.includes("hilang")) return "Hilang";
  if (raw === "2" || raw.includes("damaged") || raw.includes("rusak") || raw.includes("broken")) return "Rusak";
  if (raw.includes("baik") || raw.includes("good") || raw === "0") return "Baik";
  return "Baik";
}

const kondisiBadge = { Baik: "#28A745", Hilang: "#DC3545", Rusak: "#FFC107" };

function toFileURL(v) {
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const clean = String(v).replace(/^\/+/, "");
  const finalPath = clean.startsWith("storage/") || clean.startsWith("uploads/") ? clean : `storage/${clean}`;
  return `${ORIGIN}/${finalPath}`;
}

const isBlank = (v) =>
  v == null || String(v).trim() === "" || ["-", "—", "–"].includes(String(v).trim());
const pickNonBlank = (...vals) => vals.find((v) => !isBlank(v));

const PATCH_KEY = "riwayat:patches";
const META_CACHE_KEY = "visitorCardMetaCache";

function loadPatches() {
  try { const raw = localStorage.getItem(PATCH_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function applyPatchToRows(rows) {
  const map = loadPatches();
  if (!map || typeof map !== "object") return rows;
  return rows.map((r) => {
    const ref = r.reference || r.nomorPengajuan;
    const patched = ref ? map[String(ref)] : null;
    return patched ? { ...r, kondisi: patched } : r;
  });
}
function loadMetaCache() {
  try { return JSON.parse(localStorage.getItem(META_CACHE_KEY) || "{}"); } catch { return {}; }
}
function getMetaForRow(row) {
  const cache = loadMetaCache();
  const keys = [
    row?.reference,
    row?.nomorPengajuan,
    row?.key,
    row?.raw?.card_transaction_id,
    row?.raw?.transaction_id,
    row?.raw?.visitor_card_id
  ].filter(Boolean).map(String);
  for (const k of keys) {
    if (cache[k]) {
      return { kondisi: cache[k].kondisi, alasan: cache[k].alasan, penanganan: cache[k].penanganan };
    }
  }
  return { kondisi: row?.kondisi || "Baik", alasan: "", penanganan: "" };
}

const INSTANSI_CACHE_KEY = "riwayat:instansiCache";
function loadInstansiCache() {
  try { return JSON.parse(localStorage.getItem(INSTANSI_CACHE_KEY) || "{}"); } catch { return {}; }
}
function saveInstansiToCache(key, val) {
  try {
    const cur = loadInstansiCache();
    cur[key] = val;
    localStorage.setItem(INSTANSI_CACHE_KEY, JSON.stringify(cur));
  } catch {}
}
function getInstansiFromCache(key) {
  const m = loadInstansiCache();
  return m?.[key];
}

function resolveInstansi(x) {
  const n = (obj, ...paths) => {
    for (const p of paths) { if (!obj) return undefined; obj = obj[p]; }
    return obj;
  };
  const cand =
    x?.instansi ||
    x?.instansi_name ||
    x?.organization ||
    x?.organization_name ||
    x?.company ||
    x?.company_name ||
    x?.institution ||
    x?.institution_name ||
    x?.agency ||
    x?.agency_name ||
    x?.applicant_company ||
    x?.applicant_organization ||
    x?.borrower_company ||
    x?.visitor_company ||
    n(x, "application", "instansi") ||
    n(x, "application", "organization") ||
    n(x, "application", "organization_name") ||
    n(x, "application", "company") ||
    n(x, "application", "company_name") ||
    n(x, "transaction", "company") ||
    n(x, "transaction", "company_name") ||
    n(x, "card_transaction", "company") ||
    n(x, "card_transaction", "company_name") ||
    n(x, "card_transaction", "applicant_company") ||
    n(x, "visitor", "company") ||
    n(x, "visitor", "company_name") ||
    n(x, "user", "company") ||
    n(x, "user", "company_name") ||
    n(x, "visit", "company") ||
    n(x, "visit", "company_name") ||
    n(x, "visitor_card", "company") ||
    n(x, "visitor_card", "company_name") ||
    n(x, "card", "company") ||
    n(x, "card", "company_name");
  return cand ?? "-";
}

function getNested(obj, ...paths) {
  for (const p of paths) { if (!obj) return undefined; obj = obj[p]; }
  return obj;
}
function resolvePICName(x) {
  return (
    x?.pic_name || x?.penanggung_jawab || x?.person_in_charge ||
    x?.applicant_pic || getNested(x, "application", "pic_name") ||
    getNested(x, "application", "penanggung_jawab") ||
    getNested(x, "visit", "pic_name") || "-"
  );
}
function resolvePICJabatan(x) {
  return (
    x?.pic_position || x?.pic_title || x?.jabatan_pic || x?.job_title_pic || x?.jabatan_penanggung_jawab ||
    getNested(x, "application", "pic_position") || getNested(x, "application", "pic_title") ||
    getNested(x, "visit", "pic_position") || getNested(x, "visit", "pic_title") || "-"
  );
}
function resolveLayananPendampingan(x) {
  const raw =
    x?.assistance_service || x?.layanan_pendampingan ||
    getNested(x, "application", "assistance_service") ||
    getNested(x, "application", "layanan_pendampingan") ||
    getNested(x, "visit", "assistance_service") ||
    getNested(x, "visit", "layanan_pendampingan");
  return prettyAssistanceLabel(raw);
}
function resolveAccessDetail(x) {
  const door =
    x?.accessDoor || x?.access_door || x?.door || x?.gate || x?.pintu ||
    getNested(x, "application", "access_door") || getNested(x, "visit", "access_door") || "-";
  const time =
    x?.accessTime || x?.access_time || x?.time || x?.access_at ||
    getNested(x, "application", "access_time") || getNested(x, "visit", "access_time") || "-";
  const purpose =
    x?.accessPurpose || x?.access_purpose || x?.purpose_access ||
    getNested(x, "application", "access_purpose") || getNested(x, "visit", "access_purpose") ||
    x?.purpose || x?.visit_purpose || "-";
  const protCount =
    x?.protokolerCount || x?.protokoler_count || x?.escort_count ||
    getNested(x, "application", "protokoler_count") || getNested(x, "visit", "protokoler_count") || "-";
  const vehicleType =
    x?.vehicleType || x?.vehicle_type || x?.kendaraan || x?.vehicleCountType ||
    getNested(x, "application", "vehicle_type") || getNested(x, "visit", "vehicle_type") || "-";
  const plate =
    x?.vehiclePlate || x?.vehicle_plate || x?.nopol || x?.license_plate ||
    getNested(x, "application", "vehicle_plate") || getNested(x, "visit", "vehicle_plate") || "-";

  const escortRaw =
    x?.needProtokolerEscort ?? x?.need_protokoler_escort ?? x?.escort_needed ??
    getNested(x, "application", "need_protokoler_escort") ?? getNested(x, "visit", "need_protokoler_escort");
  const escort = (() => {
    if (typeof escortRaw === "boolean") return escortRaw ? "Ya" : "Tidak";
    const s = String(escortRaw ?? "").trim().toLowerCase();
    if (s === "true" || s === "ya" || s === "y" || s === "1") return "Ya";
    if (s === "false" || s === "tidak" || s === "t" || s === "0") return "Tidak";
    if (s === "") return "-";
    return s;
  })();

  return { door, time, purpose, protCount, vehicleType, plate, escort };
}

function Popup({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-20" onClick={onClose}>
      <div className="bg-white rounded-[14px] p-0 min-w-[380px] max-w-[600px] w-[97%] shadow-lg relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 rounded-t-[14px]" style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)" }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Icon icon="material-symbols:id-card-rounded" width={22} color="#fff" />
            </div>
            <span className="font-poppins font-semibold text-white text-[18px]">{title}</span>
          </div>
          <button onClick={onClose} className="ml-2 text-white text-[22px] font-bold hover:opacity-80 transition">×</button>
        </div>
        <div className="px-7 py-7">{children}</div>
      </div>
    </div>
  );
}

export default function RiwayatPengembalian() {
  const [showDropdown, setShowDropdown] = useState(false);
  const adminName = localStorage.getItem("adminName") || "Admin";
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState("");
  const [detailData, setDetailData] = useState(null);

  const [laporanOpen, setLaporanOpen] = useState(false);
  const [laporanData, setLaporanData] = useState({
    nama: "-",
    instansi: "-",
    tanggal: null,
    kondisi: "Baik",
    alasan: "",
    penanganan: ""
  });

  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function outside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    navigate("/admin");
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await getReturnedCards();
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];

      const mapped = list.map((x, i) => {
        const n = (obj, ...paths) => {
          for (const p of paths) { if (!obj) return undefined; obj = obj[p]; }
          return obj;
        };

        const nama =
          x.applicant_name || x.borrower_name || x.full_name || x.name || x.visitor_name || x.user_name ||
          n(x, "user", "name") || n(x, "visitor", "full_name") || n(x, "visitor_card", "full_name") ||
          n(x, "card_transaction", "applicant_name") || n(x, "transaction", "applicant_name") ||
          n(x, "card", "visitor_name") || n(x, "application", "applicant_name") || "-";

        const tPinjam =
          x.issued_at || x.start_date || x.borrowed_at || x.created_at || x.date || n(x, "card_transaction", "issued_at") || null;

        const tKembali =
          x.returned_at || x.actual_return_date || x.actual_returned_at || x.card_returned_at || x.completed_at ||
          x.end_date || n(x, "card_transaction", "returned_at") || x.updated_at || null;

        const kondisiRaw =
          x.kondisi || x.card_condition || x.condition || x.transaction_condition ||
          n(x, "card_transaction", "return_condition") || n(x, "card_transaction", "card_condition") || "";
        const kondisi = normalizeCondition(kondisiRaw);

        const reference =
          x.reference_number || x.reference || x.ref_no || x.ref ||
          n(x, "application", "reference_number") || n(x, "visit", "reference_number") ||
          n(x, "card_transaction", "reference_number") || n(x, "transaction", "reference_number") ||
          n(x, "visitor_card", "reference_number") || null;

        const nomorPengajuan =
          reference || x.reference_number || n(x, "visitor_card", "reference_number") ||
          n(x, "card_transaction", "reference_number") || null;

        const petugasPenerima =
          x.petugasPenerima || x.petugas_penerima || x.returned_by_name || x.returned_by ||
          x.received_by_name || x.receiver_name || n(x, "card_transaction", "returned_by_name") ||
          n(x, "card_transaction", "received_by_name") || n(x, "visitor_card", "last_received_by") ||
          localStorage.getItem("namaPetugas") || undefined;

        const petugasPenyerah =
          x.petugasPenyerah || x.petugas_penyerah || x.petugasSerah || x.petugas_serah ||
          x.issued_by_name || x.issued_by || x.performed_by_name || x.performed_by ||
          n(x, "card_transaction", "issued_by_name") || n(x, "visitor_card", "last_issued_by") ||
          localStorage.getItem("namaPetugas") || undefined;

        const key = x.id ?? n(x, "card_transaction", "id") ?? n(x, "transaction", "id") ?? i;

        return {
          key,
          nama: val(nama),
          instansi: val(resolveInstansi(x), "-"),
          tanggalPinjam: tPinjam,
          tanggalKembali: tKembali,
          kondisi,
          kondisiRaw,
          keterangan: "Selesai",
          reference,
          nomorPengajuan,
          petugasPenerima,
          tanggalTerima: tPinjam,
          petugasPenyerah,
          tanggalSerah: tKembali,
          raw: x,
        };
      });

      setRows(applyPatchToRows(mapped));

      (async () => {
        const need = mapped.filter(r => (!r.instansi || r.instansi === "-") && (r.reference || r.nomorPengajuan));

        need.forEach(r => {
          const ref = r.reference || r.nomorPengajuan;
          const cached = getInstansiFromCache(String(ref));
          if (cached) {
            setRows(prev => prev.map(p => ((p.reference || p.nomorPengajuan) === ref ? { ...p, instansi: cached } : p)));
          }
        });

        const toFetch = need.filter(r => {
          const ref = r.reference || r.nomorPengajuan;
          return ref && !getInstansiFromCache(String(ref));
        });

        const maxConcurrent = 5;
        let i = 0;
        async function worker() {
          while (i < toFetch.length) {
            const r = toFetch[i++];
            const ref = r.reference || r.nomorPengajuan;
            try {
              const res = await getVerificationDetail({ reference_number: ref, reference: ref });
              const raw = res?.data?.data || res?.data || {};
              const detInstansi = resolveInstansi(raw);
              if (detInstansi && detInstansi !== "-") {
                saveInstansiToCache(String(ref), detInstansi);
                setRows(prev => prev.map(p =>
                  ((p.reference || p.nomorPengajuan) === ref ? { ...p, instansi: detInstansi } : p)
                ));
              }
            } catch {}
          }
        }
        await Promise.all([...Array(Math.min(maxConcurrent, toFetch.length))].map(worker));
      })();

    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Gagal memuat riwayat pengembalian");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("riwayat:refresh", refresh);
    window.addEventListener("dashboard:changed", refresh);

    const onPatch = (e) => {
      const { reference, kondisi } = e?.detail || {};
      if (!reference || !kondisi) return;
      setRows((prev) =>
        prev.map((r) => {
          const ref = r.reference || r.nomorPengajuan;
          return String(ref) === String(reference) ? { ...r, kondisi } : r;
        })
      );
    };
    window.addEventListener("riwayat:patch", onPatch);

    let ch = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        ch = new BroadcastChannel("riwayat-channel");
        ch.onmessage = (msg) => {
          if (msg?.data?.type === "patch") {
            const { reference, kondisi } = msg.data;
            if (!reference || !kondisi) return;
            setRows((prev) =>
              prev.map((r) => {
                const ref = r.reference || r.nomorPengajuan;
                return String(ref) === String(reference) ? { ...r, kondisi } : r;
              })
            );
          }
        };
      }
    } catch {}

    return () => {
      window.removeEventListener("riwayat:refresh", refresh);
      window.removeEventListener("dashboard:changed", refresh);
      window.removeEventListener("riwayat:patch", onPatch);
      try { ch && ch.close(); } catch {}
    };
  }, []);

  const filtered = rows.filter((r) =>
    (r.nama || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  /* ---- Export ---- */
  const exportLaporan = async () => {
    try {
      const resp = await exportCardCondition();
      downloadBlob(resp.data, `riwayat_kondisi_kartu_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch {
      const header = ["Nama Pemohon","Tanggal Pinjam","Tanggal Kembali","Kondisi Kartu","Keterangan"].join(",");
      const csvRows = filtered.map((r) =>
        [r.nama, formatTanggal(r.tanggalPinjam), formatTanggal(r.tanggalKembali), r.kondisi, r.keterangan].join(",")
      );
      const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "riwayat_pengembalian.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  /* ---- Detail ---- */
  const openDetail = async (reference, row) => {
    const ref = reference || row?.nomorPengajuan || row?.reference;

    setDetailErr("");
    setDetailLoading(true);
    setDetailData(null);
    setDetailOpen(true);

    const resolvePetugasPenerima = (rawObj) =>
      pickNonBlank(
        row?.petugasPenerima,
        row?.petugas_penerima,
        rawObj?.returned_by_name,
        rawObj?.returned_by,
        rawObj?.received_by_name,
        rawObj?.receiver_name,
        rawObj?.petugas_penerima,
        localStorage.getItem("namaPetugas"),
        adminName
      );

    const resolvePetugasPenyerah = (rawObj) =>
      pickNonBlank(
        row?.petugasPenyerah,
        row?.petugas_penyerah,
        row?.petugasSerah,
        row?.petugas_serah,
        rawObj?.issued_by_name,
        rawObj?.issued_by,
        rawObj?.performed_by_name,
        rawObj?.performed_by,
        rawObj?.issuer_name,
        localStorage.getItem("namaPetugas"),
        adminName
      );

    const resolveTanggalTerima = (rawObj) =>
      row?.tanggalPinjam || rawObj?.issued_at || rawObj?.start_date || rawObj?.created_at || rawObj?.card_transaction?.issued_at || null;

    const resolveTanggalSerah = (rawObj) =>
      row?.tanggalKembali || rawObj?.returned_at || rawObj?.actual_return_date || rawObj?.card_transaction?.returned_at || rawObj?.updated_at || null;

    const resolveKondisi = (rawObj) => normalizeCondition(
      row?.kondisi || rawObj?.kondisi || rawObj?.card_condition || rawObj?.condition ||
      rawObj?.transaction_condition || rawObj?.card_transaction?.return_condition || rawObj?.card_transaction?.card_condition || ""
    );

    if (ref) {
      try {
        const res = await getVerificationDetail({ reference_number: ref, reference: ref });
        const raw = res?.data?.data || res?.data || {};
        const nama = raw.applicant_name || raw.full_name || raw.name || row?.nama || "-";
        const instansi = resolveInstansi(raw);
        const email = raw.email || raw.applicant_email || "-";
        const tanggal = raw.visit_date || raw.visit_start_date || raw.date || row?.tanggalPinjam || null;
        const selesaiKunjungan = raw.visit_end_date || raw.end_date || raw.due_date || row?.tanggalKembali || null;
        const noPengajuan = raw.reference_number || raw.reference || ref || row?.nomorPengajuan || "-";
        const handphone = raw.phone || raw.phone_number || raw.applicant_phone || "-";
        const stasiun = typeof raw.station === "object" ? (raw.station?.name || "-") : (raw.station_name || raw.station || "-");
        const tujuan = raw.purpose || raw.visit_purpose || raw.reason || raw.description || "-";

        const picName = resolvePICName(raw);
        const picTitle = resolvePICJabatan(raw);
        const layananPendampingan = resolveLayananPendampingan(raw);
        const access = resolveAccessDetail(raw);

        const docRaw =
          raw.document_url || raw.attachment_url || raw.document_path || raw.document ||
          (Array.isArray(raw.documents) ? (raw.documents[0]?.url || raw.documents[0]) : "");
        const dokumenUrl = docRaw ? toFileURL(docRaw) : "";
        const dokumenNama = raw.document_original_name || raw.original_name || (typeof docRaw === "string" ? docRaw.split("/").pop() : "-");

        const statusLabel = (raw.status || raw.approval_status || raw.application_status || "").toString().toLowerCase();
        const status =
          statusLabel.includes("approve") || statusLabel === "approved" ? "Disetujui" :
          statusLabel.includes("reject") || statusLabel === "rejected" ? "Ditolak" :
          "Menunggu";

        const petugasPenerima = resolvePetugasPenerima(raw);
        const petugasPenyerah = resolvePetugasPenyerah(raw);
        const tanggalTerima = resolveTanggalTerima(raw);
        const tanggalSerah = resolveTanggalSerah(raw);
        const kondisi = resolveKondisi(raw);

        setDetailData({
          nama, instansi, email, tanggal, selesaiKunjungan, noPengajuan, handphone,
          stasiun, tujuan, dokumenUrl, dokumenNama, status, raw,
          petugasPenerima, petugasPenyerah, tanggalTerima, tanggalSerah, kondisi,
          picName, picTitle, layananPendampingan,
          accessDoor: access.door,
          accessTime: access.time,
          accessPurpose: access.purpose,
          protokolerCount: access.protCount,
          vehicleType: access.vehicleType,
          vehiclePlate: access.plate,
          needProtokolerEscort: access.escort,
        });
      } catch (e) {
        setDetailErr(e?.response?.data?.message || e?.message || "Gagal memuat detail.");
      } finally { setDetailLoading(false); }
      return;
    }

    try {
      const raw = row?.raw || row || {};
      const nama = raw.applicant_name || raw.full_name || raw.name || row?.nama || "-";
      const instansi = resolveInstansi(raw);
      const email = raw.email || raw.applicant_email || "-";
      const tanggal = raw.visit_date || raw.visit_start_date || raw.date || row?.tanggalPinjam || null;
      const selesaiKunjungan = raw.visit_end_date || raw.end_date || raw.due_date || row?.tanggalKembali || null;
      const noPengajuan = raw.reference_number || raw.reference || row?.nomorPengajuan || "-";
      const handphone = raw.phone || raw.phone_number || raw.applicant_phone || "-";
      const stasiun = (raw.station && (typeof raw.station === "string" ? raw.station : raw.station.name)) || raw.station_name || row?.stasiun || "-";
      const tujuan = raw.purpose || raw.visit_purpose || raw.reason || raw.description || "-";

      const picName = resolvePICName(raw);
      const picTitle = resolvePICJabatan(raw);
      const layananPendampingan = resolveLayananPendampingan(raw);
      const access = resolveAccessDetail(raw);

      const docRaw =
        raw.document_url || raw.attachment_url || raw.document_path || raw.document ||
        (Array.isArray(raw.documents) ? (raw.documents[0]?.url || raw.documents[0]) : "");
      const dokumenUrl = docRaw ? toFileURL(docRaw) : "";
      const dokumenNama = raw.document_original_name || raw.original_name || (typeof docRaw === "string" ? docRaw.split("/").pop() : "-");

      const statusLabel = (raw.status || raw.approval_status || raw.application_status || "").toString().toLowerCase();
      const status =
        statusLabel.includes("approve") || statusLabel === "approved" ? "Disetujui" :
        statusLabel.includes("reject") || statusLabel === "rejected" ? "Ditolak" :
        "Menunggu";

      const petugasPenerima = resolvePetugasPenerima(raw);
      const petugasPenyerah = resolvePetugasPenyerah(raw);
      const tanggalTerima = resolveTanggalTerima(raw);
      const tanggalSerah = resolveTanggalSerah(raw);
      const kondisi = normalizeCondition(
        row?.kondisi || raw?.kondisi || raw?.card_condition || raw?.condition ||
        raw?.transaction_condition || raw?.card_transaction?.return_condition || raw?.card_transaction?.card_condition || ""
      );

      setDetailData({
        nama, instansi, email, tanggal, selesaiKunjungan, noPengajuan, handphone,
        stasiun, tujuan, dokumenUrl, dokumenNama, status, raw,
        petugasPenerima, petugasPenyerah, tanggalTerima, tanggalSerah, kondisi,
        picName, picTitle, layananPendampingan,
        accessDoor: access.door,
        accessTime: access.time,
        accessPurpose: access.purpose,
        protokolerCount: access.protCount,
        vehicleType: access.vehicleType,
        vehiclePlate: access.plate,
        needProtokolerEscort: access.escort,
      });
    } catch (e) {
      setDetailErr("Gagal menampilkan detail.");
    } finally { setDetailLoading(false); }
  };

  const handleOpenDocument = async (pathOrUrl) => {
    if (!pathOrUrl) return;
    try {
      const resp = await fetchDocumentBlob(pathOrUrl);
      const fileUrl = URL.createObjectURL(resp.data);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      const name = filenameFromHeaders(resp, "dokumen");
      try { const a = document.createElement("a"); a.href = fileUrl; a.download = name; } catch {}
    } catch {
      window.open(toFileURL(pathOrUrl), "_blank", "noopener,noreferrer");
    }
  };

  const openLaporanReadonly = async (row) => {
    const meta = getMetaForRow(row);
    let instansiNow =
      (row?.instansi && row.instansi !== "-") ? row.instansi : resolveInstansi(row?.raw || {});
    setLaporanData({
      nama: row?.nama || "-",
      instansi: instansiNow || "-",
      tanggal: row?.tanggalPinjam || null,
      kondisi: row?.kondisi || meta.kondisi || "Baik",
      alasan: meta.alasan || "-",
      penanganan: meta.penanganan || "-",
    });
    setLaporanOpen(true);

    if (!instansiNow || instansiNow === "-") {
      const ref = row?.reference || row?.nomorPengajuan;
      if (ref) {
        try {
          const res = await getVerificationDetail({ reference_number: ref, reference: ref });
          const raw = res?.data?.data || res?.data || {};
          const fromDetail = resolveInstansi(raw);
          if (fromDetail && fromDetail !== "-") {
            setLaporanData((prev) => ({ ...prev, instansi: fromDetail }));
          }
        } catch {}
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-[#6A8BB0] font-poppins">
      {/* Sidebar */}
      <aside className="bg-[#E6E6E6] flex flex-col py-8 px-7 border-r border-[#eaeaea] h-screen fixed top-0 left-0 z-20" style={{ width: 360 }}>
        <img src={kaiLogo} alt="KAI Logo" className="w-[120px] mb-6 mx-auto" />
        <div className="text-[18px] font-poppins font-medium text-[#242424] text-center mb-7 leading-[20px]">
          Admin Panel Kartu Visitor
        </div>
        <div className="w-full flex justify-center mb-12">
          <div style={{ width: "100%", height: 2, background: "#C4C4C4", borderRadius: 2, margin: "0 auto" }} />
        </div>
        <nav className="flex flex-col gap-4 mt-2">
          {[
            { label: "Dashboard", icon: "streamline-plump:user-pin-remix", path: "/admin/dashboard" },
            { label: "Verifikasi & Persetujuan", icon: "streamline-sharp:time-lapse-solid", path: "/admin/verifikasi" },
            { label: "Kartu Visitor", icon: "solar:card-recive-outline", path: "/admin/kartu-visitor" },
            { label: "Riwayat Pengembalian", icon: "solar:card-search-broken", path: "/admin/riwayat" },
          ].map((m) => {
            const active = location.pathname === m.path;
            return (
              <button
                key={m.label}
                onClick={() => navigate(m.path)}
                className={`flex items-center gap-4 px-4 py-2 text-left transition-all hover:opacity-80 ${active ? "bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD] text-white font-semibold rounded-[15px]" : "bg-transparent text-[#474646] font-semibold hover:bg-gray-100 rounded-[15px]"} text-[17px]`}
                style={active ? { boxShadow: "0 2px 8px rgba(90,90,140,0.07)" } : {}}
              >
                <span className="flex items-center"><Icon icon={m.icon} width={32} height={32} /></span>
                {m.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col px-2 md:px-12 py-10 transition-all" style={{ marginLeft: 360, minHeight: "100vh", width: "100%" }}>
        <div className="flex gap-8 mb-10 flex-wrap">
          <div className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto" style={{ minHeight: 70 }}>
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">Riwayat Pengembalian</span>
            <div className="relative ml-auto" style={{ minWidth: 200 }} ref={dropdownRef}>
              <div className="absolute top-0 left-0 w-full h-full" style={{ background: "rgba(106,139,176,0.13)", borderRadius: 15, zIndex: 0 }} />
              <button className="relative flex items-center gap-2 px-5 py-2 cursor-pointer z-10 hover:opacity-80 transition-opacity" style={{ borderRadius: 15, background: "transparent" }} onClick={() => setShowDropdown((p) => !p)}>
                <span className="w-[38px] h-[38px] rounded-full bg-[#6A8BB0] flex items-center justify-center text-white text-[24px] font-poppins font-semibold mr-2">
                  {(adminName[0] || "A").toUpperCase()}
                </span>
                <span className="font-poppins font-medium text-[18px] leading-[36px] text-[#474646]">{adminName}</span>
              </button>
              {showDropdown && (
                <div className="absolute top-[62px] right-0 bg-white rounded-[12px] shadow-lg px-6 py-3 z-20 border min-w-[146px] flex items-center gap-3">
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

        {/* Table */}
        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-white rounded-[20px] shadow-md px-0 py-0">
            <div className="flex items-center px-8 pt-8 pb-3">
              <div className="flex items-center bg-white px-4 py-2 rounded-[11px] border border-[#E4E4E4] mr-3" style={{ maxWidth: 360, background: "#F4F4F4" }}>
                <Icon icon="ic:round-search" width={28} color="#474646" className="mr-2" />
                <input
                  type="text"
                  placeholder="cari berdasarkan nama pemohon"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 outline-none bg-transparent border-0 text-[17px] font-poppins font-light italic text-[#474646]"
                  style={{ fontStyle: "italic", fontWeight: 300 }}
                />
              </div>
              <button
                className="px-5 py-2 rounded-[8px] font-poppins font-medium text-white ml-auto"
                style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)", fontWeight: 500 }}
                onClick={exportLaporan}
              >
                Export Laporan
              </button>
            </div>

            <div className="overflow-x-auto pb-8 px-8">
              <table className="w-full min-w-[730px]">
                <thead>
                  <tr style={{ background: "#F4F4F4" }}>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Nama<br/>Pemohon</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Tanggal<br/>Pinjam</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Tanggal<br/>Kembali</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Kondisi<br/>Kartu</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Keterangan</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-6 text-center text-[#6b7280]">Memuat…</td></tr>
                  ) : err ? (
                    <tr><td colSpan={6} className="py-6 text-center text-red-600">{err}</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-6 text-center text-[#6b7280]">Tidak ada data.</td></tr>
                  ) : (
                    filtered.map((r, idx) => (
                      <tr key={r.key ?? idx} className={idx % 2 === 0 ? "" : "bg-[#F8F8F8]"}>
                        <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">{r.nama}</td>
                        <td className="py-2 px-2 text-center font-poppins font-medium text-[15px] text-[#474646]">{formatTanggal(r.tanggalPinjam)}</td>
                        <td className="py-2 px-2 text-center font-poppins font-medium text-[15px] text-[#474646]">{formatTanggal(r.tanggalKembali)}</td>
                        <td className="py-2 px-2 text-center">
                          {r.kondisi === "Baik" ? (
                            <span className="font-poppins font-medium rounded-[7px] inline-flex items-center justify-center" style={{ background: (kondisiBadge[r.kondisi] || "#ACB3BB") + "99", color: "#212529", minWidth: 90, height: 36, padding: "0 12px", cursor: "default" }} title="Kondisi Baik">
                              {r.kondisi}
                            </span>
                          ) : (
                            <button className="font-poppins font-medium rounded-[7px] inline-flex items-center justify-center" style={{ background: (kondisiBadge[r.kondisi] || "#ACB3BB") + "99", color: "#212529", minWidth: 90, height: 36, padding: "0 12px" }} onClick={() => openLaporanReadonly(r)} title="Lihat laporan kondisi">
                              {r.kondisi}
                            </button>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="font-poppins font-semibold rounded-[7px] px-6 py-2 text-white" style={{ background: "#2f8bf5ff" }}>{r.keterangan || "Selesai"}</span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button className="px-5 py-2 rounded-[8px] font-poppins font-medium text-white" style={{ background: "#6A8BB0" }} onClick={() => openDetail(r.reference, r)} title="Lihat Detail">
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30" onClick={() => setDetailOpen(false)}>
          <div className="bg-white rounded-[14px] shadow-xl w-[95%] max-w-[760px] min-w-[360px] relative flex flex-col" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "85vh", overflow: "hidden" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)", position: "sticky", top: 0, zIndex: 30 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon icon="material-symbols:id-card-rounded" width={20} color="#fff" />
                </div>
                <div>
                  <div className="font-poppins font-semibold text-white text-[18px]">Detail Pengajuan</div>
                  <div className="text-white/90 text-sm" style={{ opacity: 0.92 }}>Informasi ringkas pengajuan & petugas</div>
                </div>
              </div>
              <button onClick={() => setDetailOpen(false)} aria-label="Tutup" style={{ color: "#fff", fontSize: 20, background: "transparent", border: "none" }}>
                ×
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto" style={{ flex: "1 1 auto" }}>
              {detailLoading ? (
                <div className="text-center py-8">Memuat detail…</div>
              ) : detailErr ? (
                <div className="text-red-600">{detailErr}</div>
              ) : detailData ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-[22px] font-poppins font-semibold text-[#222]">{detailData.nama}</div>
                      <div className="text-[16px] text-[#666] mt-1">{detailData.noPengajuan}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ padding: "6px 12px", borderRadius: 8, background: detailData.status === "Disetujui" ? "#E7FEED" : detailData.status === "Ditolak" ? "#FFDEDB" : "#FEF5E7", color: detailData.status === "Disetujui" ? "#047A16" : detailData.status === "Ditolak" ? "#A80000" : "#A06B00", fontWeight: 600 }}>
                        {detailData.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-[#666] mb-1">Instansi</div>
                      <div className="font-poppins font-medium">{detailData.instansi || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Nama Penanggung Jawab (PIC)</div>
                      <div className="font-poppins font-medium">{detailData.picName || "-"}</div>
                    </div>

                    <div>
                      <div className="text-sm text-[#666] mb-1">Email</div>
                      <div className="font-poppins font-medium">{detailData.email || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Nomor HP</div>
                      <div className="font-poppins font-medium">{detailData.handphone || "-"}</div>
                    </div>

                    <div>
                      <div className="text-sm text-[#666] mb-1">Jabatan Penanggung Jawab</div>
                      <div className="font-poppins font-medium">{detailData.picTitle || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Layanan Pendampingan</div>
                      <div className="font-poppins font-medium">{detailData.layananPendampingan || "-"}</div>
                    </div>

                    <div>
                      <div className="text-sm text-[#666] mb-1">Tanggal Kunjungan</div>
                      <div className="font-poppins font-medium">{detailData.tanggal ? formatTanggal(detailData.tanggal) : "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Selesai Kunjungan</div>
                      <div className="font-poppins font-medium">{detailData.selesaiKunjungan ? formatTanggal(detailData.selesaiKunjungan) : "-"}</div>
                    </div>

                    <div>
                      <div className="text-sm text-[#666] mb-1">Stasiun</div>
                      <div className="font-poppins font-medium">{detailData.stasiun || "-"}</div>
                      {detailData.dokumenUrl && (
                        <div className="mt-3">
                          <div className="text-sm text-[#666] mb-1">Dokumen</div>
                          <div className="text-sm">
                            <a
                              href="#"
                              onClick={(e) => { e.preventDefault(); handleOpenDocument(detailData.raw?.document_path || detailData.dokumenUrl); }}
                              style={{ textDecoration: "underline", color: "#1E3A8A", fontWeight: 600 }}
                            >
                              Lihat
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-[#666] mb-1">Tujuan</div>
                      <div className="font-poppins font-medium">{detailData.tujuan || "-"}</div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#E6E6E9", margin: "10px 0 16px 0" }} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-[#666] mb-1">Pintu yang Diajukan</div>
                      <div className="font-poppins font-medium">{detailData.accessDoor || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Waktu Akses</div>
                      <div className="font-poppins font-medium">{detailData.accessTime || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Tujuan Akses</div>
                      <div className="font-poppins font-medium">{detailData.accessPurpose || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Jumlah Pendamping Protokoler</div>
                      <div className="font-poppins font-medium">{detailData.protokolerCount || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Jumlah & Jenis Kendaraan</div>
                      <div className="font-poppins font-medium">{detailData.vehicleType || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Nomor Polisi Kendaraan</div>
                      <div className="font-poppins font-medium">{detailData.vehiclePlate || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Pendampingan Protokoler</div>
                      <div className="font-poppins font-medium">{detailData.needProtokolerEscort || "-"}</div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#E6E6E9", margin: "10px 0 16px 0" }} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
                    <div>
                      <div className="text-sm text-[#666] mb-1">Petugas Penerima</div>
                      <div className="font-poppins font-medium">
                        {isBlank(detailData.petugasPenerima) ? adminName : detailData.petugasPenerima}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Petugas Penyerah</div>
                      <div className="font-poppins font-medium">
                        {isBlank(detailData.petugasPenyerah) ? adminName : detailData.petugasPenyerah}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-[#666] mb-1">Tanggal Terima</div>
                      <div className="font-poppins font-medium">{detailData.tanggalTerima ? formatTanggal(detailData.tanggalTerima) : "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666] mb-1">Tanggal Serah</div>
                      <div className="font-poppins font-medium">{detailData.tanggalSerah ? formatTanggal(detailData.tanggalSerah) : "-"}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div>Tidak ada detail.</div>
              )}
            </div>

            <div className="px-6 py-4" style={{ borderTop: "1px solid #EEF0F2", position: "sticky", bottom: 0, background: "#fff", zIndex: 40 }}>
              <div className="flex justify-end">
                <button className="px-4 py-2 rounded-[8px] font-poppins font-medium" style={{ background: "#E3E3E3", color: "#474646" }} onClick={() => setDetailOpen(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Laporan Read-only */}
      <Popup show={laporanOpen} onClose={() => setLaporanOpen(false)} title="Laporan Kartu Rusak/Hilang">
        <div className="rounded-[10px] overflow-hidden mb-4" style={{ background: "rgba(100,115,175,0.07)", border: "1px solid rgba(208,205,205,0.56)" }}>
          <div className="px-4 pt-3 pb-2">
            <div className="font-poppins font-medium text-[#919090] text-[14px]">Laporan Kartu</div>
          </div>
          <div style={{ height: 2, background: "rgba(208,205,205,0.56)" }} />
          <div className="px-4 py-1">
            <div className="py-2 flex gap-2 text-[14.5px]" style={{ borderBottom: "1px solid rgba(208,205,205,0.56)" }}>
              <div className="min-w-[150px] text-[#474646] font-poppins font-medium">Nama Lengkap</div>
              <div className="text-[#474646] font-poppins font-medium">: {laporanData.nama}</div>
            </div>
            <div className="py-2 flex gap-2 text-[14.5px]" style={{ borderBottom: "1px solid rgba(208,205,205,0.56)" }}>
              <div className="min-w-[150px] text-[#474646] font-poppins font-medium">Instansi</div>
              <div className="text-[#474646] font-poppins font-medium">: {laporanData.instansi || "-"}</div>
            </div>
            <div className="py-2 flex gap-2 text-[14.5px]" style={{ borderBottom: "1px solid rgba(208,205,205,0.56)" }}>
              <div className="min-w-[150px] text-[#474646] font-poppins font-medium">Tanggal Kunjungan</div>
              <div className="text-[#474646] font-poppins font-medium">: {laporanData.tanggal ? formatTanggal(laporanData.tanggal) : "-"}</div>
            </div>
            <div className="py-2 flex gap-2 text-[14.5px]" style={{ borderBottom: "1px solid rgba(208,205,205,0.56)" }}>
              <div className="min-w-[150px] text-[#474646] font-poppins font-medium">Kondisi Kartu</div>
              <div className="text-[#474646] font-poppins font-medium">: {laporanData.kondisi}</div>
            </div>
          </div>
        </div>

        <div className="mb-2 font-poppins font-medium" style={{ color: "#474646" }}>Alasan :</div>
        <div className="p-3 rounded-[7px] mb-3" style={{ background: "#F7F7F7", border: "1px solid rgba(208,205,205,0.56)", whiteSpace: "pre-wrap" }}>
          {laporanData.alasan || "-"}
        </div>
        <div className="mb-2 font-poppins font-medium" style={{ color: "#474646" }}>Penanganan :</div>
        <div className="p-3 rounded-[7px]" style={{ background: "#F7F7F7", border: "1px solid rgba(208,205,205,0.56)", whiteSpace: "pre-wrap" }}>
          {laporanData.penanganan || "-"}
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white" style={{ background: "#ACB3BB" }} onClick={() => setLaporanOpen(false)}>
            Tutup
          </button>
        </div>
      </Popup>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
    </div>
  );
}
