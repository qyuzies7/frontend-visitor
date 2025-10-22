import { Link } from 'react-router-dom';
import { FaEdit, FaCheckCircle } from 'react-icons/fa';
import Button from '../components/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      <div className="tugu-stasiun-background"></div>
      <div className="absolute inset-0 bg-blue-100/30 z-0"></div>
      <div className="w-full flex justify-between items-start px-6 pt-2 relative z-20">
        <img
          src="/danantara_indonesia.png"
          alt="Danantara Logo"
          className="w-32 h-auto mt-4 md:mt-4 lg:mt-4"
          style={{ pointerEvents: 'none' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/120x40'; }}
        />
        <img 
          src="/logo-kai.png" 
          alt="KAI Logo" 
          className="w-20 h-auto -mt-2 md:w-24 md:-mt-2 lg:w-24"
          style={{ pointerEvents: 'none' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
        />
      </div>
      
      <div className="px-4 pb-4 relative z-10">
        <div className="mt-1 md:mt-2 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-black bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD] rounded-[40px] p-2 md:p-4 px-6 md:px-8 inline-block shadow-md">
            Pengajuan Kartu Visitor
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-4 mb-4 md:mt-6 md:mb-6">
            Silahkan pilih layanan yang Anda butuhkan.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-10 max-w-4xl mx-auto">
          {/* Kartu Ajukan Permohonan */}
          <div className="bg-white rounded-2xl border-orange-500 p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 ease-in-out w-full md:w-96 z-10" style={{ borderWidth: '3px' }}>
            <div className="bg-orange-100 rounded-full p-3 mb-4">
              <FaEdit className="text-orange-500 text-3xl" />
            </div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Ajukan Permohonan</h2>
            <p className="text-sm text-gray-600 mb-4">
              Daftarkan kartu visitor untuk mengakses area stasiun dengan proses yang mudah.
            </p>
            <Link to="/apply/attention">
              <Button className="bg-orange-500 text-white hover:bg-orange-600">
                DAFTAR SEKARANG
              </Button>
            </Link>
          </div>

          {/* Kartu Cek Status Pengajuan */}
          <div className="bg-white rounded-2xl border-blue-600 p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 ease-in-out w-full md:w-96 z-10" style={{ borderWidth: '3px' }}>
            <div className="bg-blue-100 rounded-full p-3 mb-4">
              <FaCheckCircle className="text-blue-500 text-3xl" />
            </div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Cek Status Pengajuan</h2>
            <p className="text-sm text-gray-600 mb-4">
              Cek status permohonan dan terima kartu visitor yang telah disetujui oleh petugas.
            </p>
            <Link to="/status">
              <Button className="bg-blue-400 text-white hover:bg-blue-500">
                CEK PENGAJUAN
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;