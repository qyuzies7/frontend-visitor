import React from 'react';
import './Pembatalan.css';
import WarningIcon from '../assets/warning.svg';

const PopupPembatalan = ({ onClose, onConfirm }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-modal">
                <div className="popup-header">
                    <div className="warning-icon">
                        <img src={WarningIcon} alt="Warning Icon" /> 
                    </div>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="popup-body">
                    <h2>Batalkan Permohonan?</h2>
                    <p>Konfirmasi pembatalan permohonan Anda</p>
                    <div className="warning-box">
                        <h4>Perhatian!</h4>
                        <p>
                            Dengan membatalkan permohonan ini, semua dokumen dan data yang telah
                            disubmit akan dihapus dari sistem.
                        </p>
                        <p>
                            Jika Anda ingin mengajukan permohonan yang sama di kemudian hari, Anda
                            perlu mengisi formulir dan mengunggah dokumen dari awal.
                        </p>
                    </div>
                </div>
                <div className="popup-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Kembali
                    </button>
                    <button className="btn-primary" onClick={onConfirm}> 
                        Batalkan Permohonan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupPembatalan;