import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

const dummyData = [
  {
    nama: "Azida Kautsar",
    tanggalPinjam: "2025-08-04",
    tanggalKembali: "2025-08-08",
    kondisi: "Baik",
    keterangan: "Selesai",
  },
  {
    nama: "Milano Sitanggang",
    tanggalPinjam: "2025-08-05",
    tanggalKembali: "2025-08-08",
    kondisi: "Hilang",
    keterangan: "Selesai",
  },
  {
    nama: "Azka Mauladina",
    tanggalPinjam: "2025-08-03",
    tanggalKembali: "2025-08-08",
    kondisi: "Hilang",
    keterangan: "Selesai",
  },
  {
    nama: "Yudhita Meika",
    tanggalPinjam: "2025-08-06",
    tanggalKembali: "2025-08-08",
    kondisi: "Rusak",
    keterangan: "Selesai",
  },
  {
    nama: "Ahmad Arfan",
    tanggalPinjam: "2025-08-07",
    tanggalKembali: "2025-08-08",
    kondisi: "Baik",
    keterangan: "Selesai",
  },
  {
    nama: "Gading Subagio",
    tanggalPinjam: "2025-08-08",
    tanggalKembali: "2025-08-08",
    kondisi: "Rusak",
    keterangan: "Selesai",
  },
];

function formatTanggal(str) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const d = new Date(str);
  if (isNaN(d)) return str;
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function RiwayatPengembalian() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = "Admin rafi";

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

  // Filter berdasarkan nama
  const filteredData = dummyData.filter((row) =>
    row.nama.toLowerCase().includes(query.toLowerCase())
  );

  // Export dummy laporan
  const exportLaporan = () => {
    const header = [
      "Nama Pemohon",
      "Tanggal Pinjam",
      "Tanggal Kembali",
      "Kondisi Kartu",
      "Keterangan",
    ].join(",");
    const rows = filteredData.map(d =>
      [
        d.nama,
        formatTanggal(d.tanggalPinjam),
        formatTanggal(d.tanggalKembali),
        d.kondisi,
        d.keterangan,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "riwayat_pengembalian.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        {/* Kotak atas (JANGAN DIUBAH) */}
        <div className="flex gap-8 mb-10 flex-wrap">
          <div
            className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
            style={{ minHeight: 70 }}
          >
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">
              Riwayat Pengembalian
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

        {/* Data Card Riwayat */}
        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-white rounded-[20px] shadow-md px-0 py-0">
            {/* Search & Export */}
            <div className="flex items-center px-8 pt-8 pb-3 justify-between">
              <div className="flex items-center flex-1 bg-white px-4 py-2 rounded-[11px] border border-[#E4E4E4]"
                style={{ maxWidth: 360, background: "#F4F4F4" }}>
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
              <div className="flex-1 flex justify-end">
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
            </div>
            {/* Table */}
            <div className="overflow-x-auto pb-8 px-8">
              <table className="w-full min-w-[730px]">
                <thead>
                  <tr style={{ background: "#F4F4F4" }}>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Nama Pemohon</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Tanggal Pinjam</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Tanggal Kembali</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Kondisi Kartu</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Keterangan</th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "" : "bg-[#F8F8F8]"}>
                      <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">
                        {row.nama}
                      </td>
                      <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">
                        {formatTanggal(row.tanggalPinjam)}
                      </td>
                      <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">
                        {formatTanggal(row.tanggalKembali)}
                      </td>
                      <td className="py-2 px-2 text-center font-poppins font-medium text-[15px] text-[#474646]">
                        {row.kondisi}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className="font-poppins font-semibold rounded-[7px] px-5 py-1 text-white"
                          style={{
                            background: "#34C331",
                            fontWeight: 600,
                            display: "inline-block",
                            borderRadius: 7,
                            fontSize: 15,
                            minWidth: 90,
                          }}
                        >
                          Selesai
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          className="font-poppins font-semibold rounded-[8px] px-5 py-1 text-white"
                          style={{
                            background: "#8E8E8E",
                            fontWeight: 600,
                            fontSize: 15,
                            borderRadius: 8,
                            minWidth: 110,
                          }}
                          onClick={() => navigate("/admin/detail-kerusakan", { state: { nama: row.nama } 
                          })}
                        >
                          Lihat Detail
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
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
          input::placeholder { font-family: 'Poppins', sans-serif; font-weight: 300; font-style: italic; }
        `}</style>
      </main>
    </div>
  );
}