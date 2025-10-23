import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getVisitorCardDetail, checkStatus, getStations } from '../api';
import { Icon } from '@iconify/react';
import './HasilCek.css';
import CheckIcon from '../assets/CheckIcon.svg';
import DetailInfo from '../assets/detailinfo.svg';

const HasilCek = () => {
  const location = useLocation();
  const rawNomor = location.state?.nomor;
  const nomor = (rawNomor ?? '').toString().trim();

  const [data, setData] = useState(null);
  const [stationsMap, setStationsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // === NORMALIZER ===
  const normalizeDateString = (t) => {
    if (!t) return '';
    const s = String(t).trim();
    if (!s || /^null|undefined$/i.test(s)) return '';
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000).toISOString();
    if (/^\d{13}$/.test(s)) return new Date(Number(s)).toISOString();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00+07:00`;
    if (/^\d{4}-\d{2}-\d{2} /.test(s)) return s.replace(' ', 'T') + '+07:00';
    return s;
  };

  const fmtFull = (t) => {
    const d = new Date(normalizeDateString(t));
    if (isNaN(d)) return '-';
    return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  };

  const fmtDate = (t) => {
    const d = new Date(normalizeDateString(t));
    if (isNaN(d)) return '-';
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
  };

  // ==== Map stasiun (lebih toleran: id/code/station_code/nama -> nama) ====
  useEffect(() => {
    (async () => {
      try {
        const res = await getStations();
        const raw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        const map = new Map();
        raw.forEach((it, idx) => {
          const id =
            typeof it?.id === 'number'
              ? it.id
              : it?.code ?? it?.station_code ?? idx;
          const nm =
            it?.name ??
            it?.station_name ??
            it?.nama ??
            it?.title ??
            it?.label ??
            `Stasiun ${idx + 1}`;
          if (id !== undefined && id !== null) map.set(String(id), String(nm));
          if (it?.code) map.set(String(it.code), String(nm));
          if (it?.station_code) map.set(String(it.station_code), String(nm));
          // Simpan juga nama sebagai key → bila API sudah kirim nama langsung
          map.set(String(nm), String(nm));
        });
        setStationsMap(map);
      } catch {
        // abaikan error pemuatan daftar stasiun
      }
    })();
  }, []);

  // ==== Resolver stasiun: pakai map, jika non-numeric & tidak kosong -> pakai langsung ====
  const resolveStationName = (d) => {
    const candidates = [
      d?.station_name,
      d?.visit_station,
      d?.station,
      d?.station_code,
      d?.station_id,
    ].filter((v) => v !== undefined && v !== null);

    for (const c of candidates) {
      const key = String(c);
      if (stationsMap.has(key)) return stationsMap.get(key);
      // kalau sudah berupa nama (bukan angka/kode), gunakan langsung
      if (isNaN(Number(key)) && key.trim()) return key;
    }
    return '-';
  };

  const resolveVisitType = (d) =>
    d?.visit_type_label || d?.visit_type || d?.visitor_type || '-';

  // Fetch data
  async function fetchDetail(n) {
    try {
      const r = await getVisitorCardDetail(n);
      return r?.data?.data ?? r?.data ?? null;
    } catch {
      try {
        const r2 = await checkStatus({ reference_number: n });
        return r2?.data?.data ?? r2?.data ?? null;
      } catch {
        return null;
      }
    }
  }

  useEffect(() => {
    (async () => {
      if (!nomor) return setError('Nomor referensi tidak ditemukan.');
      try {
        const d = await fetchDetail(nomor);
        if (!d) return setError('Data tidak ditemukan.');
        setData(d);
      } catch {
        setError('Gagal memuat data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [nomor]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!data) return <div>Data kosong.</div>;

  const lastUpdated =
    data.last_updated_at ||
    data.updated_at ||
    data.processed_at ||
    data.created_at ||
    '';

  const status = (data.status || '').toLowerCase();
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  const green = '#14AE5C';
  const red = '#E54000';

  let statusText = '',
    statusDesc = '',
    catatanTitle = '',
    catatanNote = '';

  if (isApproved) {
    statusText = 'Permohonan Disetujui';
    statusDesc = 'Kartu visitor Anda telah disetujui dan siap diambil.';
    catatanTitle = 'Catatan Persetujuan';
    catatanNote =
      data.approval_notes ||
      'Semua dokumen telah diverifikasi dan memenuhi persyaratan.';
  } else if (isRejected) {
    statusText = 'Permohonan Ditolak';
    statusDesc = 'Permohonan Anda tidak dapat diproses lebih lanjut.';
    catatanTitle = 'Alasan Penolakan';
    catatanNote =
      data.rejection_reason ||
      'Dokumen tidak sesuai persyaratan atau ada data yang belum lengkap.';
  } else {
    statusText = 'Permohonan Sedang Diproses';
    statusDesc = 'Permohonan Anda sedang dalam tahap verifikasi.';
    catatanTitle = 'Informasi Status';
    catatanNote =
      'Permohonan Anda sedang dalam tahap verifikasi oleh tim kami.';
  }

  return (
    <div
      className="page-wrapper-hasil"
      style={{
        background: isApproved ? '#e5e7eb;' : isRejected ? '#FFF5F5' : '#EBF1F8',
      }}
    >
      <div
        className="main-card-container"
        style={{
          borderTop: `5px solid ${isApproved ? green : isRejected ? red : '#28a745'}`,
        }}
      >
        {/* Header */}
        <div className="status-header">
          {isApproved ? (
            <Icon icon="mingcute:check-2-fill" color={green} width={90} height={90} />
          ) : isRejected ? (
            <Icon icon="solar:danger-triangle-bold" color={red} width={75} height={75} />
          ) : (
            <img src={CheckIcon} alt="Status" className="check-icon" />
          )}

          <div
            className="status-text"
            style={{ color: isApproved ? green : isRejected ? red : '#333' }}
          >
            <h3 style={{ color: isApproved ? green : isRejected ? red : undefined }}>
              {statusText}
            </h3>
            <p>{statusDesc}</p>
            <p className="last-updated">Terakhir diperbarui: {fmtFull(lastUpdated)}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">NOMOR REFERENSI</span>
            <span className="info-value">
              {data.reference_number || data.id || '-'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">NAMA PEMOHON</span>
            <span className="info-value">{data.full_name || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">TUJUAN KUNJUNGAN</span>
            <span className="info-value">{data.visit_purpose || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">STASIUN KUNJUNGAN</span>
            <span className="info-value">{resolveStationName(data)}</span>
          </div>
        </div>

        {/* Detail */}
        <div className="detail-section">
          <div className="detail-header">
            <img src={DetailInfo} alt="Detail Info" className="detail-info-icon" />
            <h4>Detail Permohonan</h4>
          </div>
          <hr className="divider" />
          <div className="date-status-grid">
            <div className="date-item">
              <span className="date-label">Tanggal Mulai Berlaku</span>
              <span className="date-value">
                {fmtDate(data.visit_start_date || data.start_date)}
              </span>
            </div>
            <div className="date-item">
              <span className="date-label">Tanggal Berakhir</span>
              <span className="date-value">
                {fmtDate(data.visit_end_date || data.end_date)}
              </span>
            </div>
            <div className="date-item">
              <span className="date-label">Jenis Visitor</span>
              <span className="date-value">{resolveVisitType(data)}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status Saat Ini</span>
              <span
                className="status-value-disetujui"
                style={{ color: isApproved ? green : isRejected ? red : '#28a745' }}
              >
                {isApproved ? 'Diterima' : isRejected ? 'Ditolak' : data.status || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div
          className="approval-note-box"
          style={{
            border: `1px solid ${isApproved ? green : isRejected ? red : '#28a745'}`,
            background: isApproved ? '#EAFBF3' : isRejected ? '#FFECEC' : '#f1f8f3',
          }}
        >
          <Icon
            icon={
              isApproved
                ? 'material-symbols:check-box-rounded'
                : isRejected
                ? 'solar:danger-triangle-bold'
                : 'material-symbols:info'
            }
            color={isApproved ? green : isRejected ? red : '#28a745'}
            width={28}
            height={28}
          />
          <div className="note-content">
            <h5
              className="note-title"
              style={{ color: isApproved ? green : isRejected ? red : '#28a745' }}
            >
              {catatanTitle}
            </h5>
            <p className="note-text">{catatanNote}</p>
          </div>
        </div>

        {/* Kontak */}
        <button className="contact-button">
          <svg
            className="phone-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>Hubungi Keamanan</span>
        </button>
      </div>
    </div>
  );
};

export default HasilCek;
