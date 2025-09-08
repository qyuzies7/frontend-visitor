import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

const STATUS_KEY = "status_pengajuan_azida";
// Dummy data 
const dummyPengajuan = [
  {
    nama: "Azida Kautsar",
    jenis: "Magang",
    tanggal: "08 Agustus 2025",
    dokumen: "dummy.pdf",
    status: localStorage.getItem(STATUS_KEY) || "Menunggu",
  },
  {
    nama: "Milano Sitanggang",
    jenis: "Vendor",
    tanggal: "09 Agustus 2025",
    dokumen: "dummy.png",
    status: "Menunggu",
  },
  {
    nama: "Maula Azkadina",
    jenis: "Magang",
    tanggal: "09 Agustus 2025",
    dokumen: "dummy.jpg",
    status: "Diterima",
  },
  {
    nama: "Yudhita Meika",
    jenis: "Inspeksi",
    tanggal: "10 Agustus 2025",
    dokumen: "dummy.docx",
    status: "Diterima",
  },
  {
    nama: "Ahmad Arfan",
    jenis: "Vendor",
    tanggal: "11 Agustus 2025",
    dokumen: "dummy.pdf",
    status: "Diterima",
  },
  {
    nama: "Gading Subagio",
    jenis: "Inspeksi",
    tanggal: "11 Agustus 2025",
    dokumen: "dummy.png",
    status: "Ditolak",
  },
];

const statusConfig = {
  Menunggu: {
    bg: "#FEF5E7",
    color: "#D69E2E",
    label: "Menunggu",
  },
  Diterima: {
    bg: "#E7FEED",
    color: "#47D62E",
    label: "Diterima",
  },
  Ditolak: {
    bg: "#FFDEDB",
    color: "#FF0000",
    label: "Ditolak",
  },
};

export default function VerifikasiPersetujuan() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = "Admin rafi";

  const filteredData = dummyPengajuan.filter((item) =>
    item.nama.toLowerCase().includes(query.toLowerCase())
  );

  const menuItems = [
    {
      label: "Dashboard",
      icon: "streamline-plump:user-pin-remix",
      path: "/admin/dashboard",
    },
    {
      label: "Verifikasi & Persetujuan",
      icon: "streamline-sharp:time-lapse-solid",
      path: "/admin/verifikasi",
    },
    {
      label: "Kartu Visitor",
      icon: "solar:card-recive-outline",
      path: "/admin/kartu-visitor",
    },
    {
      label: "Riwayat Pengembalian",
      icon: "solar:card-search-broken",
      path: "/admin/riwayat",
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    navigate("/admin");
    setShowDropdown(false);
  };

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Untuk simulasi membuka file dummy
  const handleLihatDokumen = (file) => {
    alert(`File: ${file} terbuka (dummy)`);
  };

  return (
    <div className="min-h-screen flex bg-[#6A8BB0] font-poppins overflow-x-hidden">
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
          {menuItems.map((item) => {
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
        {/* Top Card */}
        <div className="flex gap-8 mb-10 flex-wrap">
          <div
            className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
            style={{ minHeight: 70, width: "100%", maxWidth: 900 }}
          >
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">
              Verifikasi & Persetujuan
            </span>
            <div
              className="relative ml-auto"
              style={{ minWidth: 200 }}
              ref={dropdownRef}
            >
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
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <span className="w-[38px] h-[38px] rounded-full bg-[#6A8BB0] flex items-center justify-center text-white text-[24px] font-poppins font-semibold mr-2">
                  {adminName[0]}
                </span>
                <span className="font-poppins font-medium text-[18px] leading-[36px] text-[#474646]">
                  {adminName}
                </span>
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

        {/* Card Table Section */}
        <div
          className="mx-auto bg-[#fff] rounded-[20px] shadow-md px-8 py-7"
          style={{ borderRadius: 20, width: "100%", maxWidth: 900 }}
        >
          {/* Search & Menunggu Count */}
          <div className="flex items-center mb-5">
            <div className="flex items-center flex-1 bg-white px-4 py-2 rounded-[11px] border border-[#E4E4E4] mr-3" style={{ maxWidth: 360 }}>
              <Icon icon="ic:round-search" width={28} color="#474646" className="mr-2" />
              <input
                type="text"
                placeholder="cari berdasarkan nama pemohon"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 outline-none bg-transparent border-0 text-[17px] font-poppins font-light italic text-[#474646]"
                style={{ fontStyle: "italic", fontWeight: 300 }}
              />
            </div>
            <div className="font-poppins font-medium text-[#474646] text-[18px] ml-auto">
              Menunggu : {dummyPengajuan.filter(d => d.status === "Menunggu").length}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F4F4F4" }}>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Nama Pemohon</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Jenis Kunjungan</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Tanggal Kunjungan</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Dokumen</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Status</th>
                  <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-[#F8F8F8]'}>
                    <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">{row.nama}</td>
                    <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">{row.jenis}</td>
                    <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">{row.tanggal}</td>
                    <td className="py-2 px-2 text-center">
                      <button
                        className="px-5 py-1 font-poppins font-semibold text-white text-[15px] rounded-[9px] transition-all"
                        style={{
                          background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)",
                          boxShadow: "0 2px 8px rgba(90,90,140,0.07)",
                        }}
                        onClick={() => handleLihatDokumen(row.dokumen)}
                      >
                        Lihat
                      </button>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div
                        className="status-btn font-poppins font-semibold text-[15px] px-5 py-1 rounded-[8px]"
                        style={{
                          background: statusConfig[row.status].bg,
                          color: statusConfig[row.status].color,
                          minWidth: "110px",
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {statusConfig[row.status].label}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        className="px-5 py-1 font-poppins font-semibold text-white text-[15px] rounded-[8px] transition-all"
                        style={{
                          background: "#8E8E8E",
                        }}
                        onClick={() => navigate("/admin/form-detail")}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
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

      {/* Font import dan custom CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        input::placeholder { font-family: 'Poppins', sans-serif; font-weight: 300; font-style: italic; }
        body { overflow-x: hidden; }
        .status-btn { min-width: 110px; text-align: center; }
        @media (max-width: 900px) {
          aside { width: 100vw !important; position: static !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}