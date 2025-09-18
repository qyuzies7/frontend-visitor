import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

// Dummy data riwayat pengembalian
const dummyData = [
  {
    nama: "Azida Kautsar",
    instansi: "Politeknik Elektronika Negeri Surabaya",
    nomorKTP: "3506132436454600",
    nomorHP: "081234526811",
    tanggalKunjungan: "08 Agustus 2025",
    selesaiKunjungan: "11 Agustus 2025",
    alasan: "blablabla",
    penanganan: "blablabla",
    petugas: "Rafi"
  },
  {
    nama: "Milano Sitanggang",
    instansi: "PT Milano Sukses",
    nomorKTP: "1234567890123456",
    nomorHP: "081234567890",
    tanggalKunjungan: "09 Agustus 2025",
    selesaiKunjungan: "11 Agustus 2025",
    alasan: "Kartu hilang",
    penanganan: "Sedang diproses",
    petugas: "Rafi"
  },
  {
    nama: "Yudhita Meika",
    instansi: "Inspeksi Teknik KAI",
    nomorKTP: "9876543210987654",
    nomorHP: "081298765432",
    tanggalKunjungan: "10 Agustus 2025",
    selesaiKunjungan: "11 Agustus 2025",
    alasan: "Kartu rusak",
    penanganan: "Diganti baru",
    petugas: "Rafi"
  },
  {
    nama: "Gading Subagio",
    instansi: "PT Gading Jaya",
    nomorKTP: "4567890123456789",
    nomorHP: "081245678901",
    tanggalKunjungan: "11 Agustus 2025",
    selesaiKunjungan: "11 Agustus 2025",
    alasan: "Kartu hilang",
    penanganan: "Belum ditemukan",
    petugas: "Rafi"
  },
  {
    nama: "Ahmad Arfan",
    instansi: "Vendor Persinyalan",
    nomorKTP: "6543210987654321",
    nomorHP: "081234509876",
    tanggalKunjungan: "11 Agustus 2025",
    selesaiKunjungan: "11 Agustus 2025",
    alasan: "Kartu baik",
    penanganan: "Tidak ada masalah",
    petugas: "Rafi"
  },
  {
    nama: "Azka Mauladina",
    instansi: "Magang PENS",
    nomorKTP: "3210987654321098",
    nomorHP: "081298712345",
    tanggalKunjungan: "12 Agustus 2025",
    selesaiKunjungan: "13 Agustus 2025",
    alasan: "Kartu rusak",
    penanganan: "Sedang penggantian",
    petugas: "Rafi"
  }
];

