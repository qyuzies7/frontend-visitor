import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

export default function KartuVisitor() {
  const [showDropdown, setShowDropdown] = useState(false);
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
        {/* Header */}
        <div className="flex gap-8 mb-10 flex-wrap">
          <div
            className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
            style={{ minHeight: 70 }}
          >
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">
              Kartu Visitor
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

        {/* Content Area */}
        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-white rounded-[20px] shadow-md p-8 text-center">
            <Icon icon="solar:card-recive-outline" width={80} height={80} className="mx-auto mb-4 text-[#6A8BB0]" />
            <h3 className="font-poppins font-semibold text-[24px] text-[#474646]">
              Halaman Kartu Visitor
            </h3>
            <p className="font-poppins text-[16px] text-gray-600">
              Konten halaman akan ditambahkan di sini
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
    </div>
  );
}