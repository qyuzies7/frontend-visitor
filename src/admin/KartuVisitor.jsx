// /mnt/data/KartuVisitor.jsx
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

// Ganti cara ambil nama petugas sesuai sistem login aplikasi kamu
const namaPetugas = localStorage.getItem("namaPetugas") || "Admin rafi";

// Data dummy untuk tabel visitor
const initialDummyData = [
  {
    nama: "Azida Kautsar",
    instansi: "Politeknik Elektronika Negeri Surabaya",
    nomorPengajuan: "VST-2025-12345677",
    kunjungan: "Observasi magang",
    email: "azida@gmail.com",
    tanggalPinjam: "2025-08-04",
    tanggalKembali: "2025-08-08",
    kondisi: "Baik",
    statusKartu: "Tidak Aktif",
    aksi: "Belum diambil",
    petugasSerah: "",
    alasan: "",
    penanganan: "",
  },
  {
    nama: "Milano Sitanggang",
    instansi: "CV. Digital Media",
    nomorPengajuan: "VST-2025-1234567",
    kunjungan: "Presentasi proposal vendor",
    email: "milanos@digimedia.com",
    tanggalPinjam: "2025-08-05",
    tanggalKembali: "2025-08-08",
    kondisi: "Hilang",
    statusKartu: "Aktif",
    aksi: "Serahkan Kartu",
    petugasSerah: "Rafi",
    alasan: "Kartu hilang saat di perjalanan.",
    penanganan: "Sudah dibuatkan surat kehilangan.",
  },
  {
    nama: "Azka Mauladina",
    instansi: "PT. Bina Karya",
    nomorPengajuan: "VST-2025-1234588",
    kunjungan: "Magang Observasi",
    email: "azka@binakarya.com",
    tanggalPinjam: "2025-08-03",
    tanggalKembali: "2025-08-08",
    kondisi: "Hilang",
    statusKartu: "Tidak Aktif",
    aksi: "Belum diambil",
    petugasSerah: "",
    alasan: "Kartu tidak ditemukan setelah kunjungan.",
    penanganan: "Petugas sudah membuat laporan.",
  },
  {
    nama: "Yudhita Meika",
    instansi: "PT. Telkom Indonesia",
    nomorPengajuan: "VST-2025-2234567",
    kunjungan: "Inspeksi jaringan",
    email: "yudhita@telkom.co.id",
    tanggalPinjam: "2025-08-06",
    tanggalKembali: "2025-08-08",
    kondisi: "Rusak",
    statusKartu: "Tidak Aktif",
    aksi: "Belum diambil",
    petugasSerah: "",
    alasan: "Kartu rusak terlipat & patah.",
    penanganan: "Kartu diganti baru.",
  },
  {
    nama: "Ahmad Arfan",
    instansi: "PT. Kereta Media",
    nomorPengajuan: "VST-2025-3234567",
    kunjungan: "Liputan media",
    email: "ahmad@keretamedia.com",
    tanggalPinjam: "2025-08-07",
    tanggalKembali: "2025-08-08",
    kondisi: "Baik",
    statusKartu: "Aktif",
    aksi: "Serahkan Kartu",
    petugasSerah: "Rafi",
    alasan: "",
    penanganan: "",
  },
  {
    nama: "Gading Subagio",
    instansi: "PT. Sukses Sentosa",
    nomorPengajuan: "VST-2025-4234567",
    kunjungan: "Kontrol vendor",
    email: "gading@sentosa.com",
    tanggalPinjam: "2025-08-08",
    tanggalKembali: "2025-08-08",
    kondisi: "Baik",
    statusKartu: "Aktif",
    aksi: "Belum diambil",
    petugasSerah: "",
    alasan: "",
    penanganan: "",
  },
];

// Helper untuk cek status aktif/tidak aktif otomatis berdasarkan tanggal kembali
function getStatusKartu(tanggalKembali) {
  const today = new Date();
  const kembali = new Date(tanggalKembali);
  return kembali < today ? "Tidak Aktif" : "Aktif";
}

// Helper warna status
const statusColor = {
  Aktif: "#25BF23",
  "Tidak Aktif": "#E53A3D",
};

// Helper warna kondisi kartu
const kondisiColor = {
  Baik: "#28A745",
  Hilang: "#DC3545",
  Rusak: "#FFC107",
};

