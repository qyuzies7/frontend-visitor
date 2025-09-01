import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./CekStatus.css";
import logo from "../assets/KAI-logo.png";
import train from "../assets/Train.png";
import { FaSearch } from "react-icons/fa";

export default function VisitorCardStatus() {
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const handleCheckStatus = () => {
    // Aksi yang ingin Anda lakukan sebelum navigasi, misalnya validasi
    // ...

    // Navigasi ke halaman HasilProses
    navigate("/HasilProses"); // Ganti dengan path yang sesuai
  };

  return (
    <div className="page-wrapper">
      <div className="header-shape">
        <img src={logo} alt="KAI" className="logo" />
      </div>

      <div className="card-container">
        <div className="card">
          <div className="card-header">
            <div className="search-icon-wrapper">
              <FaSearch className="search-icon" />
            </div>
            <h2>Cek Status Kartu Visitor</h2>
          </div>

          <div className="form">
            <label htmlFor="nomor">NOMOR PENGAJUAN</label>
            <input
              type="text"
              id="nomor"
              placeholder="Masukkan nomor pengajuan anda"
            />
            {/* Tambahkan onClick handler ke tombol */}
            <button className="submit-btn" onClick={handleCheckStatus}>
              CEK STATUS
            </button>
          </div>
        </div>
      </div>

      <img src={train} alt="Kereta" className="train-image" />
    </div>
  );
}