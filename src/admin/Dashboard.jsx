import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

const dummyStats = {
  aktif: 20,
  verifikasi: 5,
  masukHariIni: 10,
  keluarHariIni: 5,
  rusak: 5,
  hilang: 2,
};

const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "streamline-plump:user-pin-remix",
  },
  {
    key: "verifikasi",
    label: "Verifikasi & Persetujuan",
    icon: "streamline-sharp:time-lapse-solid",
  },
  {
    key: "visitor",
    label: "Kartu Visitor",
    icon: "solar:card-recive-outline",
  },
  {
    key: "riwayat",
    label: "Riwayat Pengembalian",
    icon: "solar:card-search-broken",
  },
];

const cardConfig = [
  {
    title: "Total Aktif",
    valueKey: "aktif",
    icon: "streamline-plump:user-pin-remix",
  },
  {
    title: "Menunggu Verifikasi",
    valueKey: "verifikasi",
    icon: "streamline-sharp:time-lapse-solid",
  },
  {
    title: "Total Kartu Masuk Hari Ini",
    valueKey: "masukHariIni",
    icon: "solar:card-recive-outline",
  },
  {
    title: "Total Kartu Keluar Hari Ini",
    valueKey: "keluarHariIni",
    icon: "solar:card-send-outline",
  },
  {
    title: "Total Kartu Rusak",
    valueKey: "rusak",
    icon: "mdi:credit-card-remove-outline",
  },
  {
    title: "Kartu Hilang",
    valueKey: "hilang",
    icon: "solar:card-search-broken",
  },
];

export default function Dashboard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const dropdownRef = useRef();
  const adminName = "Admin rafi";

  // Handle click outside dropdown
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

  // Isi halaman berdasarkan menu aktif
  function renderPageContent() {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            {/* Dashboard & Profile Card */}
            <div className="flex gap-8 mb-10 flex-wrap">
              <div
                className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
                style={{ minHeight: 70 }}
              >
                <span className="font-poppins font-semibold text-[24px] text-[#474646]">
                  Dashboard
                </span>
                {/* Profile section */}
                <div
                  className="relative ml-auto"
                  style={{ minWidth: 200 }}
                  ref={dropdownRef}
                >
                  {/* Transparent box behind profile */}
                  <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      background: "rgba(106,139,176,0.13)",
                      borderRadius: 15,
                      zIndex: 0,
                    }}
                  ></div>
                  <button
                    className="relative flex items-center gap-2 px-5 py-2 cursor-pointer z-10"
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
                        className="w-full text-left text-[#474646] font-poppins font-medium text-[18px] py-2 hover:bg-[#F1F2F6] rounded-md"
                        onClick={() => alert("Logout berhasil!")}
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Cards Section */}
            <div
              className="grid gap-x-8 gap-y-7 w-full"
              style={{
                gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
                maxWidth: 900,
                margin: "0 auto",
              }}
            >
              {cardConfig.map((card, idx) => (
                <div
                  key={card.title}
                  className="bg-white rounded-[20px] px-5 py-5 flex flex-col justify-between shadow relative"
                  style={{
                    width: "100%",
                    maxWidth: 440,
                    height: 155,
                    boxShadow: "0 2px 8px rgba(90,90,140,0.07)",
                    display: "flex",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-poppins font-semibold text-[18px] text-[#474646]">
                      {card.title}
                    </span>
                    <span
                      className="w-[52px] h-[52px] rounded-[15px] flex items-center justify-center
                        bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD]"
                    >
                      <Icon icon={card.icon} width={28} height={28} color="#fff" />
                    </span>
                  </div>
                  <div className="mt-3 font-poppins font-bold text-[28px] text-[#474646]">
                    {dummyStats[card.valueKey]}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case "verifikasi":
        return (
          <div className="w-full max-w-[900px] mx-auto bg-white rounded-[20px] shadow-md px-8 py-10 mt-8">
            <h2 className="font-poppins font-semibold text-[22px] text-[#474646] mb-5">
              Verifikasi & Persetujuan
            </h2>
            <p className="font-poppins text-[16px] text-[#474646]">
              Ini halaman Verifikasi & Persetujuan. Kamu bisa menambahkan konten sesuai kebutuhan di sini!
            </p>
          </div>
        );
      case "visitor":
        return (
          <div className="w-full max-w-[900px] mx-auto bg-white rounded-[20px] shadow-md px-8 py-10 mt-8">
            <h2 className="font-poppins font-semibold text-[22px] text-[#474646] mb-5">
              Kartu Visitor
            </h2>
            <p className="font-poppins text-[16px] text-[#474646]">
              Ini halaman Kartu Visitor. Konten detail tentang kartu visitor bisa ditaruh di sini.
            </p>
          </div>
        );
      case "riwayat":
        return (
          <div className="w-full max-w-[900px] mx-auto bg-white rounded-[20px] shadow-md px-8 py-10 mt-8">
            <h2 className="font-poppins font-semibold text-[22px] text-[#474646] mb-5">
              Riwayat Pengembalian
            </h2>
            <p className="font-poppins text-[16px] text-[#474646]">
              Ini halaman Riwayat Pengembalian. Tampilkan data pengembalian kartu, dll di sini.
            </p>
          </div>
        );
      default:
        return null;
    }
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
        <div className="mb-12">
          <div
            style={{
              width: "98%",
              height: 2,
              background: "#C4C4C4",
              borderRadius: 2,
              margin: "0 auto",
            }}
          />
        </div>
        <nav className="flex flex-col gap-4 mt-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveMenu(item.key)}
              className={`flex items-center gap-4 px-4 py-2 text-left transition-all
                ${activeMenu === item.key
                  ? "bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD] text-white font-semibold rounded-[15px]"
                  : "bg-transparent text-[#474646] font-semibold"
                } text-[17px]`}
              style={activeMenu === item.key ? { boxShadow: "0 2px 8px rgba(90,90,140,0.07)" } : {}}
            >
              <span className="flex items-center">
                <Icon icon={item.icon} width={32} height={32} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col px-2 md:px-12 py-10 transition-all"
        style={{ marginLeft: 360, minHeight: "100vh", width: "100%" }}
      >
        {renderPageContent()}
      </main>
      {/* Font import dan custom CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        main::-webkit-scrollbar { width: 8px; background: #e6e6e6; }
        main::-webkit-scrollbar-thumb { background: #b8c4e2; border-radius: 6px; }
        @media (max-width: 900px) {
          aside { width: 100vw !important; position: static !important; }
          main { margin-left: 0 !important; }
          .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}