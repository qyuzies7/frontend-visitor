import React from 'react';
import './HasilTolak.css';
import { FaTimesCircle, FaUser, FaPhoneAlt, FaRedo } from 'react-icons/fa';
import CrossIcon from '../assets/CrossIcon.svg'
import CrossBox from '../assets/crossbox.svg'
import DetailInfo from '../assets/detailinfo.svg'


export default function HasilTolak() {
  return (
    <div className="page-wrapper-tolak">
      <div className="main-card-container-tolak">
        <div className="status-header-tolak">
          <img src={CrossIcon} alt="Cross Icon" className="cross-icon-tolak" />
          <div className="status-text-tolak">
            <h3>Permohonan Ditolak</h3>
            <p>Permohonan anda tidak dapat diproses lebih lanjut</p>
            <p className="last-updated-tolak">Terakhir diperbarui : 8/7/2025, 09:26</p>
          </div>
        </div>

        <div className="info-grid-tolak">
          <div className="info-item-tolak">
            <span className="info-label-tolak">NOMOR REFERENSI</span>
            <span className="info-value-tolak">VST-2025-123456</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">NAMA PEMOHON</span>
            <span className="info-value-tolak">AZIDA KAUTSAR</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">TUJUAN KUNJUNGAN</span>
            <span className="info-value-tolak">KUNJUNGAN BISNIS</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">STASIUN KUNJUNGAN</span>
            <span className="info-value-tolak">STASIUN LEMPUYANGAN</span>
          </div>
        </div>

        <div className="detail-section-tolak">
          <div className="detail-header-tolak">
            <img src={DetailInfo} alt='Detail Info' className='detail-info-icon' />
            <h4>Detail Permohonan</h4>
          </div>
          <hr className="divider-tolak" />
          <div className="date-status-grid-tolak">
            <div className="date-item-tolak">
              <span className="date-label-tolak">Tanggal Mulai Berlaku</span>
              <span className="date-value-tolak">09 Agustus 2025</span>
            </div>
            <div className="date-item-tolak">
              <span className="date-label-tolak">Tanggal Berakhir</span>
              <span className="date-value-tolak">12 Agustus 2025</span>
            </div>
            <div className="status-item-tolak">
              <span className="status-label-tolak">Status Saat Ini</span>
              <span className="status-value-tolak">Permohonan Ditolak</span>
            </div>
          </div>
        </div>

        <div className="rejection-note-box-tolak">
         <img src={CrossBox} alt="Cross Box" className="note-cross-icon-tolak" />
          <div className="note-content-tolak">
            <h5>Alasan Penolakan</h5>
            <p>
              Dokumen yang diunggah tidak sesuai dengan persyaratan. Mohon untuk mengajukan permohonan baru dengan dokumen yang lengkap dan valid.
            </p>
          </div>
        </div>

        <div className="button-group-tolak">
          <button className="re-apply-button-tolak">
            <FaRedo className="reapply-icon-tolak" />
            Ajukan Ulang
          </button>
          <button className="contact-button-tolak">
            <FaPhoneAlt className="phone-icon-tolak" />
            Hubungi Keamanan
          </button>
        </div>
      </div>
    </div>
  );
}