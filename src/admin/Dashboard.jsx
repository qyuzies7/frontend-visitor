import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import kaiLogo from "../assets/KAI-logo.png";

import {
  getActiveCards,
  getVerificationsAll,
  getTodayIssued,
  getTodayReturned,
  getDamagedCards,
  getLostCards,
  adminLogout,
} from "../api";

const cardConfig = [
  { title: "Total Aktif",                 valueKey: "aktif",        icon: "streamline-plump:user-pin-remix" },
  { title: "Menunggu Verifikasi",         valueKey: "verifikasi",   icon: "streamline-sharp:time-lapse-solid" },
  { title: "Total Kartu Masuk Hari Ini",  valueKey: "masukHariIni", icon: "solar:card-recive-outline" },
  { title: "Total Kartu Keluar Hari Ini", valueKey: "keluarHariIni",icon:"solar:card-send-outline" },
  { title: "Total Kartu Rusak",           valueKey: "rusak",        icon: "mdi:credit-card-remove-outline" },
  { title: "Total Kartu Hilang",          valueKey: "hilang",       icon: "solar:card-search-broken" },
];

function extractArray(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
}

function isPendingStatus(raw) {
  const s = String(
    raw?.status ?? raw?.application_status ?? raw?.state ?? raw ?? ""
  ).toLowerCase();
  return (
    s === "pending" ||
    s === "menunggu" ||
    s === "menunggu persetujuan" ||
    s === "processing" ||
    s === "in_review" ||
    s === "review" ||
    s.includes("pending") ||
    s.includes("menunggu") ||
    s.includes("process") ||
    s.includes("waiting") ||
    s.includes("review")
  );
}

function readCondition(item) {
  return (
    item?.condition ??
    item?.card_condition ??
    item?.kondisi ??
    item?.status_condition ??
    ""
  );
}
function isLost(item) {
  const v = String(readCondition(item)).toLowerCase();
  return v === "lost" || v === "hilang" || v.includes("lost") || v.includes("hilang");
}
function isDamaged(item) {
  const v = String(readCondition(item)).toLowerCase();
  return v === "damaged" || v === "rusak" || v.includes("damaged") || v.includes("rusak");
}

function parseFlexibleTotal(res) {
  const d = res?.data;

  if (typeof d === "number") return d;
  if (typeof d === "string" && !isNaN(Number(d))) return Number(d);

  const keys = [
    "total", "count",
    "damaged", "lost", "rusak", "hilang",
    "total_damaged", "total_lost",
    "totalRusak", "totalHilang",
    "count_damaged", "count_lost",
    "jumlah_rusak", "jumlah_hilang",
  ];
  for (const k of keys) {
    const v = d?.[k];
    if (typeof v === "number") return v;
    if (typeof v === "string" && !isNaN(Number(v))) return Number(v);
  }

  const containers = ["counts", "stats", "data", "result"];
  for (const c of containers) {
    const obj = d?.[c];
    if (obj && typeof obj === "object") {
      for (const k of keys) {
        const v = obj?.[k];
        if (typeof v === "number") return v;
        if (typeof v === "string" && !isNaN(Number(v))) return Number(v);
      }
      if (typeof obj?.total === "number") return obj.total;
      if (typeof obj?.count === "number") return obj.count;
      if (Array.isArray(obj)) return obj.length;
    }
  }

  const arr = extractArray(res);
  if (Array.isArray(arr)) return arr.length;

  if (d && typeof d === "object") {
    const nums = Object.values(d).filter((v) => typeof v === "number");
    if (nums.length === 1) return nums[0];
    if (nums.length > 1) return nums.reduce((s, v) => s + v, 0);
  }
  return 0;
}

