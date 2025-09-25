import React, { useEffect, useState } from "react";
import { checkStatus } from '../api';
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/KAI-logo.png";
import train from "../assets/Train.png";
import { FaSearch } from "react-icons/fa";

export default function VisitorCardStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const submissionNumber = location.state?.submissionNumber || "";

  // Pre-fill input jika ada submissionNumber
  useEffect(() => {
    if (submissionNumber) {
      const el = document.getElementById("nomor");
      if (el) el.value = submissionNumber;
    }
  }, [submissionNumber]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckStatus = async () => {
    const nomor = document.getElementById("nomor")?.value?.trim();
    if (!nomor) return alert("Masukkan nomor pengajuan!");
    setLoading(true);
    setError("");
    try {
      const res = await checkStatus({ reference_number: nomor });

      // Normalisasi akses data/status
      const dataRoot = res?.data?.data ?? res?.data ?? {};
      const status = (dataRoot?.status || "").toLowerCase();

      if (status === "approved" || status === "disetujui") {
        navigate("/status/approved", { state: { nomor } });
      } else if (status === "rejected" || status === "ditolak") {
        navigate("/status/rejected", { state: { nomor } });
      } else {
        navigate("/status/processing", { state: { nomor } });
      }
    } catch (err) {
      setError("Nomor pengajuan tidak ditemukan atau server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 relative overflow-hidden font-poppins">
      {/* Background biru */}
      <div className="absolute top-0 left-0 w-full h-[340px] z-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 340"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6A8BB0" />
              <stop offset="1" stopColor="#5E5BAD" />
            </linearGradient>
          </defs>
          <path
            d="
              M0,0 
              L0,180 
              Q360,310 720,310 
              Q1080,310 1440,180 
              L1440,0 
              Z
            "
            fill="url(#blueGrad)"
          />
        </svg>
        <img src={logo} alt="KAI" className="absolute top-[22px] left-5 w-[100px] h-auto" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] z-20">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-5 w-full justify-center">
            <div className="bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD] text-white p-3 rounded-full shadow-md flex items-center justify-center">
              <FaSearch className="text-2xl" />
            </div>
            <h2 className="font-bold text-xl text-gray-800 m-0">Cek Status Kartu Visitor</h2>
          </div>

          <div className="flex flex-col items-center w-full">
            <label htmlFor="nomor" className="text-xs font-semibold text-[#2D2A70] mb-2 self-start text-left">
              NOMOR PENGAJUAN
            </label>
            <input
              type="text"
              id="nomor"
              placeholder="Masukkan nomor pengajuan anda"
              defaultValue={submissionNumber}
              className="w-full border border-gray-300 rounded-lg p-3 mb-5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            />
            <button
              className="bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD] text-white font-semibold py-3 px-6 rounded-lg w-full cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleCheckStatus}
              disabled={loading}
            >
              {loading ? 'Memeriksa...' : 'CEK STATUS'}
            </button>
            {error && <span className="text-red-500 mt-2">{error}</span>}
          </div>
        </div>
      </div>

      <img
        src={train}
        alt="Kereta"
        className="fixed bottom-[-90px] left-[35%] w-[clamp(600px,70vw,1200px)] h-auto opacity-30 z-[5] pointer-events-none md:bottom-[-90px] md:left-[35%] sm:w-[clamp(500px,95vw,800px)] sm:bottom-[5px] sm:opacity-25 sm:left-[15%]"
      />
    </div>
  );
}
