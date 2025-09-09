import { useState } from 'react';
import { FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

const Step4 = ({ formData, prevStep, nextStep }) => {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agreed) {
      // Logic to submit data (can be replaced with API call)
      const generatedNumber = 'VST-' + Math.floor(Math.random() * 900000 + 100000); // Generate a random 6-digit number
      // Pindahkan data submissionNumber ke formData sebelum lanjut
      nextStep({ ...formData, submissionNumber: generatedNumber });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
        <FaPaperPlane className="mr-2 text-blue-600" /> Konfirmasi Data
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Jenis Kunjungan */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Jenis Kunjungan</h3>
          <p className="text-sm text-gray-600">
            <strong>Tipe Visitor :</strong> {formData.jenisKunjungan}
          </p>
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-4">Detail Kunjungan</h3>
            <p className="text-sm text-gray-600">
              <strong>Tanggal :</strong> {formData.visitDate}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Stasiun Kunjungan :</strong> {formData.visitStation}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tujuan :</strong> {formData.visitPurpose}
            </p>
          </div>
        </div>

        {/* Data Pribadi */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Data Pribadi</h3>
          <p className="text-sm text-gray-600">
            <strong>Nama :</strong> {formData.fullName}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Nomor KTP :</strong> {formData.idNumber}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Instansi :</strong> {formData.company}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Nomor Hp :</strong> {formData.phoneNumber}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email :</strong> {formData.email}
          </p>
        </div>

        {/* Dokumen Upload */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Dokumen Upload</h3>
          <p className="text-sm text-gray-600">
            <strong>Surat Tugas :</strong>{' '}
            {formData.document ? <span className="text-green-600 font-medium">Sudah diupload</span> : '-'}
          </p>
        </div>
      </div>

      <div className="flex items-center mt-6">
        <input
          type="checkbox"
          id="agreement"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="agreement" className="text-sm text-gray-700">
          Saya menyetujui <a href="#" className="text-blue-600 hover:underline">syarat dan ketentuan</a> serta <a href="#" className="text-blue-600 hover:underline">kebijakan privasi data</a>
        </label>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
        >
          Kembali
        </button>
        <button
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-md text-white transition-colors ${
            agreed ? 'bg-customBlue hover:bg-customBlue-hover' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!agreed}
        >
          Kirim
        </button>
      </div>
    </div>
  );
};

export default Step4;