import { FaCheckCircle } from 'react-icons/fa';

const Step5 = ({ submissionNumber }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 w-full px-4 text-center overflow-x-hidden md:overflow-x-auto">
      <div className="flex justify-center mb-6">
        <FaCheckCircle className="text-green-500 text-6xl" />
      </div>
      <h2 className="text-2xl font-bold text-blue-800 mb-2">Pengajuan Berhasil Dikirim!</h2>
      <p className="text-gray-600 mb-6">
        Pengajuan kunjungan anda telah berhasil dikirim dan sedang dalam proses verifikasi.
      </p>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6 w-full max-w-xs mx-auto">
        <p className="text-xs text-gray-500 font-semibold mb-1">Nomor Pengajuan</p>
        <h3 className="text-xl font-bold text-blue-600 truncate">{submissionNumber}</h3>
      </div>

      <div className="text-left mb-6">
        <h4 className="font-semibold text-sm mb-2">Informasi Penting :</h4>
        <ul className="list-disc list-inside text-gray-700 text-sm pl-4">
          <li>Notifikasi akan dikirim melalui Email/WhatsApp</li>
          <li>Simpan nomor pengajuan untuk tracking status</li>
          <li>Hubungi (0274) xxxxxx jika ada pertanyaan</li>
        </ul>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => alert('Fungsi cek status akan datang!')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          Cek Status Pengajuan
        </button>
      </div>
    </div>
  );
};

export default Step5;