import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AttentionPage = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  const handleNext = () => {
    if (checked) {
      navigate('/apply/form');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-blue-100 font-sans flex items-center justify-center overflow-auto">
      <div
        className="rounded-lg shadow-md border border-gray-300 max-w-2xl w-full flex flex-col items-center bg-white"
        style={{
          minHeight: '70vh',
          marginTop: '60px',
          marginBottom: '60px',
        }}
      >
        <div className="w-full px-8 py-6">
          <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">
            Silakan dibaca sebelum mengisi formulir:
          </h1>
          <div className="space-y-6 text-gray-800 text-base">
            <div>
              <h2 className="font-semibold mb-2 text-blue-700">
                A. Layanan yang Dapat Diajukan
              </h2>
              <ul className="list-disc ml-6">
                <li>Pendampingan Protokoler.</li>
                <li>Akses kendaraan melalui Pintu Timur atau Pintu Selatan.</li>
                <li>Penggunaan Ruang VIP.</li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-2 text-blue-700">
                B. Persyaratan Umum
              </h2>
              <ul className="list-disc ml-6">
                <li>
                  Surat permohonan resmi dikirim minimal H-3 sebelum kedatangan.
                </li>
                <li>Formulir ini wajib diisi lengkap &amp; benar.</li>
                <li>
                  Petugas stasiun akan memverifikasi data dan mengirim notifikasi ACC / penolakan via WhatsApp.
                </li>
                <li>
                  Setelah ACC, pemohon membawa surat permohonan asli + bukti ACC saat registrasi di Boarding Timur.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-2 text-blue-700">
                C. Ketentuan Kendaraan
              </h2>
              <ul className="list-disc ml-6">
                <li>Maksimum 2 mobil per permohonan.</li>
                <li>
                  2 mobil atau bus ⇒ wajib surat terpisah kepada Kepala Daop 6 Yogyakarta sebelum mengisi formulir ini.
                </li>
                <li>
                  Kendaraan boleh menurunkan/menaikkan tamu di zona drop-off namun dilarang parkir di sana—gunakan area parkir resmi.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-2 text-blue-700">
                D. Batasan Pendampingan
              </h2>
              <ul className="list-disc ml-6">
                <li>
                  Zona 1 &amp; di atas kereta: hanya Kepala Stasiun/Wakil/Kasubur atau Protokoler berizin.
                </li>
                <li>Pendamping lain hanya sampai Zona 2.</li>
              </ul>
            </div>
            <div className="mt-8 flex items-start gap-3">
              <input
                type="checkbox"
                id="agreement"
                checked={checked}
                onChange={() => setChecked(!checked)}
                className="w-5 h-5 accent-blue-600 mt-1"
              />
              <label htmlFor="agreement" className="text-blue-900 font-medium text-base select-none leading-relaxed">
                Saya telah membaca dan memahami seluruh ketentuan di atas,<br />
                serta bersedia mematuhi SOP Pelayanan Tamu Protokoler Stasiun Yogyakarta.
              </label>
            </div>
            <div className="w-full flex justify-between mt-8 mb-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!checked}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  checked
                    ? 'bg-customBlue hover:bg-customBlue-hover'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttentionPage;