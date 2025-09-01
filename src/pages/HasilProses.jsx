import React, { useState } from 'react';
import './HasilProses.css';
import Hourglass from '../assets/Hourglass.svg';
import CallIcon from '../assets/call.svg';
import SilangIcon from '../assets/silang.svg';
import InformationBox from '../assets/informationbox.svg';
import DetailInfoIcon from '../assets/detailinfo.svg';

import PopupPembatalan from './Pembatalan.jsx';
import PopupSukses from './PopUpSukses.jsx';

const HasilCek = () => {
    const [showPopupPembatalan, setShowPopupPembatalan] = useState(false);
    const [showPopupSukses, setShowPopupSukses] = useState(false);

    const handleOpenPopupPembatalan = () => {
        setShowPopupPembatalan(true);
    };

    const handleClosePopupPembatalan = () => {
        setShowPopupPembatalan(false);
    };

    const handleConfirmPembatalan = () => {
        setShowPopupPembatalan(false);
        setShowPopupSukses(true);
    };

    const handleClosePopupSukses = () => {
        setShowPopupSukses(false);
    };

    return (
        <div className="page-wrapper-hasil">
            <div className="main-card-container">
                {/* Status Header Section */}
                <div className="status-header">
                    <img src={Hourglass} alt="Hourglass Icon" className="hourglass-icon" />
                    <div className="status-text">
                        <h3>Permohonan Sedang Diproses</h3>
                        <p>Permohonan anda sedang dalam tahap verifikasi</p>
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
                        <img src={DetailInfoIcon} alt="detail info icon" className="detail-info-icon" />
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
                    <img src={InformationBox} alt='information box' className="information-box-icon" />
                    <div className="note-content">
                        <h5 className="note-title">Informasi Status</h5>
                        <p className="note-text">
                            Permohonan Anda sedang dalam tahap verifikasi. Tim kami sedang meninjau dokumen yang diajukan untuk memastikan kelengkapan dan kesesuaian dengan persyaratan.
                        </p>
                    </div>
                </div>

                {/* Contact Button */}
                <div className="button-group-tolak">
                    <button className="re-apply-button-tolak">
                        <img src={CallIcon} alt="Ajukan Ulang" className="reapply-icon-tolak" />
                        Hubungi Keamanan
                    </button>
                    <button className="contact-button-tolak" onClick={handleOpenPopupPembatalan}>
                        <img src={SilangIcon} alt="Batalkan Pengajuan" className="phone-icon-tolak" />
                        Batalkan Pengajuan
                    </button>
                </div>
            </div>

            {showPopupPembatalan && (
                <PopupPembatalan
                    onClose={handleClosePopupPembatalan}
                    onConfirm={handleConfirmPembatalan}
                />
            )}

            {showPopupSukses && (
                <PopupSukses
                    onClose={handleClosePopupSukses}
                />
            )}
        </div>
    );
};

export default HasilCek;