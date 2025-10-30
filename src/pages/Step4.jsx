import { useState } from 'react';
import { submitVisitorCard } from '../api';
import { FaPaperPlane } from 'react-icons/fa';

const ASSISTANCE_LABELS = {
  akses_pintu: 'Hanya akses pintu timur/selatan',
  vip: 'Hanya penggunaan ruang VIP',
  protokol: 'Hanya pendampingan protokoler',
  protokoler: 'Hanya pendampingan protokoler',
  'akses_pintu_protokol': 'Akses pintu + pendampingan protokoler',
  'akses-pintu-protokol': 'Akses pintu + pendampingan protokoler',
  'pintu_plus_protokoler': 'Akses pintu + pendampingan protokoler',
  vip_protokol: 'Ruang VIP + pendampingan protokoler',
  'vip-protokol': 'Ruang VIP + pendampingan protokoler',
  akses_pintu_vip_protokol: 'Akses pintu + ruang VIP + pendampingan protokoler',
  'akses-pintu-vip-protokol': 'Akses pintu + ruang VIP + pendampingan protokoler',
  vip_plus_pendampingan_protokoler: 'Ruang VIP + pendampingan protokoler',
  akses_pintu_plus_pendampingan_protokoler: 'Akses pintu + pendampingan protokoler',
};

function prettyAssistanceLabel(raw) {
  if (!raw) return '';
  const v = String(raw).trim();
  if (ASSISTANCE_LABELS[v]) return ASSISTANCE_LABELS[v];

  let s = v.replace(/[_-]+/g, ' ').trim();
  s = s.replace(/\bplus\b/gi, '+');    
  s = s.replace(/\s*\+\s*/g, ' + ');   
  s = s
    .replace(/\bvip\b/gi, 'VIP')
    .replace(/\bprotokol(er)?\b/gi, 'pendampingan protokoler')
    .replace(/\bakses pintu\b/gi, 'Akses pintu')
    .replace(/\bruang vip\b/gi, 'Ruang VIP');
  s = s.replace(/^\s*\w/, (c) => c.toUpperCase());
  return s.replace(/\s{2,}/g, ' ').trim();
}

