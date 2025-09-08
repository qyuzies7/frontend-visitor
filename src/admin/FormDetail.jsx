import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

// Dummy data awal
const initialData = {
  nama: "Azida Kautsar Milla",
  instansi: "Politeknik Elektronika Negeri Surabaya",
  noKtp: "3506132436454600",
  email: "azida@gmail.com",
  tanggal: "08 Agustus 2025",
  dokumen: "Proposal_Magang.pdf",
  handphone: "081324252611",
  stasiun: "Stasiun Lempuyangan",
  selesaiKunjungan: "11 Agustus 2025",
  noPengajuan: "VST-2025-12345677",
  tujuan: "Melakukan observasi dan kegiatan magang di PT KAI",
};

const adminName = "Rafi";
const STATUS_KEY = "status_pengajuan_azida";
const CATATAN_KEY = "catatan_pengajuan_azida";

export default function FormDetail() {
  // Ambil status dan catatan dari localStorage supaya sinkron dengan halaman verifikasi
  const getStatusLocal = () => localStorage.getItem(STATUS_KEY) || "Menunggu Persetujuan";
  const getCatatanLocal = () => localStorage.getItem(CATATAN_KEY) || "";

  const [showReject, setShowReject] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acceptNote, setAcceptNote] = useState("");
  const [status, setStatus] = useState(getStatusLocal());
  const [catatan, setCatatan] = useState(getCatatanLocal());
  const navigate = useNavigate();

  // Sinkron status & catatan dengan localStorage (reload/masuk kembali tetap update)
  useEffect(() => {
    setStatus(getStatusLocal());
    setCatatan(getCatatanLocal());
  }, []);

  // Update localStorage setiap kali status/catatan berubah
  useEffect(() => {
    localStorage.setItem(STATUS_KEY, status);
    localStorage.setItem(CATATAN_KEY, catatan);
  }, [status, catatan]);

  // Badge status
  const getStatusBadge = () => {
    if (status === "Menunggu Persetujuan") {
      return (
        <span
          className="flex items-center px-4 py-2 font-poppins font-semibold text-[16px]"
          style={{
            color: "#D69E2E",
            background: "#FEF5E7",
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          Menunggu Persetujuan
        </span>
      );
    }
    if (status === "Ditolak") {
      return (
        <span
          className="flex items-center px-4 py-2 font-poppins font-semibold text-[16px]"
          style={{
            color: "#FC0000",
            background: "#FFDEDB",
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          Persetujuan Ditolak
        </span>
      );
    }
    if (status === "Disetujui") {
      return (
        <span
          className="flex items-center px-4 py-2 font-poppins font-semibold text-[16px]"
          style={{
            color: "#47D62E",
            background: "#E7FEED",
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          Disetujui
        </span>
      );
    }
  };

  // Pop up aksi
  const handleReject = () => {
    setShowReject(true);
    setRejectReason("");
  };
  const handleAccept = () => {
    setShowAccept(true);
    setAcceptNote("");
  };
  const submitReject = (e) => {
    e.preventDefault();
    setStatus("Ditolak");
    setCatatan(rejectReason);
    setShowReject(false);
    localStorage.setItem(STATUS_KEY, "Ditolak");
    localStorage.setItem(CATATAN_KEY, rejectReason);
  };
  const submitAccept = (e) => {
    e.preventDefault();
    setStatus("Disetujui");
    setCatatan(acceptNote);
    setShowAccept(false);
    localStorage.setItem(STATUS_KEY, "Disetujui");
    localStorage.setItem(CATATAN_KEY, acceptNote);
  };

  // Aksi bawah
  let actionSection;
  if (status === "Menunggu Persetujuan") {
    actionSection = (
      <div className="flex gap-4 justify-end">
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{
            background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)",
            fontWeight: 600,
            fontSize: 16,
          }}
          onClick={() => navigate("/admin/verifikasi")}
        >
          Kembali
        </button>
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{
            background: "#E41D26",
            fontWeight: 600,
            fontSize: 16,
          }}
          onClick={handleReject}
        >
          Tolak
        </button>
        <button
          className="px-8 py-2 text-white font-poppins font-semibold rounded-[7px]"
          style={{
            background: "#1FAF35",
            fontWeight: 600,
            fontSize: 16,
          }}
          onClick={handleAccept}
        >
          Setuju
        </button>
      </div>
    );
  } else if (status === "Ditolak") {
    actionSection = (
      <div className="flex gap-4 items-center">
        <div
          className="font-poppins font-semibold px-5 py-2 rounded-[8px]"
          style={{
            color: "#FF0004",
            background: "#FFDEDB",
            fontSize: 15,
            borderRadius: 8,
            marginRight: 10,
            minWidth: 0,
            maxWidth: 320,
            overflowWrap: "break-word"
          }}
        >
          {catatan || "-"}
        </div>
        <div
          className="font-poppins font-medium px-5 py-2 rounded-[8px]"
          style={{
            background: "#E3E3E3",
            color: "#242424",
            fontSize: 15,
            borderRadius: 8,
          }}
        >
          Petugas : {adminName}
        </div>
      </div>
    );
  } else if (status === "Disetujui") {
    actionSection = (
      <div className="flex gap-4 items-center">
        <div
          className="font-poppins font-medium px-5 py-2 rounded-[8px]"
          style={{
            background: "#E3E3E3",
            color: "#242424",
            fontSize: 15,
            borderRadius: 8,
          }}
        >
          Catatan : {catatan || "-"}
        </div>
        <div
          className="font-poppins font-medium px-5 py-2 rounded-[8px]"
          style={{
            background: "#E3E3E3",
            color: "#242424",
            fontSize: 15,
            borderRadius: 8,
          }}
        >
          Petugas : {adminName}
        </div>
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
          <div
            style={{
              width: "100%",
              height: 2,
              background: "#C4C4C4",
              borderRadius: 2,
              margin: "0 auto",
            }}
          />
        </div>
        <nav className="flex flex-col gap-4 mt-2">
          {[
            { label: "Dashboard", icon: "streamline-plump:user-pin-remix", path: "/admin/dashboard" },
            { label: "Verifikasi & Persetujuan", icon: "streamline-sharp:time-lapse-solid", path: "/admin/verifikasi" },
            { label: "Kartu Visitor", icon: "solar:card-recive-outline", path: "/admin/kartu-visitor" },
            { label: "Riwayat Pengembalian", icon: "solar:card-search-broken", path: "/admin/riwayat" },
          ].map((item) => {
            const isActive = item.path === "/admin/verifikasi";
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
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
        {/* Card Atas */}
        <div
          className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto mb-10"
          style={{ minHeight: 70 }}
        >
          <span className="font-poppins font-semibold text-[24px] text-[#474646]">
            Detail Pengajuan Visitor
          </span>
          {/* Profile section */}
          <div className="relative ml-auto" style={{ minWidth: 200 }}>
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: "rgba(106,139,176,0.13)",
                borderRadius: 15,
                zIndex: 0,
              }}
            ></div>
            <button
              className="relative flex items-center gap-2 px-5 py-2 cursor-pointer z-10 hover:opacity-80 transition-opacity"
              style={{
                borderRadius: 15,
                background: "transparent",
              }}
            >
              <span className="w-[38px] h-[38px] rounded-full bg-[#6A8BB0] flex items-center justify-center text-white text-[24px] font-poppins font-semibold mr-2">
                A
              </span>
              <span className="font-poppins font-medium text-[18px] leading-[36px] text-[#474646]">
                Admin rafi
              </span>
            </button>
          </div>
        </div>

        {/* Card Detail */}
        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-white rounded-[20px] shadow-md p-8 relative">
            {/* Breadcrumb */}
            <div className="text-[15px] mb-3 font-poppins flex items-center">
              <span
                className="cursor-pointer"
                style={{ color: "#1E3A8A", fontWeight: 500 }}
                onClick={() => navigate("/admin/verifikasi")}
              >
                verifikasi & persetujuan
              </span>
              <span style={{ color: "#8C8C8C", marginLeft: 4 }}>
                {">"} <span>Detail Pengajuan</span>
              </span>
            </div>
            {/* Nama dan Status */}
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-poppins font-semibold text-[22px]"
                style={{ color: "#242424", letterSpacing: "0.01em" }}
              >
                {initialData.nama}
              </span>
              {getStatusBadge()}
            </div>
            {/* Garis bawah */}
            <div
              style={{
                width: "100%",
                height: 2,
                background: "#E3E3E3",
                borderRadius: 2,
                margin: "8px 0 18px 0",
              }}
            />

            {/* Isi Detail 2 kolom */}
            <div className="flex flex-wrap gap-y-5 mb-5">
              {/* Kolom kiri */}
              <div className="w-full md:w-1/2 pr-0 md:pr-5 flex flex-col gap-y-4">
                <DetailCol label="Nama Pemohon" value={initialData.nama} />
                <DetailCol label="Nomor KTP" value={initialData.noKtp} />
                <DetailCol label="Email" value={initialData.email} />
                <DetailCol label="Tanggal Kunjungan" value={initialData.tanggal} />
                <DetailCol
                  label="Dokumen Pendukung"
                  value={
                    <a
                      href={"/dummy_files/" + initialData.dokumen}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1E3A8A",
                        textDecoration: "underline",
                        fontWeight: 600,
                        marginLeft: "auto",
                      }}
                    >
                      Lihat
                    </a>
                  }
                  fileName={initialData.dokumen}
                />
              </div>
              {/* Kolom kanan */}
              <div className="w-full md:w-1/2 flex flex-col gap-y-4">
                <DetailCol label="Instansi/Perusahaan" value={initialData.instansi} />
                <DetailCol label="Nomor Handphone" value={initialData.handphone} />
                <DetailCol label="Stasiun Tujuan" value={initialData.stasiun} />
                <DetailCol label="Selesai Kunjungan" value={initialData.selesaiKunjungan} />
                <DetailCol label="Nomor Pengajuan" value={initialData.noPengajuan} />
              </div>
            </div>
            {/* Tujuan Kunjungan satu baris, full lebar */}
            <div>
              <DetailCol
                label="Tujuan Kunjungan"
                value={initialData.tujuan}
                fullWidth
              />
            </div>

            {/* Garis bawah kedua */}
            <div
              style={{
                width: "100%",
                height: 2,
                background: "#E3E3E3",
                borderRadius: 2,
                margin: "18px 0 15px 0",
              }}
            />

            {actionSection}

            {/* Popup Tolak */}
            {showReject && (
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.15)] flex items-center justify-center z-[60]">
                <form
                  className="bg-white p-10 rounded-[20px] shadow-lg min-w-[400px] w-[99%] max-w-[500px] relative"
                  onSubmit={submitReject}
                >
                  <div className="flex flex-col items-center mb-7">
                    <Icon icon="ic:round-cancel" color="#E41D26" width={56} height={56} />
                    <span className="font-poppins font-bold" style={{ color: "#E41D26", fontSize: 28, marginTop: 16 }}>
                      Konfirmasi Penolakan
                    </span>
                  </div>
                  <div className="mb-2 font-poppins font-medium text-[#474646]">
                    Nama Petugas Penolak
                    <input
                      type="text"
                      value={adminName}
                      readOnly
                      className="mt-1 block w-full rounded-md bg-[#E3E3E3] px-3 py-2 font-poppins"
                      style={{ color: "#4F4D4D", fontWeight: 500, border: "none" }}
                    />
                  </div>
                  <div className="mb-5 font-poppins font-medium text-[#474646]">
                    Alasan Penolakan
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Masukkan alasan penolakan..."
                      required
                      className="mt-1 block w-full rounded-md bg-[#E3E3E3] px-3 py-2 font-poppins"
                      style={{ color: "#4F4D4D", fontWeight: 500, border: "none", resize: "vertical" }}
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 rounded font-poppins font-semibold"
                      style={{ background: "#E3E3E3", color: "#474646" }}
                      onClick={() => setShowReject(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-[#E41D26] text-white font-poppins font-semibold"
                    >
                      Tolak
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Popup Setuju */}
            {showAccept && (
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.15)] flex items-center justify-center z-[60]">
                <form
                  className="bg-white p-10 rounded-[20px] shadow-lg min-w-[400px] w-[99%] max-w-[500px] relative"
                  onSubmit={submitAccept}
                >
                  <div className="flex flex-col items-center mb-7">
                    <Icon icon="icon-park-twotone:check-one" color="#1FAF35" width={56} height={56} />
                    <span className="font-poppins font-bold" style={{ color: "#1FAF35", fontSize: 28, marginTop: 16 }}>
                      Konfirmasi Persetujuan
                    </span>
                  </div>
                  <div className="mb-2 font-poppins font-medium text-[#474646]">
                    Nama Petugas
                    <input
                      type="text"
                      value={adminName}
                      readOnly
                      className="mt-1 block w-full rounded-md bg-[#E3E3E3] px-3 py-2 font-poppins"
                      style={{ color: "#4F4D4D", fontWeight: 500, border: "none" }}
                    />
                  </div>
                  <div className="mb-5 font-poppins font-medium text-[#474646]">
                    Catatan Persetujuan
                    <textarea
                      value={acceptNote}
                      onChange={e => setAcceptNote(e.target.value)}
                      rows={3}
                      placeholder="Masukkan catatan tambahan seperti membawa KTP asli"
                      required
                      className="mt-1 block w-full rounded-md bg-[#E3E3E3] px-3 py-2 font-poppins"
                      style={{ color: "#4F4D4D", fontWeight: 500, border: "none", resize: "vertical" }}
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 rounded font-poppins font-semibold"
                      style={{ background: "#E3E3E3", color: "#474646" }}
                      onClick={() => setShowAccept(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-[#1FAF35] text-white font-poppins font-semibold"
                    >
                      Setuju
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Custom CSS untuk font dan responsive */}
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

// Komponen detail satu baris
function DetailCol({ label, value, fullWidth, fileName }) {
  if (label === "Dokumen Pendukung" && fileName) {
    return (
      <div className={fullWidth ? "w-full mb-2" : "mb-2"}>
        <div
          className="font-poppins font-medium text-[15px] mb-1"
          style={{ color: "#242424", fontWeight: 500 }}
        >
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
        >
          <span className="mr-2">{fileName}</span>
          <a
            href={"/dummy_files/" + fileName}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#1E3A8A",
              textDecoration: "underline",
              fontWeight: 600,
              marginLeft: "auto",
            }}
          >
            Lihat
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className={fullWidth ? "w-full mb-2" : "mb-2"}>
      <div
        className="font-poppins font-medium text-[15px] mb-1"
        style={{ color: "#242424", fontWeight: 500 }}
      >
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
      >
        {value}
      </div>
    </div>
  );
}