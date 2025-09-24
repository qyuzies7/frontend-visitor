import { useState } from 'react';
import { submitVisitorCard } from '../api';
import { FaPaperPlane } from 'react-icons/fa';

const Step4 = ({ formData, prevStep, nextStep }) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    
    // Generate submission number and timestamp
    const generatedNumber = 'VST-' + Math.floor(Math.random() * 900000 + 100000);
    const now = new Date().toISOString();
    
    setLoading(true);
    setError("");

    try {
      // Map field dari formData -> payload backend
      const mapFields = {
        // ID numerik visit type (sudah dibetulkan di Step1)
        jenisKunjungan: 'visit_type_id',

        // Tanggal
        visitDate: 'visit_start_date',
        visitEndDate: 'visit_end_date',

        // Stasiun (pakai ID numerik, sudah diset di Step2)
        visitStation: 'station_id',

        // Lain-lain
        visitPurpose: 'visit_purpose',
        fullName: 'full_name',
        idNumber: 'identity_number',
        company: 'institution',
        phoneNumber: 'phone_number',
        email: 'email',
        document: 'document',
      };

      const payload = {};
      Object.entries(formData).forEach(([k, v]) => {
        if (mapFields[k] !== undefined) payload[mapFields[k]] = v;
      });

      // Wajib: kirim rejection_reason sebagai string kosong (bukan null)
      payload.rejection_reason = '';

      // (Opsional) mapping kode stasiun -> id angka, kalau value masih string code
      const stationCodeToId = { YK: 1, LPN: 2 /* ... */ };
      if (payload.station_id && typeof payload.station_id === 'string') {
        payload.station_id = stationCodeToId[payload.station_id] || payload.station_id;
      }

      let response;
      if (payload.document instanceof File) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          fd.append(k, v ?? ''); // pastikan string, tidak null
        });
        response = await submitVisitorCard(fd);
      } else {
        // JSON body – pastikan tidak ada null di rejection_reason
        response = await submitVisitorCard(payload);
      }

      const nomor =
        response?.data?.reference_number ||
        response?.data?.nomor_pengajuan ||
        response?.data?.id ||
        generatedNumber; // fallback ke generated number jika response tidak ada

      // Kirim data dengan submission number dan timestamp ke nextStep
      nextStep({ 
        ...formData, 
        submissionNumber: nomor, 
        updatedAt: now 
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        "Gagal mengirim pengajuan. Silakan coba lagi.";
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
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
            <strong>Tipe Visitor :</strong> {formData.jenisKunjunganLabel || formData.jenisKunjungan}
          </p>

          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-4">Detail Kunjungan</h3>
            <p className="text-sm text-gray-600"><strong>Tanggal Mulai :</strong> {formData.visitDate}</p>
            <p className="text-sm text-gray-600"><strong>Tanggal Selesai :</strong> {formData.visitEndDate || formData.endDate}</p>
            <p className="text-sm text-gray-600"><strong>Stasiun Kunjungan :</strong> {formData.visitStation}</p>
            <p className="text-sm text-gray-600"><strong>Tujuan :</strong> {formData.visitPurpose}</p>
          </div>
        </div>

        {/* Data Pribadi */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Data Pribadi</h3>
          <p className="text-sm text-gray-600"><strong>Nama :</strong> {formData.fullName}</p>
          <p className="text-sm text-gray-600"><strong>Nomor KTP :</strong> {formData.idNumber}</p>
          <p className="text-sm text-gray-600"><strong>Instansi :</strong> {formData.company}</p>
          <p className="text-sm text-gray-600"><strong>Nomor Hp :</strong> {formData.phoneNumber}</p>
          <p className="text-sm text-gray-600"><strong>Email :</strong> {formData.email}</p>
        </div>

        {/* Dokumen Upload */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Dokumen Upload</h3>
          <p className="text-sm text-gray-600">
            <strong>Surat Tugas :</strong> {formData.document ? <span className="text-green-600 font-medium">Sudah diupload</span> : '-'}
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
        <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors">
          Kembali
        </button>
        <button
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-md text-white transition-colors ${agreed ? 'bg-customBlue hover:bg-customBlue-hover' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!agreed || loading}
        >
          {loading ? 'Mengirim...' : 'Kirim'}
        </button>
        {error && <span className="text-red-500 ml-4">{error}</span>}
      </div>
    </div>
  );
};

export default Step4;