const Step4 = ({ formData, prevStep, nextStep }) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;

    const generatedNumber = 'VST-' + Math.floor(Math.random() * 900000 + 100000);
    const now = new Date().toISOString();

    setLoading(true);
    setError('');

    try {
      const needEscort =
        typeof formData.needProtokolerEscort === 'string'
          ? formData.needProtokolerEscort.toLowerCase() === 'true'
          : !!formData.needProtokolerEscort;

      const mapFields = {
        jenisKunjungan: 'visit_type_id',
        visitDate: 'visit_start_date',
        visitEndDate: 'visit_end_date',
        visitStation: 'station_id',
        visitPurpose: 'visit_purpose',
        fullName: 'full_name',
        company: 'institution',
        phoneNumber: 'phone_number',
        email: 'email',
        document: 'document',

        // PIC
        picName: 'pic_name',
        picPosition: 'pic_position',

        // Akses & layanan
        accessDoor: 'access_door',
        accessTime: 'access_time',
        accessPurpose: 'access_purpose',
        protokolerCount: 'protokoler_count',
        vehicleType: 'vehicle_type',
        vehiclePlate: 'vehicle_plate',
        serviceType: 'assistance_service', 
      };

      const payload = {};
      Object.entries(formData).forEach(([k, v]) => {
        if (mapFields[k] !== undefined) payload[mapFields[k]] = v;
      });

      // pastikan tipe yang dikirim sesuai: gunakan boolean lokal but convert saat mengirim
      payload.need_protokoler_escort = needEscort;        
      payload.rejection_reason = '';

      if (!needEscort) payload.protokoler_count = null;

      const stationCodeToId = { YK: 1, LPN: 2  };
      if (payload.station_id && typeof payload.station_id === 'string') {
        payload.station_id = stationCodeToId[payload.station_id] || payload.station_id;
      }

      let response;
      // Jika ada file maka gunakan FormData — pastikan nilai boolean dikonversi ke '1'/'0'
      if (payload.document instanceof File) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          // kirim boolean sebagai '1' atau '0' supaya Laravel boolean rule selalu cocok
          if (k === 'need_protokoler_escort') {
            fd.append(k, v ? '1' : '0');
            return;
          }
          // file harus di-append sebagai file
          if (v instanceof File) {
            fd.append(k, v);
            return;
          }
          // jika null/undefined -> kosongkan string
          fd.append(k, v ?? '');
        });
        response = await submitVisitorCard(fd);
      } else {
        // untuk JSON kirim numeric 1/0 (atau boolean) — 1/0 lebih konsisten
        if (typeof payload.need_protokoler_escort !== 'undefined') {
          payload.need_protokoler_escort = payload.need_protokoler_escort ? 1 : 0;
        }
        response = await submitVisitorCard(payload);
      }

      const nomor =
        response?.data?.reference_number ||
        response?.data?.nomor_pengajuan ||
        response?.data?.id ||
        generatedNumber;

      nextStep({
        ...formData,
        submissionNumber: nomor,
        updatedAt: now,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        'Gagal mengirim pengajuan. Silakan coba lagi.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const showAksesPintu =
    formData.accessDoor ||
    formData.accessTime ||
    formData.accessPurpose ||
    formData.protokolerCount ||
    formData.vehicleType ||
    formData.vehiclePlate ||
    typeof formData.needProtokolerEscort !== 'undefined';

  const serviceTypeText =
    formData.serviceTypeLabel || prettyAssistanceLabel(formData.serviceType);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
        <FaPaperPlane className="mr-2 text-blue-600" /> Konfirmasi Data
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Jenis Kunjungan</h3>
          <p className="text-sm text-gray-600">
            <strong>Tipe Visitor :</strong>{' '}
            {formData.jenisKunjunganLabel || formData.jenisKunjungan}
          </p>

          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-4">Detail Kunjungan</h3>
            <p className="text-sm text-gray-600">
              <strong>Tanggal Mulai :</strong> {formData.visitDate}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tanggal Selesai :</strong> {formData.visitEndDate || formData.endDate}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Stasiun Kunjungan :</strong> {formData.visitStation}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tujuan :</strong> {formData.visitPurpose}
            </p>
            {formData.serviceType && (
              <p className="text-sm text-gray-600">
                <strong>Layanan Pendampingan :</strong> {serviceTypeText}
              </p>
            )}
          </div>
        </div>

        {/* Data Pribadi */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Data Pribadi</h3>
          <p className="text-sm text-gray-600">
            <strong>Nama :</strong> {formData.fullName}
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
          {formData.picName && (
            <p className="text-sm text-gray-600">
              <strong>Nama Penanggung Jawab (PIC) :</strong> {formData.picName}
            </p>
          )}
          {formData.picPosition && (
            <p className="text-sm text-gray-600">
              <strong>Jabatan Penanggung Jawab :</strong> {formData.picPosition}
            </p>
          )}
        </div>

        {/* Dokumen Upload & Akses Pintu */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Dokumen Upload</h3>
          <p className="text-sm text-gray-600">
            <strong>Surat Tugas :</strong>{' '}
            {formData.document ? (
              <span className="text-green-600 font-medium">Sudah diupload</span>
            ) : (
              '-'
            )}
          </p>

          {showAksesPintu && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Detail Permohonan Akses Pintu</h3>
              <p className="text-sm text-gray-600">
                <strong>Pintu :</strong> {formData.accessDoor || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Waktu Akses :</strong> {formData.accessTime || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tujuan Akses :</strong> {formData.accessPurpose || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Jumlah Pendamping Protokoler :</strong>{' '}
                {formData.protokolerCount || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Jumlah & Jenis Kendaraan :</strong> {formData.vehicleType || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Nomor Polisi Kendaraan :</strong> {formData.vehiclePlate || '-'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Butuh Pendampingan Protokoler:</strong>{' '}
                {typeof formData.needProtokolerEscort !== 'undefined'
                  ? (['ya', 'true', true, 1].includes(
                      typeof formData.needProtokolerEscort === 'string'
                        ? formData.needProtokolerEscort.toLowerCase()
                        : formData.needProtokolerEscort
                    )
                      ? 'Ya'
                      : 'Tidak')
                  : '-'}
              </p>
            </div>
          )}
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
          Saya menyatakan data di atas benar dan bersedia mematuhi SOP Pelayanan Stasiun Yogyakarta.
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