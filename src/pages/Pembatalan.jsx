import React, { useState } from 'react';
import { cancelApplication } from '../api';
import './Pembatalan.css';
import WarningIcon from '../assets/warning.svg';

const PopupPembatalan = ({ onClose, onConfirm, nomor, reference, applicationId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      await cancelApplication({
        reference_number: nomor || reference,
        reference: reference || nomor,
        id: applicationId || nomor || reference,
      });
      onConfirm?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Gagal membatalkan permohonan. Silakan coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay (Tailwind: fixed, inset-0, bg-gray-800/60, flex, justify-center, items-center, z-50)
    <div className="fixed inset-0 bg-gray-800/60 flex justify-center items-center z-50 animate-fade-in">
      
      {/* Modal (Tailwind: bg-white, rounded-xl, max-w-lg, shadow-2xl) */}
      <div className="bg-white rounded-xl w-11/12 max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Warning Icon Large */}
            <div className="w-10 h-10 rounded-full bg-amber-100 flex justify-center items-center">
              {/* Filter style untuk membuat ikon tampak oranye */}
              <img src={WarningIcon} alt="Warning Icon" className="w-6 h-6" style={{ filter: 'invert(39%) sepia(87%) saturate(5411%) hue-rotate(36deg) brightness(98%) contrast(99%)' }} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Batalkan Permohonan?</h2>
          </div>
          
          {/* Close Button */}
          <button 
            className="text-gray-400 hover:text-gray-700 text-3xl leading-none font-light p-1" 
            onClick={onClose}>
              &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-gray-600 max-h-96 overflow-y-auto"> 
          <p className="text-sm mb-4 text-gray-500">
            Konfirmasi pembatalan permohonan Anda. **Periksa detail di bawah sebelum melanjutkan.**
          </p>
          
          {/* Application Details Block */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-5 divide-y divide-gray-200">
            {/* Detail Utama */}
            <h3 className="text-lg font-bold text-gray-800 pb-2 mb-2 border-b border-gray-200">Detail Permohonan</h3>
            {referenceToDisplay && <DetailItem label="Nomor Pengajuan" value={referenceToDisplay} isReference={true} />}
            
            {/* Detail Penanggung Jawab */}
            <h3 className="text-base font-semibold text-gray-700 pt-3 pb-1 mt-2">Data Penanggung Jawab</h3>
            {picName && <DetailItem label="Nama Penanggung Jawab (PIC)" value={picName} />}
            {picJabatan && <DetailItem label="Jabatan Penanggung Jawab" value={picJabatan} />}
            
            {/* Detail Layanan & Akses */}
            <h3 className="text-base font-semibold text-gray-700 pt-3 pb-1 mt-2">Layanan & Akses</h3>
            {layananPendampingan && <DetailItem label="Layanan Pendampingan" value={layananPendampingan} />}
            {pintuDiajukan && <DetailItem label="Akses Pintu yang Diajukan" value={pintuDiajukan} />}
            {jumlahJenisKendaraan && <DetailItem label="Jumlah & Jenis Kendaraan" value={jumlahJenisKendaraan} />}
            {nopolKendaraan && <DetailItem label="Nopol Kendaraan" value={nopolKendaraan} />}
            {waktuAkses && <DetailItem label="Waktu Akses" value={waktuAkses} />}
            {tujuanAkses && <DetailItem label="Tujuan Akses" value={tujuanAkses} />}
            
            {/* Detail Protokoler */}
            <h3 className="text-base font-semibold text-gray-700 pt-3 pb-1 mt-2">Pendampingan Protokoler</h3>
            {pendampinganProtokoler && <DetailItem label="Pendampingan Protokoler" value={pendampinganProtokoler} />}
            {jumlahPendampinganProtokoler && <DetailItem label="Jumlah Pendampingan Protokoler" value={jumlahPendampinganProtokoler} />}
          </div>
          
          {/* Warning Box (Tailwind: border-l-4, border-red-500, bg-red-50, p-4, rounded-r-md) */}
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-md">
            <h4 className="text-red-600 font-semibold text-base flex items-center mb-2">
                <img src={WarningIcon} alt="Warning Icon" className="w-5 h-5 mr-2" style={{ filter: 'invert(39%) sepia(87%) saturate(5411%) hue-rotate(36deg) brightness(98%) contrast(99%)' }} /> 
                Perhatian! Konsekuensi Pembatalan
            </h4>
            <ul className="list-disc ml-5 text-sm space-y-1 text-red-700">
              <li>Semua dokumen dan data yang telah disubmit akan **dihapus permanen**.</li>
              <li>Anda perlu **mengisi formulir dan mengunggah dokumen dari awal** jika ingin mengajukan lagi.</li>
              <li>Tindakan ini **tidak dapat dibatalkan** setelah dikonfirmasi.</li>
            </ul>
          </div>
        </div>

        {/* Footer: Buttons and Error Message */}
        <div className="flex justify-end items-center p-5 border-t border-gray-100 space-x-3">
          {/* Error Message */}
          {error && <div className="text-sm font-medium text-red-600 mr-auto">{error}</div>} 
          
          {/* Secondary Button: Kembali (Tailwind: bg-gray-100, hover:bg-gray-200) */}
          <button 
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed" 
            onClick={onClose} 
            disabled={loading}
          >
            Kembali
          </button>
          
          {/* Primary Button: Batalkan Permohonan (Tailwind: bg-red-600, hover:bg-red-700) */}
          <button 
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed" 
            onClick={handleCancel} 
            disabled={loading}
          >
            {loading ? "Memproses..." : "Ya, Batalkan Permohonan Ini"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponen Pembantu untuk Detail Item
const DetailItem = ({ label, value, isReference = false }) => (
    <div className="flex justify-between text-sm py-1">
        <span className="font-medium text-gray-500">{label}:</span>
        <span className={`font-semibold text-right ${isReference ? 'text-red-600' : 'text-gray-800'}`}>{value || '-'}</span>
    </div>
);

export default PopupPembatalan;