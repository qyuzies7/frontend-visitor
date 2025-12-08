import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

import {
  getVerificationDetail,
  approveVerification,
  rejectVerification,
  ORIGIN,
  fetchDocumentBlob,
  filenameFromHeaders,
} from "../api";


function normalizeStatusLabel(s) {
  const v = (s || "").toString().toLowerCase();
  if (v === "approved" || v === "disetujui") return "Disetujui";
  if (v === "rejected" || v === "ditolak") return "Ditolak";
  if (v === "cancelled" || v === "canceled" || v === "dibatalkan" || v.includes("batal")) return "Dibatalkan";
  return "Menunggu";
}

function formatTanggalIndo(val) {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d)) return val;
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember",
  ];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getFilenameFromUrl(url, fallback = "-") {
  if (!url) return fallback;
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return decodeURIComponent(last || fallback);
  } catch {
    const last = String(url).split("/").filter(Boolean).pop();
    return decodeURIComponent(last || fallback);
  }
}

function toFileURL(v) {
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const clean = v.replace(/^\/+/, "");
  const finalPath =
    clean.startsWith("storage/") || clean.startsWith("uploads/")
      ? clean
      : `storage/${clean}`;
  return `${ORIGIN.replace(/\/+$/,"")}/${finalPath}`;
}

const ASSISTANCE_LABELS = {
  akses_pintu: "Hanya akses pintu timur/selatan",
  vip: "Hanya penggunaan ruang VIP",
  protokol: "Hanya pendampingan protokoler",
  protokoler: "Hanya pendampingan protokoler",
  "akses_pintu_protokol": "Akses pintu + pendampingan protokoler",
  "akses-pintu-protokol": "Akses pintu + pendampingan protokoler",
  "pintu_plus_protokoler": "Akses pintu + pendampingan protokoler",
  "vip_protokol": "Ruang VIP + pendampingan protokoler",
  "vip-protokol": "Ruang VIP + pendampingan protokoler",
  "akses_pintu_vip_protokol": "Akses pintu + ruang VIP + pendampingan protokoler",
  "akses-pintu-vip-protokol": "Akses pintu + ruang VIP + pendampingan protokoler",
  "vip_plus_pendampingan_protokoler": "Ruang VIP + pendampingan protokoler",
  "akses_pintu_plus_pendampingan_protokoler": "Akses pintu + pendampingan protokoler",
};

function prettyAssistanceLabel(raw) {
  if (!raw) return "-";
  const v = String(raw).trim();
  if (ASSISTANCE_LABELS[v]) return ASSISTANCE_LABELS[v];

  let s = v.replace(/[_-]+/g, " ").trim();
  s = s.replace(/\bplus\b/gi, "+");
  s = s.replace(/\s*\+\s*/g, " + ");
  s = s
    .replace(/\bvip\b/gi, "VIP")
    .replace(/\bprotokol(er)?\b/gi, "pendampingan protokoler")
    .replace(/\bakses pintu\b/gi, "Akses pintu")
    .replace(/\bruang vip\b/gi, "Ruang VIP");
  s = s.replace(/^\s*\w/, (c) => c.toUpperCase());
  return s.replace(/\s{2,}/g, " ").trim();
}

const adminNameFromLS =
  localStorage.getItem("adminName") ||
  localStorage.getItem("namaPetugas") ||
  "Admin";

function SmallModal({ open, onClose, title, icon, iconColor = "#fff", children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[14px] shadow-lg w-[95%] max-w-[520px] min-w-[360px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-[14px]"
          style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)" }}
        >
          <div className="flex items-center gap-3">
            {icon ? <Icon icon={icon} width={48} height={48} color={iconColor} /> : null}
            <span className="font-poppins font-semibold text-white text-[18px]">
              {title}
            </span>
          </div>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}


export default function FormDetail() {
  const navigate = useNavigate();
  const { reference } = useParams();

  const [showReject, setShowReject] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acceptNote, setAcceptNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [detail, setDetail] = useState({
    nama: "-",
    instansi: "-",
    email: "-",
    tanggal: "-",
    selesaiKunjungan: "-",
    noPengajuan: reference || "-",
    tujuan: "-",
    handphone: "-",
    stasiun: "-",
    dokumenNama: "-",
    dokumenUrl: "",
    dokumenPath: "",

    picNama: "-",
    picJabatan: "-",
    layananPendampingan: "-",

    accessDoor: "-",
    accessTime: "-",
    accessPurpose: "-",
    protokolerCount: "-",
    vehicleType: "-",
    vehiclePlate: "-",
    needProtokolerEscort: "-", 

    statusLabel: "Menunggu",
    catatan: "",
    _filenameResolved: false,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchDetail() {
      if (!reference) {
        setErr("Reference number tidak ditemukan.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr("");
      try {
        const res = await getVerificationDetail({
          reference_number: reference,
          reference,
        });

        const raw = res?.data?.data || res?.data || {};

        const nama = raw.applicant_name || raw.full_name || raw.name || "-";
        const instansi =
          raw.organization || raw.company || raw.institution || raw.agency || "-";
        const email = raw.email || raw.applicant_email || "-";
        const tanggal = formatTanggalIndo(
          raw.visit_date || raw.visit_start_date || raw.date
        );
        const selesaiKunjungan = formatTanggalIndo(
          raw.visit_end_date || raw.end_date || raw.due_date
        );
        const noPengajuan =
          raw.reference_number || raw.reference || raw.ref_no || raw.ref || reference || "-";
        const handphone = raw.phone || raw.phone_number || raw.applicant_phone || "-";
        const stasiun =
          typeof raw.station === "object"
            ? raw.station?.name || "-"
            : raw.station_name || raw.station || "-";
        const tujuan =
          raw.purpose || raw.visit_purpose || raw.reason || raw.description || "-";

        const docRaw =
          raw.document_url ||
          raw.attachment_url ||
          raw.document_path ||
          raw.document ||
          (Array.isArray(raw.documents) ? (raw.documents[0]?.url || raw.documents[0]) : "");
        const dokumenUrl = docRaw ? toFileURL(docRaw) : "";
        const dokumenNama =
          raw.document_original_name || raw.original_name || getFilenameFromUrl(docRaw, "-");

        const picNama =
          raw.pic_name || raw.pic || raw.person_in_charge || raw.nama_pic || "-";
        const picJabatan =
          raw.pic_position || raw.pic_title || raw.jabatan_pic || "-";

        const layananPendampinganRaw =
          raw.assistance_service ||
          raw.service_type || 
          raw.layanan_pendampingan ||
          raw.layananPendampingan ||
          "-";
        const layananPendampingan = prettyAssistanceLabel(layananPendampinganRaw);

        const accessDoor =
          raw.access_door || raw.accessDoor || raw.pintu || "-";
        const accessTime =
          raw.access_time || raw.accessTime || raw.waktu_akses || raw.jam_akses || "-";
        const accessPurpose =
          raw.access_purpose || raw.accessPurpose || raw.tujuan_akses || "-";
        const protokolerCount =
          raw.protokoler_count ||
          raw.protokolerCount ||
          raw.jumlah_pendamping_protokoler ||
          "-";
        const vehicleType =
          raw.vehicle_type ||
          raw.vehicleType ||
          raw.jumlah_jenis_kendaraan ||
          "-";
        const vehiclePlate =
          raw.vehicle_plate ||
          raw.vehiclePlate ||
          raw.nopol ||
          raw.nomor_polisi ||
          "-";
        const needProtokolerEscortRaw =
          raw.need_protokoler_escort ||
          raw.needProtokolerEscort ||
          raw.pendampingan_protokoler ||
          raw.protokoler ||
          "";
        const needProtokolerEscort =
          String(needProtokolerEscortRaw).toLowerCase() === "true" ||
          String(needProtokolerEscortRaw).toLowerCase() === "ya" ||
          needProtokolerEscortRaw === 1
            ? "Ya"
            : needProtokolerEscortRaw === "" || needProtokolerEscortRaw == null
            ? "Tidak"
            : "Tidak";

        const statusLabel = normalizeStatusLabel(raw.status);
        const catatan = raw.approval_note || raw.note || raw.rejection_reason || "";

        if (!mounted) return;
        setDetail({
          nama,
          instansi,
          email,
          tanggal,
          selesaiKunjungan,
          noPengajuan,
          tujuan,
          handphone,
          stasiun,
          dokumenNama,
          dokumenUrl,
          dokumenPath: docRaw || "",

          picNama,
          picJabatan,
          layananPendampingan,

          accessDoor,
          accessTime,
          accessPurpose,
          protokolerCount,
          vehicleType,
          vehiclePlate,
          needProtokolerEscort,

          statusLabel,
          catatan,
          _filenameResolved: false,
        });
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Gagal memuat detail.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDetail();
    return () => { mounted = false; };
  }, [reference]);

  useEffect(() => {
    if (!detail.dokumenUrl || detail._filenameResolved) return;

    (async () => {
      try {
        const resp = await fetchDocumentBlob(detail.dokumenPath || detail.dokumenUrl, {
          timeout: 20000,
        });
        const nameFromHeader = filenameFromHeaders(resp, detail.dokumenNama);
        if (nameFromHeader && nameFromHeader !== detail.dokumenNama) {
          setDetail((p) => ({ ...p, dokumenNama: nameFromHeader, _filenameResolved: true }));
        } else {
          setDetail((p) => ({ ...p, _filenameResolved: true }));
        }
      } catch {
        setDetail((p) => ({ ...p, _filenameResolved: true }));
      }
    })();
  }, [detail.dokumenUrl, detail.dokumenPath, detail._filenameResolved, detail.dokumenNama]);

  const handleOpenDocument = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetchDocumentBlob(detail.dokumenPath || detail.dokumenUrl);
      const blobUrl = URL.createObjectURL(resp.data);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch {
      if (detail.dokumenUrl) {
        window.open(detail.dokumenUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  const getStatusBadge = () => {
    if (detail.statusLabel === "Menunggu") {
      return (
        <span
          className="flex items-center px-4 py-2 font-poppins font-semibold text-[16px]"
          style={{ color: "#D69E2E", background: "#FEF5E7", borderRadius: 10, fontWeight: 600 }}
        >
          Menunggu
        </span>
      );
    }
    if (detail.statusLabel === "Ditolak") {
      return (
        <span
          className="flex items-center px-4 py-2 font-poppins font-semibold text-[16px]"
          style={{ color: "#FC0000", background: "#FFDEDB", borderRadius: 10, fontWeight: 600 }}
        >
          Persetujuan Ditolak
        </span>
      );
    }
    if (detail.statusLabel === "Disetujui") {
      return (
        <span
          className="flex items-center px-4 py-2 font-poppins font-semibold text-[16px]"
          style={{ color: "#47D62E", background: "#E7FEED", borderRadius: 10, fontWeight: 600 }}
        >
          Disetujui
        </span>
      );
    }
    if (detail.statusLabel === "Dibatalkan") {
      return (
        <span
          className="flex items-center px-4 py-2 font-poppins font-semibold text-[16px]"
          style={{ color: "#6B7280", background: "#F3F4F6", borderRadius: 10, fontWeight: 600 }}
        >
          Dibatalkan
        </span>
      );
    }
    return null;
  };

  const handleReject = () => { setShowReject(true); setRejectReason(""); };
  const handleAccept = () => { setShowAccept(true); setAcceptNote(""); };

  const submitReject = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const prevStatus = detail.statusLabel;
    const prevCatatan = detail.catatan;

    setSubmitting(true);
    setDetail((p) => ({ ...p, statusLabel: "Ditolak", catatan: rejectReason }));

    try {
      await rejectVerification({ reference_number: reference, reason: rejectReason });
      try {
        window.dispatchEvent(
          new CustomEvent("app:data-dirty", {
            detail: { type: "verification", action: "rejected", reference },
          })
        );
        sessionStorage.setItem("dirty:verification", String(Date.now()));
      } catch {}
      setShowReject(false);
    } catch (error) {
      setDetail((p) => ({ ...p, statusLabel: prevStatus, catatan: prevCatatan }));
      alert(error?.response?.data?.message || "Gagal menolak pengajuan.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitAccept = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const prevStatus = detail.statusLabel;
    const prevCatatan = detail.catatan;

    setSubmitting(true);
    setDetail((p) => ({ ...p, statusLabel: "Disetujui", catatan: acceptNote }));

    try {
      await approveVerification({ reference_number: reference, note: acceptNote });
      try {
        window.dispatchEvent(
          new CustomEvent("app:data-dirty", {
            detail: { type: "verification", action: "approved", reference },
          })
        );
        sessionStorage.setItem("dirty:verification", String(Date.now()));
        sessionStorage.setItem("dirty:cards", String(Date.now()));
      } catch {}
      setShowAccept(false);
    } catch (error) {
      setDetail((p) => ({ ...p, statusLabel: prevStatus, catatan: prevCatatan }));
      alert(error?.response?.data?.message || "Gagal menyetujui pengajuan.");
    } finally {
      setSubmitting(false);
    }
  };

  let actionSection;
  
  if (detail.statusLabel === "Menunggu") {
    actionSection = (
      <div className="flex gap-4 justify-end">
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)", fontWeight: 600, fontSize: 16 }}
          onClick={() => navigate("/admin/verifikasi")}
        >
          Kembali
        </button>
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{ background: "#E41D26", fontWeight: 600, fontSize: 16 }}
          onClick={handleReject}
        >
          Tolak
        </button>
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{ background: "#1FAF35", fontWeight: 600, fontSize: 16 }}
          onClick={handleAccept}
        >
          Setuju
        </button>
      </div>
    );
  } 
  else if (detail.statusLabel === "Ditolak") {
    actionSection = (
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div
            className="font-poppins font-semibold px-5 py-2 rounded-[8px]"
            style={{ 
              color: "#FF0004", 
              background: "#FFDEDB", 
              fontSize: 15, 
              borderRadius: 8, 
              minWidth: 0, 
              maxWidth: 320, 
              overflowWrap: "break-word" 
            }}
          >
            {detail.catatan || "-"}
          </div>
          <div
            className="font-poppins font-medium px-5 py-2 rounded-[8px]"
            style={{ background: "#E3E3E3", color: "#242424", fontSize: 15, borderRadius: 8 }}
          >
            Petugas : {adminNameFromLS}
          </div>
        </div>
        
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)", fontWeight: 600, fontSize: 16 }}
          onClick={() => navigate("/admin/verifikasi")}
        >
          Kembali
        </button>
      </div>
    );
  } 
  else if (detail.statusLabel === "Disetujui") {
    actionSection = (
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div
            className="font-poppins font-medium px-5 py-2 rounded-[8px]"
            style={{ background: "#E3E3E3", color: "#242424", fontSize: 15, borderRadius: 8 }}
          >
            Catatan : {detail.catatan || "-"}
          </div>
          <div
            className="font-poppins font-medium px-5 py-2 rounded-[8px]"
            style={{ background: "#E3E3E3", color: "#242424", fontSize: 15, borderRadius: 8 }}
          >
            Petugas : {adminNameFromLS}
          </div>
        </div>
        
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)", fontWeight: 600, fontSize: 16 }}
          onClick={() => navigate("/admin/verifikasi")}
        >
          Kembali
        </button>
      </div>
    );
  }
  else {
    actionSection = (
      <div className="flex justify-end">
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)", fontWeight: 600, fontSize: 16 }}
          onClick={() => navigate("/admin/verifikasi")}
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#6A8BB0] font-poppins">
      {/* Sidebar */}
    <aside
      className="bg-[#E6E6E6] flex flex-col py-8 px-7 border-r border-[#eaeaea] h-screen fixed top-0 left-0 z-20"
      style={{ width: 360 }}
    >
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
        ].map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 px-4 py-2 text-left transition-all hover:opacity-80
                ${
                  isActive
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
        {/* Card Atas */}
        <div
          className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto mb-10"
          style={{ minHeight: 70 }}
        >
          <span className="font-poppins font-semibold text-[24px] text-[#474646]">
            Detail Pengajuan Visitor
          </span>
          <div className="relative ml-auto" style={{ minWidth: 200 }}>
            <div className="absolute top-0 left-0 w-full h-full" style={{ background: "rgba(106,139,176,0.13)", borderRadius: 15, zIndex: 0 }} />
            <button
              className="relative flex items-center gap-2 px-5 py-2 cursor-pointer z-10 hover:opacity-80 transition-opacity"
              style={{ borderRadius: 15, background: "transparent" }}
            >
              <span className="w-[38px] h-[38px] rounded-full bg-[#6A8BB0] flex items-center justify-center text-white text-[24px] font-poppins font-semibold mr-2">
                {(adminNameFromLS[0] || "A").toUpperCase()}
              </span>
              <span className="font-poppins font-medium text-[18px] leading-[36px] text-[#474646]">
                {adminNameFromLS}
              </span>
            </button>
          </div>
        </div>

        {/* Card Detail */}
        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-white rounded-[20px] shadow-md p-8 relative">
            <div className="text-[15px] mb-3 font-poppins flex items-center">
              <span className="cursor-pointer" style={{ color: "#1E3A8A", fontWeight: 500 }} onClick={() => navigate("/admin/verifikasi")}>
                verifikasi & persetujuan
              </span>
              <span style={{ color: "#8C8C8C", marginLeft: 4 }}>
                {">"} <span>Detail Pengajuan</span>
              </span>
            </div>

            {err && (
              <div
                className="mb-3 font-poppins"
                style={{ background: "#FFDEDB", color: "#B42318", border: "1px solid #FEE4E2", borderRadius: 10, padding: "10px 12px" }}
              >
                {err}
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="font-poppins font-semibold text-[22px]" style={{ color: "#242424", letterSpacing: "0.01em" }}>
                {loading ? "Memuat..." : detail.nama}
              </span>
              {getStatusBadge()}
            </div>

            <div style={{ width: "100%", height: 2, background: "#E3E3E3", borderRadius: 2, margin: "8px 0 18px 0" }} />

            <h3 className="font-poppins font-semibold text-[18px] text-[#242424] mb-3">
              Data Diri Pengunjung
            </h3>
            <div className="flex flex-wrap gap-y-5 mb-6">
              <div className="w-full md:w-1/2 pr-0 md:pr-5 flex flex-col gap-y-4">
                <DetailCol label="Nama Pemohon" value={detail.nama} />
                <DetailCol label="Email" value={detail.email} />
                <DetailCol label="Tanggal Kunjungan" value={detail.tanggal} />
                <DetailCol
                  label="Dokumen Pendukung"
                  value={
                    detail.dokumenUrl ? (
                      <a
                        href={detail.dokumenUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleOpenDocument}
                        style={{ color: "#1E3A8A", textDecoration: "underline", fontWeight: 600, marginLeft: "auto" }}
                      >
                        Lihat
                      </a>
                    ) : (
                      "-"
                    )
                  }
                  fileName={detail.dokumenNama}
                  fileUrl={detail.dokumenUrl}
                />
              </div>

              <div className="w-full md:w-1/2 flex flex-col gap-y-4">
                <DetailCol label="Instansi/Perusahaan" value={detail.instansi} />
                <DetailCol label="Nomor Handphone" value={detail.handphone} />
                <DetailCol label="Stasiun Tujuan" value={detail.stasiun} />
                <DetailCol label="Selesai Kunjungan" value={detail.selesaiKunjungan} />
              </div>
            </div>

            <div className="flex flex-wrap gap-y-5 mb-6">
              <div className="w-full md:w-1/2 pr-0 md:pr-5 flex flex-col gap-y-4">
                <DetailCol label="Nomor Pengajuan" value={detail.noPengajuan} />
                <DetailCol label="Nama Penanggung Jawab (PIC)" value={detail.picNama} />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-y-4">
                <DetailCol label="Jabatan Penanggung Jawab" value={detail.picJabatan} />
                <DetailCol label="Layanan Pendampingan" value={prettyAssistanceLabel(detail.layananPendampingan)} />
              </div>
            </div>

            <div className="mb-6">
              <DetailCol label="Tujuan Kunjungan" value={detail.tujuan} fullWidth />
            </div>


            <div style={{ width: "100%", height: 2, background: "#E3E3E3", borderRadius: 2, margin: "10px 0 18px 0" }} />
            <h3 className="font-poppins font-semibold text-[18px] text-[#242424] mb-3">
              Akses Pintu
            </h3>

            <div className="flex flex-wrap gap-y-5 mb-2">
              <div className="w-full md:w-1/2 pr-0 md:pr-5 flex flex-col gap-y-4">
                <DetailCol label="Pintu yang Diajukan" value={detail.accessDoor} />
                <DetailCol label="Waktu Akses" value={detail.accessTime} />
                <DetailCol label="Tujuan Akses" value={detail.accessPurpose} />
                <DetailCol label="Jumlah Pendampingan Protokoler" value={detail.protokolerCount} />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-y-4">
                <DetailCol label="Jumlah & Jenis Kendaraan" value={detail.vehicleType} />
                <DetailCol label="Nopol Kendaraan" value={detail.vehiclePlate} />
                <DetailCol label="Pendampingan Protokoler" value={detail.needProtokolerEscort} />
              </div>
            </div>

            <div style={{ width: "100%", height: 2, background: "#E3E3E3", borderRadius: 2, margin: "18px 0 15px 0" }} />

            {/* ✅ Tampilkan tombol aksi sesuai status */}
            {actionSection}

            <SmallModal
              open={showReject}
              onClose={() => setShowReject(false)}
              title="Konfirmasi Penolakan"
              icon="ic:round-cancel"
              iconColor="#fff"
            >
              <form onSubmit={submitReject}>
                <div className="mb-3 font-poppins font-medium text-[#474646]">
                  Nama Petugas Penolak
                  <input
                    type="text"
                    value={adminNameFromLS}
                    readOnly
                    className="mt-1 block w-full rounded-[10px] bg-[#E3E3E3] px-3 py-2 font-poppins"
                    style={{ color: "#4F4D4D", fontWeight: 500, border: "none" }}
                  />
                </div>
                <div className="mb-5 font-poppins font-medium text-[#474646]">
                  Alasan Penolakan
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Masukkan alasan penolakan..."
                    required
                    className="mt-1 block w-full rounded-[10px] bg-[#E3E3E3] px-3 py-2 font-poppins"
                    style={{ color: "#4F4D4D", fontWeight: 500, border: "none", resize: "vertical" }}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-[8px] font-poppins font-semibold"
                    style={{ background: "#E3E3E3", color: "#474646" }}
                    onClick={() => setShowReject(false)}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-[8px] bg-[#E41D26] text-white font-poppins font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? "Memproses..." : "Tolak"}
                  </button>
                </div>
              </form>
            </SmallModal>

            <SmallModal
              open={showAccept}
              onClose={() => setShowAccept(false)}
              title="Konfirmasi Persetujuan"
              icon="icon-park-twotone:check-one"
              iconColor="#fff"
            >
              <form onSubmit={submitAccept}>
                <div className="mb-3 font-poppins font-medium text-[#474646]">
                  Nama Petugas
                  <input
                    type="text"
                    value={adminNameFromLS}
                    readOnly
                    className="mt-1 block w-full rounded-[10px] bg-[#E3E3E3] px-3 py-2 font-poppins"
                    style={{ color: "#4F4D4D", fontWeight: 500, border: "none" }}
                  />
                </div>
                <div className="mb-5 font-poppins font-medium text-[#474646]">
                  Catatan Persetujuan
                  <textarea
                    value={acceptNote}
                    onChange={(e) => setAcceptNote(e.target.value)}
                    rows={3}
                    placeholder="Masukkan catatan tambahan seperti membawa KTP asli"
                    required
                    className="mt-1 block w-full rounded-[10px] bg-[#E3E3E3] px-3 py-2 font-poppins"
                    style={{ color: "#4F4D4D", fontWeight: 500, border: "none", resize: "vertical" }}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-[8px] font-poppins font-semibold"
                    style={{ background: "#E3E3E3", color: "#474646" }}
                    onClick={() => setShowAccept(false)}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-[8px] text-white font-poppins font-semibold"
                    style={{ background: "#1FAF35" }}
                    disabled={submitting}
                  >
                    {submitting ? "Memproses..." : "Setuju"}
                  </button>
                </div>
              </form>
            </SmallModal>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        main::-webkit-scrollbar { width: 8px; background: #e6e6e6; }
        main::-webkit-scrollbar-thumb { background: #b8c4e2; border-radius: 6px; }
        @media (max-width: 900px) {
          aside { width: 100vw !important; position: static !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function DetailCol({ label, value, fullWidth, fileName, fileUrl }) {
  if (label === "Dokumen Pendukung" && fileName) {
    return (
      <div className={fullWidth ? "w-full mb-2" : "mb-2"}>
        <div className="font-poppins font-medium text-[15px] mb-1" style={{ color: "#242424", fontWeight: 500 }}>
          {label}
        </div>
        <div
          className="rounded-[7px] px-4 py-2 font-poppins flex justify-between items-center"
          style={{
            background: "#E3E3E3",
            color: "#4F4D4D",
            fontWeight: 500,
            width: fullWidth ? "99%" : "100%",
            maxWidth: fullWidth ? 820 : 370,
            display: "flex",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={fileName}
        >
          <span className="mr-2 truncate">{fileName}</span>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1E3A8A", textDecoration: "underline", fontWeight: 600, marginLeft: "auto" }}
            >
              Lihat
            </a>
          ) : (
            <span style={{ marginLeft: "auto", color: "#777" }}>-</span>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={fullWidth ? "w-full mb-2" : "mb-2"}>
      <div className="font-poppins font-medium text-[15px] mb-1" style={{ color: "#242424", fontWeight: 500 }}>
        {label}
      </div>
      <div
        className="rounded-[7px] px-4 py-2 font-poppins"
        style={{
          background: "#E3E3E3",
          color: "#4F4D4D",
          fontWeight: 500,
          width: fullWidth ? "99%" : "100%",
          maxWidth: fullWidth ? 820 : 370,
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={typeof value === "string" ? value : undefined}
      >
        {value || "-"}
      </div>
    </div>
  );
}