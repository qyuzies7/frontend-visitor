import React from 'react';
import './HasilCek.css'; 
import CheckIcon from '../assets/CheckIcon.svg'
import CheckBox from '../assets/checkbox.svg'
import DetailInfo from '../assets/detailinfo.svg'

const HasilCek = () => {
  return (
    <div className="page-wrapper-hasil">
      <div className="main-card-container">
        {/* Status Header Section */}
        <div className="status-header">
          <img src={CheckIcon} alt="Check Icon" className="check-icon" />
          <div className="status-text">
            <h3>Permohonan Disetujui</h3>
            <p>Kartu visitor Anda telah disetujui dan siap diambil</p>
            <p className="last-updated">Terakhir diperbarui: 8/7/2025, 09:26</p>
          </div>
        </div>

        {/* Info Grid Section */}
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">NOMOR REFERENSI</span>
            <span className="info-value">VST-2025-123456</span>
          </div>
          <div className="info-item">
            <span className="info-label">NAMA PEMOHON</span>
            <span className="info-value">AZIDA KAUTSAR</span>
          </div>
          <div className="info-item">
            <span className="info-label">TUJUAN KUNJUNGAN</span>
            <span className="info-value">KUNJUNGAN BISNIS</span>
          </div>
          <div className="info-item">
            <span className="info-label">STASIUN KUNJUNGAN</span>
            <span className="info-value">STASIUN LEMPUYANGAN</span>
          </div>
        </div>

        {/* Detail Section */}
        <div className="detail-section">
          <div className="detail-header">
           <img src={DetailInfo} alt="Detail Info" className="detail-info-icon" />
            <h4>Detail Permohonan</h4>
          </div>
          <hr className="divider" />
          <div className="date-status-grid">
            <div className="date-item">
              <span className="date-label">Tanggal Mulai Berlaku</span>
              <span className="date-value">09 Agustus 2025</span>
            </div>
            <div className="date-item">
              <span className="date-label">Tanggal Berakhir</span>
              <span className="date-value">12 Agustus 2025</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status Saat Ini</span>
              <span className="status-value-disetujui">Disetujui</span>
            </div>
          </div>
        </div>

        {/* Approval Note Section */}
        <div className="approval-note-box">
          <img src ={CheckBox} alt="Check Icon" className="note-check-icon" />
          <div className="note-content">
            <h5 className="note-title">Catatan Persetujuan</h5>
            <p className="note-text">
              Semua dokumen telah diverifikasi dan memenuhi persyaratan. Silahkan ambil kartu visitor pada petugas keamanan dengan membawa kartu identitas asli.
            </p>
          </div>
        </div>

        {/* Contact Button */}
        <button className="contact-button">
          <svg className="phone-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>Hubungi Keamanan</span>
        </button>
      </div>
    </div>
  );
};

export default HasilCek;