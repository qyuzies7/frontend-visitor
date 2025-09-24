import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getVisitorCardDetail, checkStatus, getStations } from '../api';
import './HasilCek.css';
import CheckIcon from '../assets/CheckIcon.svg';
import CheckBox from '../assets/checkbox.svg';
import DetailInfo from '../assets/detailinfo.svg';

const HasilCek = () => {
  const location = useLocation();
  const rawNomor = location.state?.nomor;
  const nomor = (rawNomor ?? '').toString().trim();

  const [data, setData] = useState(null);
  const [stationsMap, setStationsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // map id/kode nama stasiun
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getStations();
        const raw = Array.isArray(res?.data) ? res.data
                  : Array.isArray(res?.data?.data) ? res.data.data
                  : [];
        const m = new Map();
        raw.forEach((it, idx) => {
          const id  = (typeof it?.id === 'number') ? it.id : (it?.code ?? it?.station_code ?? idx);
          const nm  = it?.name ?? it?.station_name ?? it?.nama ?? it?.title ?? it?.label ?? (`Stasiun ${idx+1}`);
          if (id !== undefined && id !== null) m.set(String(id), String(nm));
          if (it?.code)        m.set(String(it.code), String(nm));
          if (it?.station_code)m.set(String(it.station_code), String(nm));
          m.set(String(nm), String(nm));
        });
        if (mounted) setStationsMap(m);
      } catch (_) {
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Helper ambil nama stasiun dari berbagai kemungkinan field
  const resolveStationName = (d) => {
    const candidates = [
      d?.station_name, d?.visit_station, d?.station, d?.station_code, d?.station_id
    ].filter(v => v !== undefined && v !== null);

    for (const c of candidates) {
      const key = String(c);
      if (stationsMap.has(key)) return stationsMap.get(key);
      if (isNaN(Number(key)) && key.trim()) return key;
    }
    return '-';
  };

  // Ambil detail berdasarkan nomor 
  async function fetchDetail(n) {
    try {
      const r1 = await getVisitorCardDetail(n);
      const d1 = r1?.data?.data ?? r1?.data ?? null;
      if (d1) return d1;
    } catch (_) {}
    try {
      const r2 = await getVisitorCardDetail({ reference_number: n });
      const d2 = r2?.data?.data ?? r2?.data ?? null;
      if (d2) return d2;
    } catch (_) {}
    try {
      const r3 = await checkStatus({ reference_number: n });
      const d3 = r3?.data?.data ?? r3?.data ?? null;
      if (d3) return d3;
    } catch (e) {
      throw e;
    }
    return null;
  }

  useEffect(() => {
    let mounted = true;
    if (!nomor) {
      setError('Nomor referensi tidak ditemukan. Silahkan kembali dan masukkan nomor Anda.');
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError('');
      try {
        const d = await fetchDetail(nomor);
        if (!mounted) return;
        if (!d) setError('Data tidak ditemukan. Pastikan nomor referensi benar.');
        else setData(d);
      } catch (e) {
        if (!mounted) return;
        const status = e?.response?.status;
        if (status === 404) setError('Data tidak ditemukan (404). Periksa nomor referensi Anda.');
        else if (status === 401 || status === 403) setError('Tidak memiliki akses ke data (401/403).');
        else setError('Gagal memuat data dari server.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [nomor]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!data) return <div className="p-4">Data kosong.</div>;

  const lastUpdated = (data.status === 'processing' ? data.created_at : data.updated_at) || data.last_updated || '';
  const stationName = resolveStationName(data);
  const fmt = (t) => (t ? new Date(t).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-');

  return (
    <div className="page-wrapper-hasil">
      <div className="main-card-container">
        {/* Status Header Section */}
        <div className="status-header">
          <img src={CheckIcon} alt="Check Icon" className="check-icon" />
          <div className="status-text">
            <h3>Permohonan Disetujui</h3>
            <p>Kartu visitor Anda telah disetujui dan siap diambil</p>
            <p className="last-updated">
              Terakhir diperbarui: {lastUpdated ? new Date(lastUpdated).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-'}
            </p>
          </div>
        </div>

        {/* Info Grid Section */}
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">NOMOR REFERENSI</span>
            <span className="info-value">{data.reference_number || data.id || '-'}</span>
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
            <span className="info-value">{stationName}</span>
          </div>
        </div>

        {/* Detail Section */}
        <div className="detail-section">
          <div className="detail-header">
           <img src={DetailInfo} alt="Detail Info" className="detail-info-icon" />
            <h4>Detail Permohonan</h4>
          </div>
          <hr className="divider" />
          <div className="date-status-grid">
            <div className="date-item">
              <span className="date-label">Tanggal Mulai Berlaku</span>
              <span className="date-value">{fmt(data.visit_start_date || data.start_date)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">Tanggal Berakhir</span>
              <span className="date-value">{fmt(data.visit_end_date || data.end_date)}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status Saat Ini</span>
              <span className="status-value-disetujui">{data.status || 'Disetujui'}</span>
            </div>
          </div>
        </div>

        {/* Approval Note Section */}
        <div className="approval-note-box">
          <img src={CheckBox} alt="Check Icon" className="note-check-icon" />
          <div className="note-content">
            <h5 className="note-title">Catatan Persetujuan</h5>
            <p className="note-text">
              Semua dokumen telah diverifikasi dan memenuhi persyaratan. Silakan ambil kartu visitor pada petugas keamanan dengan membawa kartu identitas asli.
            </p>
          </div>
        </div>

        {/* Contact Button */}
        <button className="contact-button">
          <svg className="phone-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>Hubungi Keamanan</span>
        </button>
      </div>
    </div>
  );
};

export default HasilCek;
