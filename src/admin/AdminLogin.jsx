import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import kaiLogo from "../assets/KAI-logo.png";
import trainImg from "../assets/login-train.png";

import { adminLogin, getAdminMe, setAuthToken } from "../api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");          
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const { data } = await adminLogin({ email: email.trim(), password });
      setAuthToken(data?.token); 
      try {
        const me = await getAdminMe();
        const adminName =
          me?.data?.full_name ||
          me?.data?.name ||
          data?.user?.full_name ||
          data?.user?.name ||
          "Admin";
        localStorage.setItem("adminName", adminName);
      } catch {
      }

      navigate("/admin/dashboard");
    } catch (error) {
      setErr(
        error?.response?.status === 401
          ? "Email atau Password salah!"
          : error?.response?.data?.message || "Gagal login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-screen h-screen flex">
        {/* Kiri */}
        <div className="relative w-1/2 h-full flex flex-col justify-start bg-gradient-custom rounded-r-[120px] overflow-hidden">
          <img src={kaiLogo} alt="KAI Logo" className="w-[110px] mt-11 ml-10 mb-1 z-20" />
          <div className="relative flex-1 flex flex-col justify-start z-20">
            <h1 className="absolute left-10 top-28 text-white leading-[1.08] font-montserrat font-bold text-[61px] z-100">
              Sistem<br />
              Pengajuan<br />
              Kartu Visitor<br />
              Stasiun<br />
              Yogyakarta
            </h1>
            <img
              src={trainImg}
              alt="Kereta"
              className="absolute left-0 bottom-0 w-full h-[65%] object-cover z-10 opacity-[0.32]"
            />
          </div>
        </div>

        {/* Kanan */}
        <div className="w-1/2 h-full flex items-center justify-center bg-white">
          <div className="w-[360px]">
            <div className="mb-7 text-center">
              <span className="text-[1.4rem] font-poppins font-semibold">Login</span>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleLogin}>
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  autoFocus
                  className="w-full h-[44px] pl-4 pr-10 bg-[#E6E6E6] text-[#6A6A6A] rounded-md font-poppins font-medium"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333]">
                  <FaUser size={22} />
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  className="w-full h-[44px] pl-4 pr-10 bg-[#E6E6E6] text-[#6A6A6A] rounded-md font-poppins font-medium password-field"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333] cursor-pointer"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                  </span>
                )}
              </div>

              {err && (
                <div className="text-red-600 text-sm text-center font-poppins font-medium">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[44px] bg-[#203D8C] rounded-md text-white text-[1rem] font-poppins font-bold mt-1 hover:bg-[#1a3278] transition-colors disabled:opacity-60"
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-custom {
          background: linear-gradient(90deg, rgba(106,139,176,0.85) 0%, rgba(94,91,173,0.80) 100%);
        }
        .password-field::-ms-reveal,
        .password-field::-ms-clear {
          display: none;
        }
        .password-field::-webkit-credentials-auto-fill-button {
          display: none !important;
          visibility: hidden;
          pointer-events: none;
          position: absolute;
          right: 0;
        }
      `}</style>
    </>
  );
}
