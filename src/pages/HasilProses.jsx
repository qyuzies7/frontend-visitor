import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getVisitorCardDetail, checkStatus, getStations } from '../api';
import './HasilProses.css';
import Hourglass from '../assets/Hourglass.svg';
import CallIcon from '../assets/call.svg';
import SilangIcon from '../assets/silang.svg';
import InformationBox from '../assets/informationbox.svg';
import DetailInfoIcon from '../assets/detailinfo.svg';

import PopupPembatalan from './Pembatalan.jsx';
import PopupSukses from './PopUpSukses.jsx';

const HasilProses = () => {
  const location = useLocation();
  const rawNomor = location.state?.nomor;
  const nomor = (rawNomor ?? '').toString().trim();

  const [data, setData] = useState(null);
  const [stationsMap, setStationsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPopupPembatalan, setShowPopupPembatalan] = useState(false);
  const [showPopupSukses, setShowPopupSukses] = useState(false);

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
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

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
      setError('Nomor referensi tidak ditemukan. Silakan kembali dan masukkan nomor Anda.');
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

  const handleOpenPopupPembatalan = () => setShowPopupPembatalan(true);
  const handleClosePopupPembatalan = () => setShowPopupPembatalan(false);
  const handleConfirmPembatalan = () => {
    // TODO: panggil endpoint pembatalan jika tersedia
    setShowPopupPembatalan(false);
    setShowPopupSukses(true);
  };
  const handleClosePopupSukses = () => setShowPopupSukses(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!data) return <div className="p-4">Data kosong.</div>;

  const lastUpdated = data.updated_at || data.last_updated || '';
  const stationName = resolveStationName(data);
  const fmt = (t) => (t ? new Date(t).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-');

  return (
    <div className="page-wrapper-hasil">
      <div className="main-card-container">
        {/* Status Header Section */}
        <div className="status-header">
          <img src={Hourglass} alt="Hourglass Icon" className="hourglass-icon" />
          <div className="status-text">
            <h3>Permohonan Sedang Diproses</h3>
            <p>Permohonan anda sedang dalam tahap verifikasi</p>
            <p className="last-updated">
              Terakhir diperbarui: {lastUpdated ? new Date(lastUpdated).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-'}
            </p>
          </div>
        </div>

        {/* Info Grid Section */}
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">NOMOR REFERENSI</span>
            <span className="info-value">{data.reference_number}</span>
          </div>
          <div className="info-item">
            <span className="info-label">NAMA PEMOHON</span>
            <span className="info-value">{data.full_name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">TUJUAN KUNJUNGAN</span>
            <span className="info-value">{data.visit_purpose}</span>
          </div>
          <div className="info-item">
            <span className="info-label">STASIUN KUNJUNGAN</span>
            <span className="info-value">{stationName}</span>
          </div>
        </div>

        {/* Detail Section */}
        <div className="detail-section">
          <div className="detail-header">
            <img src={DetailInfoIcon} alt="detail info icon" className="detail-info-icon" />
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
              <span className="status-value-disetujui">{data.status}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="approval-note-box">
          <img src={InformationBox} alt='information box' className="information-box-icon" />
          <div className="note-content">
            <h5 className="note-title">Informasi Status</h5>
            <p className="note-text">
              Permohonan Anda sedang dalam tahap verifikasi. Tim kami sedang meninjau dokumen yang diajukan untuk memastikan kelengkapan dan kesesuaian dengan persyaratan.
            </p>
          </div>
        </div>

        {/* Contact / Cancel Buttons */}
        <div className="button-group-tolak">
          <button className="re-apply-button-tolak">
            <img src={CallIcon} alt="Hubungi Keamanan" className="reapply-icon-tolak" />
            Hubungi Keamanan
          </button>
          <button className="contact-button-tolak" onClick={handleOpenPopupPembatalan}>
            <img src={SilangIcon} alt="Batalkan Pengajuan" className="phone-icon-tolak" />
            Batalkan Pengajuan
          </button>
        </div>
      </div>

      {showPopupPembatalan && (
        <PopupPembatalan
          onClose={handleClosePopupPembatalan}
          onConfirm={handleConfirmPembatalan}
        />
      )}
      {showPopupSukses && <PopupSukses onClose={handleClosePopupSukses} />}
    </div>
  );
};

export default HasilProses;
