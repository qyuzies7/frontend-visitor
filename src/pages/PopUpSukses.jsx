import React from 'react';
import './PopUpSukses.css';
import SuccessIcon from '../assets/CheckIcon.svg'; 

const PopupSukses = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-modal popup-modal-success">
        <div className="popup-header popup-header-success">
          <div className="success-icon">
             <img src={SuccessIcon} alt="Success Icon" />
          </div>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="popup-body">
          <h2>Pembatalan Berhasil!</h2>
          <p>Permohonan Anda berhasil dibatalkan</p>
          <div className="success-box">
            <h4>Proses Selesai!</h4>
            <p>
              Semua dokumen dan data permohonan telah dihapus dari sistem.
              Anda dapat mengajukan permohonan baru kapan saja
              melalui halaman utama.
            </p>
          </div>
        </div>
        <div className="popup-footer">
          <button className="btn-success" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupSukses;