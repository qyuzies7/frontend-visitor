import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const Step5 = ({ submissionNumber }) => {
  const navigate = useNavigate();

  const handleCheckStatus = () => {
    navigate('/status', { 
      state: { 
        submissionNumber: submissionNumber,
        fromSubmission: true 
      } 
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 w-full px-4 text-center overflow-x-hidden md:overflow-x-auto">
      <div className="flex justify-center mb-6">
        <FaCheckCircle className="text-green-500 text-6xl" />
      </div>
      
      <h2 className="text-2xl font-bold text-blue-800 mb-2">Pengajuan Berhasil Dikirim!</h2>
      <p className="text-gray-600 mb-6">
        Pengajuan kartu visitor Anda telah berhasil dikirim dan sedang dalam proses verifikasi oleh tim kami.
      </p>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6 w-full max-w-xs mx-auto">
        <p className="text-xs text-gray-500 font-semibold mb-1">Nomor Pengajuan</p>
        <h3 className="text-xl font-bold text-blue-600 truncate">{submissionNumber}</h3>
      </div>

      <div className="text-left mb-6 max-w-md mx-auto">
        <h4 className="font-semibold text-sm mb-3 text-center">Informasi Penting:</h4>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-2">
          <li>Simpan nomor pengajuan untuk melacak status permohonan</li>
          <li>Cek status secara berkala untuk melihat status permohonan</li>
          <li>Hubungi (0274) 563-456 jika ada pertanyaan mendesak</li>
        </ul>
      </div>

      {/* Status Check Process Info */}
      <div className="bg-gray-50 p-4 rounded-md mb-6 max-w-md mx-auto">
        <h5 className="font-semibold text-sm mb-2">Proses Selanjutnya:</h5>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Verifikasi dokumen dan data</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
            <span>Persetujuan/penolakan oleh petugas</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
            <span>Notifikasi hasil ke Anda</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleCheckStatus}
          className="px-6 py-3 bg-customBlue text-white rounded-md hover:bg-customBlue-hover transition-colors"
        >
          Cek Status Pengajuan
        </button>
        <button
          onClick={handleBackToHome}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default Step5;