// Helper warna aksi
const aksiColor = {
  "Terima Kartu": "#007BFF",
  "Serahkan Kartu": "#ED8126",
  "Belum diambil": "#6C757D",
};

/** ===========================
 *   POPUP UTAMA (Header sesuai desain)
 *  =========================== */
function Popup({ show, onClose, children, title }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-20">
      <div className="bg-white rounded-[14px] p-0 min-w-[400px] max-w-[520px] w-[97%] shadow-lg relative">
        {/* Header gradient (circle rounded look) */}
        <div className="flex items-center justify-between px-6 py-4 rounded-t-[14px]"
             style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)" }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Icon icon="material-symbols:id-card-rounded" width={22} color="#fff" />
            </div>
            <span className="font-poppins font-semibold text-white text-[18px]">{title}</span>
          </div>
          <button onClick={onClose}
                  className="ml-2 text-white text-[22px] font-bold hover:opacity-80 transition">×</button>
        </div>
        <div className="px-7 py-7">{children}</div>
      </div>
    </div>
  );
}

/** Seksi data dengan header abu, garis judul, dan garis-baris tipis */
function DataSection({ title, thick = 2, children }) {
  return (
    <div className="rounded-[10px] overflow-hidden mb-4"
         style={{ background: "rgba(100,115,175,0.07)", border: "1px solid rgba(208,205,205,0.56)" }}>
      <div className="px-4 pt-3 pb-2">
        <div className="font-poppins font-medium text-[#919090] text-[14px]">{title}</div>
      </div>
      <div style={{ height: thick, background: "rgba(208,205,205,0.56)" }} />
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="py-2 flex gap-2 text-[14.5px]"
         style={{ borderBottom: "1px solid rgba(208,205,205,0.56)" }}>
      <div className="min-w-[150px] text-[#474646] font-poppins font-medium">{label}</div>
      <div className="text-[#474646] font-poppins font-medium">: {value}</div>
    </div>
  );
}

function BoxPetugas({ label, value }) {
  return (
    <div className="rounded-[10px] px-4 py-3 mb-2"
         style={{ border: "1px solid rgba(208,205,205,0.56)", background: "#FFFFFF" }}>
      <span className="font-poppins font-medium text-[#474646]">
        {label} : {value}
      </span>
    </div>
  );
}

export default function KartuVisitor() {
  const [dummyData, setDummyData] = useState(initialDummyData);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(""); // "serah", "terima", "terima-read", "laporan"
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [laporanKondisi, setLaporanKondisi] = useState("");
  const [laporanAlasan, setLaporanAlasan] = useState("");
  const [laporanPenanganan, setLaporanPenanganan] = useState("");
  const [readonlyLaporan, setReadonlyLaporan] = useState(false);

  // Export laporan (download file excel/csv dummy)
  const exportLaporan = () => {
    const header = [
      "Nama Pemohon",
      "Instansi",
      "Nomor Pengajuan",
      "Tanggal Pinjam",
      "Tanggal Kembali",
      "Kondisi Kartu",
      "Status",
      "Petugas",
    ].join(",");
    const rows = dummyData.map((d) =>
      [
        d.nama,
        d.instansi,
        d.nomorPengajuan,
        d.tanggalPinjam,
        d.tanggalKembali,
        d.kondisi,
        getStatusKartu(d.tanggalKembali),
        d.petugasSerah || "-",
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan_kartu_visitor.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pop up konfirmasi serah kartu
  const openSerahPopup = (idx) => {
    setSelectedIdx(idx);
    setPopupType("serah");
    setShowPopup(true);
  };

  // Pop up konfirmasi terima kartu (ada tombol konfirmasi)
  const openTerimaPopup = (idx) => {
    setSelectedIdx(idx);
    setPopupType("terima");
    setShowPopup(true);
  };

  // Pop up read-only terima kartu
  const openTerimaPopupRead = (idx) => {
    setSelectedIdx(idx);
    setPopupType("terima-read");
    setShowPopup(true);
  };

  // Pop up laporan kartu rusak/hilang
  const openLaporanPopup = (idx, readonly = false) => {
    setSelectedIdx(idx);
    setLaporanKondisi(dummyData[idx].kondisi);
    setLaporanAlasan(dummyData[idx].alasan);
    setLaporanPenanganan(dummyData[idx].penanganan);
    setReadonlyLaporan(readonly);
    setPopupType("laporan");
    setShowPopup(true);
  };

  // Ketika konfirmasi serah kartu
  const handleKonfirmasiSerah = () => {
    setShowPopup(false);
    setDummyData((prev) =>
      prev.map((row, idx) =>
        idx === selectedIdx ? { ...row, aksi: "Serahkan Kartu", petugasSerah: namaPetugas } : row
      )
    );
  };

  // Ketika konfirmasi terima kartu
  const handleKonfirmasiTerima = () => {
    setShowPopup(false);
    setDummyData((prev) =>
      prev.map((row, idx) => (idx === selectedIdx ? { ...row, aksi: "Terima Kartu" } : row))
    );
  };

  // Ketika simpan laporan kondisi kartu hilang/rusak
  const handleSimpanLaporan = () => {
    setDummyData((prev) =>
      prev.map((row, idx) =>
        idx === selectedIdx
          ? {
              ...row,
              kondisi: laporanKondisi,
              alasan: laporanAlasan,
              penanganan: laporanPenanganan,
              petugasSerah: namaPetugas,
            }
          : row
      )
    );
    setShowPopup(false);
  };

  // Format tanggal jadi "DD MMMM YYYY"
  function formatTanggal(str) {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const d = new Date(str);
    if (isNaN(d)) return str;
    return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
            const isActive = window.location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => (window.location.href = item.path)}
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
        {/* Header Atas */}
        <div className="flex gap-8 mb-10 flex-wrap">
          <div
            className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
            style={{ minHeight: 70 }}
          >
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">
              Kartu Visitor
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
                  {namaPetugas[0]}
                </span>
                <span className="font-poppins font-medium text-[18px] leading-[36px] text-[#474646]">
                  {namaPetugas}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-white rounded-[20px] shadow-md px-0 py-0">
            {/* Judul dan tombol export */}
            <div className="flex items-center justify-between px-8 pt-8 pb-3">
              <span className="font-poppins font-medium text-[18px] text-[#474646]">
                Laporan Penyerahan & Pengembalian Kartu Harian
              </span>
              <button
                className="px-5 py-2 rounded-[8px] font-poppins font-medium text-white"
                style={{
                  background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)",
                  fontWeight: 500,
                }}
                onClick={exportLaporan}
              >
                Export Laporan
              </button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto pb-8">
              <table className="w-full min-w-[730px]">
                <thead>
                  <tr style={{ background: "#F4F4F4" }}>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Nama Pemohon
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Tanggal Pinjam
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Tanggal Kembali
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Kondisi Kartu
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Keterangan
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dummyData.map((row, idx) => {
                    const statusAuto = getStatusKartu(row.tanggalKembali);

                    let kondisiBtn = (
                      <button
                        className="font-poppins font-medium rounded-[7px]"
                        style={{
                          background: kondisiColor[row.kondisi] + "99",
                          color: "#212529",
                          fontWeight: 600,
                          minWidth: 90,
                          width: 110,
                          height: 36,
                          display: "inline-block",
                        }}
                        onClick={() =>
                          row.kondisi === "Baik"
                            ? openLaporanPopup(idx, false)
                            : openLaporanPopup(idx, true)
                        }
                      >
                        {row.kondisi}
                      </button>
                    );

                    let statusBtn = (
                      <span
                        className="font-poppins font-medium rounded-[7px] flex items-center justify-center"
                        style={{
                          background: statusColor[statusAuto],
                          color: "#fff",
                          fontWeight: 500,
                          minWidth: 90,
                          width: 110,
                          height: 36,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {statusAuto}
                      </span>
                    );

                    let aksiBtn = null;
                    if (row.aksi === "Belum diambil") {
                      aksiBtn = (
                        <button
                          className="font-poppins font-medium rounded-[7px] flex items-center justify-center"
                          style={{
                            background: aksiColor["Belum diambil"],
                            color: "#fff",
                            minWidth: 130,
                            height: 36,
                            fontSize: 15,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => openSerahPopup(idx)}
                        >
                          Belum diambil
                        </button>
                      );
                    } else if (row.aksi === "Serahkan Kartu") {
                      aksiBtn = (
                        <button
                          className="font-poppins font-medium rounded-[7px] flex items-center justify-center"
                          style={{
                            background: aksiColor["Serahkan Kartu"],
                            color: "#fff",
                            minWidth: 130,
                            height: 36,
                            fontSize: 15,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => openTerimaPopup(idx)}
                        >
                          Serahkan Kartu
                        </button>
                      );
                    } else if (row.aksi === "Terima Kartu") {
                      aksiBtn = (
                        <button
                          className="font-poppins font-medium rounded-[7px] flex items-center justify-center"
                          style={{
                            background: aksiColor["Terima Kartu"],
                            color: "#fff",
                            minWidth: 130,
                            height: 36,
                            fontSize: 15,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => openTerimaPopupRead(idx)}
                        >
                          Terima Kartu
                        </button>
                      );
                    }

                    return (
                      <tr key={idx} className={idx % 2 === 0 ? "" : "bg-[#F8F8F8]"}>
                        <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">
                          {row.nama}
                        </td>
                        <td className="py-2 px-2 text-center font-poppins font-medium text-[15px] text-[#474646]">
                          {formatTanggal(row.tanggalPinjam)}
                        </td>
                        <td className="py-2 px-2 text-center font-poppins font-medium text-[15px] text-[#474646]">
                          {formatTanggal(row.tanggalKembali)}
                        </td>
                        <td className="py-2 px-2 text-center">{kondisiBtn}</td>
                        <td className="py-2 px-2 text-center">{statusBtn}</td>
                        <td className="py-2 px-2 text-center">{aksiBtn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* POPUP SERAH */}
        <Popup
          show={showPopup && popupType === "serah"}
          title="Konfirmasi Penyerahan Kartu Visitor"
          onClose={() => setShowPopup(false)}
        >
          {selectedIdx !== null && (
            <>
              <DataSection title="Data Penerima Kartu" thick={2}>
                <Row label="Nama Lengkap" value={dummyData[selectedIdx].nama} />
                <Row label="Nomor Pengajuan" value={dummyData[selectedIdx].nomorPengajuan} />
                <Row label="Instansi" value={dummyData[selectedIdx].instansi} />
                <Row label="Tanggal Kunjungan" value={dummyData[selectedIdx].kunjungan} />
                <Row label="Email" value={dummyData[selectedIdx].email} />
              </DataSection>

              <BoxPetugas label="Petugas" value={namaPetugas} />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "#ACB3BB" }}
                  onClick={() => setShowPopup(false)}
                >
                  Kembali
                </button>
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)" }}
                  onClick={handleKonfirmasiSerah}
                >
                  Konfirmasi
                </button>
              </div>
            </>
          )}
        </Popup>

        {/* POPUP TERIMA */}
        <Popup
          show={showPopup && popupType === "terima"}
          title="Konfirmasi Penerimaan Kartu Visitor"
          onClose={() => setShowPopup(false)}
        >
          {selectedIdx !== null && (
            <>
              <DataSection title="Data Penerima Kartu" thick={2}>
                <Row label="Nama Lengkap" value={dummyData[selectedIdx].nama} />
                <Row label="Nomor Pengajuan" value={dummyData[selectedIdx].nomorPengajuan} />
                <Row label="Instansi" value={dummyData[selectedIdx].instansi} />
                <Row label="Tanggal Kunjungan" value={dummyData[selectedIdx].kunjungan} />
                <Row label="Email" value={dummyData[selectedIdx].email} />
              </DataSection>

              <BoxPetugas
                label="Petugas Penyerah"
                value={dummyData[selectedIdx].petugasSerah || namaPetugas}
              />
              <BoxPetugas label="Petugas Penerima" value={namaPetugas} />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "#ACB3BB" }}
                  onClick={() => setShowPopup(false)}
                >
                  Kembali
                </button>
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)" }}
                  onClick={handleKonfirmasiTerima}
                >
                  Konfirmasi
                </button>
              </div>
            </>
          )}
        </Popup>

        {/* POPUP TERIMA (READ ONLY) */}
        <Popup
          show={showPopup && popupType === "terima-read"}
          title="Konfirmasi Penerimaan Kartu Visitor"
          onClose={() => setShowPopup(false)}
        >
          {selectedIdx !== null && (
            <>
              <DataSection title="Data Penerima Kartu" thick={2}>
                <Row label="Nama Lengkap" value={dummyData[selectedIdx].nama} />
                <Row label="Nomor Pengajuan" value={dummyData[selectedIdx].nomorPengajuan} />
                <Row label="Instansi" value={dummyData[selectedIdx].instansi} />
                <Row label="Tanggal Kunjungan" value={dummyData[selectedIdx].kunjungan} />
                <Row label="Email" value={dummyData[selectedIdx].email} />
              </DataSection>

              <BoxPetugas
                label="Petugas Penyerah"
                value={dummyData[selectedIdx].petugasSerah || namaPetugas}
              />
              <BoxPetugas label="Petugas Penerima" value={namaPetugas} />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "#ACB3BB" }}
                  onClick={() => setShowPopup(false)}
                >
                  Kembali
                </button>
              </div>
            </>
          )}
        </Popup>

        {/* POPUP LAPORAN */}
        <Popup
          show={showPopup && popupType === "laporan"}
          title="Laporan Kartu Rusak/Hilang"
          onClose={() => setShowPopup(false)}
        >
          {selectedIdx !== null && (
            <div
              style={{
                maxHeight: 400,
                overflowY: "auto",
                paddingRight: 4,
                // padding bottom to avoid button overlap
              }}
              className="custom-scrollbar"
            >
              <DataSection title="Laporan Kartu" thick={3}>
                <Row label="Nama Lengkap" value={dummyData[selectedIdx].nama} />
                <Row label="Instansi" value={dummyData[selectedIdx].instansi} />
                <Row label="Tanggal Kunjungan" value={formatTanggal(dummyData[selectedIdx].tanggalPinjam)} />
                <div className="py-2 flex gap-2 text-[14.5px]"
                     style={{ borderBottom: "1px solid rgba(208,205,205,0.56)" }}>
                  <div className="min-w-[150px] text-[#474646] font-poppins font-medium">
                    Kondisi Kartu
                  </div>
                  <div className="text-[#474646] font-poppins font-medium">
                    :{" "}
                    {readonlyLaporan ? (
                      <span>{dummyData[selectedIdx].kondisi}</span>
                    ) : (
                      <select
                        className="rounded-[7px] px-3 py-2 font-poppins"
                        style={{
                          minWidth: 110,
                          background: "#F7F7F7",
                          border: "1px solid rgba(208,205,205,0.56)",
                        }}
                        value={laporanKondisi}
                        onChange={(e) => setLaporanKondisi(e.target.value)}
                      >
                        <option value="Baik">Baik</option>
                        <option value="Hilang">Hilang</option>
                        <option value="Rusak">Rusak</option>
                      </select>
                    )}
                  </div>
                </div>
                <Row label="Petugas" value={namaPetugas} />
              </DataSection>

              <div className="mb-2 font-poppins font-medium" style={{ color: "#474646" }}>
                Alasan :
              </div>
              <textarea
                className="w-full rounded-[7px] px-3 py-2 font-poppins mb-3"
                style={{
                  minHeight: 70,
                  background: "#F7F7F7",
                  border: "1px solid rgba(208,205,205,0.56)",
                }}
                value={laporanAlasan}
                onChange={(e) => setLaporanAlasan(e.target.value)}
                disabled={readonlyLaporan}
              />
              <div className="mb-2 font-poppins font-medium" style={{ color: "#474646" }}>
                Penanganan :
              </div>
              <textarea
                className="w-full rounded-[7px] px-3 py-2 font-poppins mb-4"
                style={{
                  minHeight: 70,
                  background: "#F7F7F7",
                  border: "1px solid rgba(208,205,205,0.56)",
                }}
                value={laporanPenanganan}
                onChange={(e) => setLaporanPenanganan(e.target.value)}
                disabled={readonlyLaporan}
              />

              <div className="flex justify-end gap-3 mt-3 pb-1">
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "#ACB3BB" }}
                  onClick={() => setShowPopup(false)}
                >
                  Kembali
                </button>
                {!readonlyLaporan && (
                  <button
                    className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                    style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)" }}
                    onClick={handleSimpanLaporan}
                  >
                    Simpan
                  </button>
                )}
              </div>
            </div>
          )}
        </Popup>
      </main>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        th, td { vertical-align: middle !important; }
        /* Custom scrollbar for laporan popup */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d6dae2;
          border-radius: 6px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d6dae2 #f4f4f4;
        }
      `}</style>
    </div>
  );
}