export default function DetailKerusakan() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = "Admin rafi";

  // Ambil nama dari state (navigate) atau default ke data pertama
  const selectedNama =
    location.state && location.state.nama
      ? location.state.nama
      : dummyData[0].nama;
  // Cari data sesuai nama
  const data =
    dummyData.find((d) => d.nama === selectedNama) || dummyData[0];

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
          {menuItems.map((item) => {
            // Sidebar biru tetap di Riwayat Pengembalian & detail kerusakan
            const isActive =
              location.pathname === item.path ||
              (location.pathname === "/admin/detail-kerusakan" &&
                item.label === "Riwayat Pengembalian");
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
        {/* Kotak atas */}
        <div className="flex gap-8 mb-10 flex-wrap">
          <div
            className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
            style={{ minHeight: 70 }}
          >
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">
              Detail Kerusakan
            </span>
            {/* Profile section */}
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

        {/* Card Detail Section */}
        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-white rounded-[20px] shadow-md px-0 py-0">
            {/* Breadcrumb & Judul */}
            <div className="px-8 pt-6 pb-0">
              <div className="flex items-center gap-2 mb-2">
                <button
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                    color: "#223A7A",
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                  onClick={() => navigate("/admin/riwayat")}
                >
                  Riwayat Pengembalian
                </button>
                <span
                  style={{
                    fontSize: 15,
                    color: "#C4C4C4",
                    fontWeight: 400,
                    margin: "0 1px",
                  }}
                >
                  &gt;
                </span>
                <span
                  style={{
                    fontSize: 15,
                    color: "#A2A2A2",
                    fontWeight: 400,
                  }}
                >
                  Detail Kerusakan
                </span>
              </div>
              <div
                className="font-poppins"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#242424",
                  marginTop: 6,
                  marginBottom: 4,
                  letterSpacing: "0.1px",
                }}
              >
                {data.nama}
              </div>
              <div
                style={{
                  width: "100%",
                  height: 2,
                  background: "#E4E4E4",
                  borderRadius: 2,
                  marginBottom: 16,
                  marginTop: 6,
                }}
              />
            </div>
            {/* Isi Form */}
            <div className="px-8 pb-6">
              <div className="flex flex-row gap-7 mb-6 flex-wrap">
                <div className="flex flex-col gap-4 flex-1 min-w-[230px]">
                  <div>
                    <div className="font-poppins font-medium text-[15px] text-[#474646] mb-1">
                      Nama Pemohon
                    </div>
                    <div className="bg-[#E5E5E5] rounded-[8px] px-4 py-2 font-poppins text-[15px] text-[#474646] font-medium">
                      {data.nama}
                    </div>
                  </div>
                  <div>
                    <div className="font-poppins font-medium text-[15px] text-[#474646] mb-1">
                      Nomor KTP
                    </div>
                    <div className="bg-[#E5E5E5] rounded-[8px] px-4 py-2 font-poppins text-[15px] text-[#474646] font-medium">
                      {data.nomorKTP}
                    </div>
                  </div>
                  <div>
                    <div className="font-poppins font-medium text-[15px] text-[#474646] mb-1">
                      Tanggal Kunjungan
                    </div>
                    <div className="bg-[#E5E5E5] rounded-[8px] px-4 py-2 font-poppins text-[15px] text-[#474646] font-medium">
                      {data.tanggalKunjungan}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 flex-1 min-w-[230px]">
                  <div>
                    <div className="font-poppins font-medium text-[15px] text-[#474646] mb-1">
                      Instansi/Perusahaan
                    </div>
                    <div className="bg-[#E5E5E5] rounded-[8px] px-4 py-2 font-poppins text-[15px] text-[#474646] font-medium">
                      {data.instansi}
                    </div>
                  </div>
                  <div>
                    <div className="font-poppins font-medium text-[15px] text-[#474646] mb-1">
                      Nomor Handphone
                    </div>
                    <div className="bg-[#E5E5E5] rounded-[8px] px-4 py-2 font-poppins text-[15px] text-[#474646] font-medium">
                      {data.nomorHP}
                    </div>
                  </div>
                  <div>
                    <div className="font-poppins font-medium text-[15px] text-[#474646] mb-1">
                      Selesai Kunjungan
                    </div>
                    <div className="bg-[#E5E5E5] rounded-[8px] px-4 py-2 font-poppins text-[15px] text-[#474646] font-medium">
                      {data.selesaiKunjungan}
                    </div>
                  </div>
                </div>
              </div>
              {/* Alasan Kerusakan */}
              <div className="mb-4">
                <div className="font-poppins font-medium text-[15px] text-[#474646] mb-1">
                  Alasan Kerusakan/Kehilangan
                </div>
                <div className="bg-[#E5E5E5] rounded-[8px] px-4 py-2 font-poppins text-[15px] text-[#474646] font-medium">
                  {data.alasan}
                </div>
              </div>
              {/* Penanganan */}
              <div className="mb-4">
                <div className="font-poppins font-medium text-[15px] text-[#474646] mb-1">
                  Penanganan
                </div>
                <div className="bg-[#E5E5E5] rounded-[8px] px-4 py-2 font-poppins text-[15px] text-[#474646] font-medium">
                  {data.penanganan}
                </div>
              </div>
              {/* Petugas */}
              <div className="mt-2 mb-2 flex items-center">
                <button
                  className="bg-[#D9D9D9] font-poppins font-semibold text-[16px] text-[#474646] rounded-[7px] px-5 py-2"
                  style={{ minWidth: 130, fontWeight: 600, borderRadius: 7 }}
                  disabled
                >
                  Petugas : {data.petugas}
                </button>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
          input::placeholder { font-family: 'Poppins', sans-serif; font-weight: 300; font-style: italic; }
          body { overflow-x: hidden; }
        `}</style>
      </main>
    </div>
  );
}