export default function Dashboard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState({
    aktif: 0,
    verifikasi: 0,
    masukHariIni: 0,
    keluarHariIni: 0,
    rusak: 0,
    hilang: 0,
  });

  const lastRequestId = useRef(0);
  const refreshTimer = useRef(null);

  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = localStorage.getItem("adminName") || "Admin";
  const adminInitial = adminName?.[0]?.toUpperCase?.() || "A";

  const handleMenuClick = (path) => navigate(path);

  const handleLogout = async () => {
    try { await adminLogout(); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    navigate("/admin");
    setShowDropdown(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const debouncedRefresh = (opts = { initial: false }, delay = 250) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      loadStats(opts);
    }, delay);
  };

  const refreshCounters = async () => {
    const ttlOpt = { ttl: 0 }; 
    try {
      const [damagedRes, lostRes, activeRes] = await Promise.all([
        getDamagedCards(ttlOpt),
        getLostCards(ttlOpt),
        getActiveCards(ttlOpt),
      ]);

      const baseDamaged = parseFlexibleTotal(damagedRes);
      const baseLost = parseFlexibleTotal(lostRes);

      const activeArr = extractArray(activeRes);
      const activeDamaged = activeArr.filter(isDamaged).length;
      const activeLost = activeArr.filter(isLost).length;

      setStats((prev) => ({
        ...prev,
        rusak: baseDamaged + activeDamaged,
        hilang: baseLost + activeLost,
      }));
    } catch {
    }
  };

  const loadStats = async ({ initial = false } = {}) => {
    const reqId = ++lastRequestId.current;

    if (initial) {
      setLoading(true);
      setErr("");
    } else {
      setErr("");
    }

    try {
      const [
        activeCardsRes,
        verificationsRes,
        inTodayRes,
        outTodayRes,
      ] = await Promise.all([
        getActiveCards(),       
        getVerificationsAll(),  
        getTodayIssued(),
        getTodayReturned(),
      ]);

      if (reqId !== lastRequestId.current) return;

      const activeArr = extractArray(activeCardsRes);
      const totalAktif =
        typeof activeCardsRes?.data === "number"
          ? activeCardsRes.data
          : typeof activeCardsRes?.data?.total === "number"
          ? activeCardsRes.data.total
          : activeArr.length;

      const verifArr = extractArray(verificationsRes);
      let totalPending = verifArr.filter(isPendingStatus).length;
      if (totalPending === 0 && typeof verificationsRes?.data?.total === "number") {
        totalPending = verificationsRes.data.total;
      }

      const activeDamaged = activeArr.filter(isDamaged).length;
      const activeLost = activeArr.filter(isLost).length;

      const damagedTotal = activeDamaged;
      const lostTotal = activeLost;

      setStats({
        aktif: totalAktif,
        verifikasi: totalPending,
        masukHariIni: parseFlexibleTotal(inTodayRes),
        keluarHariIni: parseFlexibleTotal(outTodayRes),
        rusak: damagedTotal,
        hilang: lostTotal,
      });
      setErr("");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Gagal memuat dashboard";
      setErr(msg);
    } finally {
      if (reqId === lastRequestId.current) {
        if (initial) setLoading(false);
        setFirstLoad(false);
      }
    }
  };

  useEffect(() => {
    loadStats({ initial: true });
    refreshCounters().catch(() => {});
  }, []);

  useEffect(() => {
    const onFocus = () => debouncedRefresh({ initial: false }, 100);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) debouncedRefresh({ initial: false }, 100);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const onChanged = (e) => {
      const eventType = e?.detail?.type;
      if (eventType === "damaged" || eventType === "lost" || eventType === "condition-updated") {
        refreshCounters().catch(() => {});
        return;
      }
      if (eventType === "issued" || eventType === "returned") {
        debouncedRefresh({ initial: false }, 100);
      }
    };
    window.addEventListener("dashboard:changed", onChanged);
    return () => window.removeEventListener("dashboard:changed", onChanged);
  }, []);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "dirty:cards") {
        debouncedRefresh({ initial: false }, 120);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    let ch = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        ch = new BroadcastChannel("cards-channel");
        ch.onmessage = (msg) => {
          const data = msg?.data || {};
          if (data?.type === "dirty:cards") {
            debouncedRefresh({ initial: false }, 80);
          }
        };
      }
    } catch {}
    return () => { try { if (ch) ch.close(); } catch {} };
  }, []);

  useEffect(() => {
    const onBump = (e) => {
      const { field, delta = 1 } = e.detail || {};
      if (!field) return;
      setStats((prev) => ({
        ...prev,
        [field]: Math.max(0, (prev?.[field] ?? 0) + Number(delta || 0)),
      }));
    };
    window.addEventListener("dashboard:increment", onBump);
    return () => window.removeEventListener("dashboard:increment", onBump);
  }, []);

  // Reset harian 
  useEffect(() => {
    let lastDay = new Date().toDateString();
    const tick = () => {
      const nowDay = new Date().toDateString();
      if (nowDay !== lastDay) {
        lastDay = nowDay;
        setStats((p) => ({ ...p, masukHariIni: 0, keluarHariIni: 0 }));
        debouncedRefresh({ initial: false }, 50);
      }
    };
    const iv = setInterval(tick, 60 * 1000);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
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
          <div style={{ width: "100%", height: 2, background: "#C4C4C4", borderRadius: 2, margin: "0 auto" }} />
        </div>

        <nav className="flex flex-col gap-4 mt-2">
          {[
            { label: "Dashboard",                icon: "streamline-plump:user-pin-remix", path: "/admin/dashboard" },
            { label: "Verifikasi & Persetujuan", icon: "streamline-sharp:time-lapse-solid", path: "/admin/verifikasi" },
            { label: "Kartu Visitor",            icon: "solar:card-recive-outline", path: "/admin/kartu-visitor" },
            { label: "Riwayat Pengembalian",     icon: "solar:card-search-broken", path: "/admin/riwayat" },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleMenuClick(item.path)}
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
        <div className="flex gap-8 mb-10 flex-wrap">
          <div
            className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
            style={{ minHeight: 70 }}
          >
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">
              Dashboard
            </span>

            {/* Profile */}
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
                  {adminInitial}
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

        {err && (
          <div className="max-w-[900px] mx-auto w-full mb-6">
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
              {err}
            </div>
          </div>
        )}

        <div
          className="grid gap-x-8 gap-y-7 w-full"
          style={{
            gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          {cardConfig.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-[20px] px-5 py-5 flex flex-col justify-between shadow relative hover:shadow-lg transition-shadow cursor-pointer"
              style={{
                width: "100%",
                maxWidth: 440,
                height: 155,
                boxShadow: "0 2px 8px rgba(90,90,140,0.07)",
              }}
              onClick={() => {
                if (card.valueKey === "verifikasi") {
                  navigate("/admin/verifikasi");
                } else if (
                  card.valueKey === "aktif" ||
                  card.valueKey === "masukHariIni" ||
                  card.valueKey === "keluarHariIni"
                ) {
                  navigate("/admin/kartu-visitor");
                } else if (card.valueKey === "rusak" || card.valueKey === "hilang") {
                  navigate("/admin/riwayat");
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-poppins font-semibold text-[18px] text-[#474646]">
                  {card.title}
                </span>
                <span className="w-[52px] h-[52px] rounded-[15px] flex items-center justify-center bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD]">
                  <Icon icon={card.icon} width={28} height={28} color="#fff" />
                </span>
              </div>

              <div className="mt-3 font-poppins font-bold text-[28px] text-[#474646]">
                {loading && firstLoad ? (
                  <span className="animate-pulse inline-block w-16 h-7 rounded-md bg-gray-200" />
                ) : (
                  stats[card.valueKey] ?? 0
                )}
              </div>
            </div>
          ))}
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
          .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
