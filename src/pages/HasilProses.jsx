import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getVisitorCardDetail, checkStatus, getStations } from '../api';
import './HasilProses.css';
import Hourglass from '../assets/Hourglass.svg';
import CallIcon from '../assets/call.svg';
import SilangIcon from '../assets/silang.svg';
import InformationBox from '../assets/informationbox.svg';
import DetailInfoIcon from '../assets/detailinfo.svg';

import PopupPembatalan from './Pembatalan.jsx';
import PopupSukses from './PopUpSukses.jsx';


const ASSISTANCE_LABELS = {
  akses_pintu: "Hanya akses pintu timur/selatan",
  vip: "Hanya penggunaan ruang VIP",
  protokol: "Hanya pendampingan protokoler",
  protokoler: "Hanya pendampingan protokoler",
  "akses_pintu_protokol": "Akses pintu + pendampingan protokoler",
  "akses-pintu-protokol": "Akses pintu + pendampingan protokoler",
  "pintu_plus_protokoler": "Akses pintu + pendampingan protokoler",
  "vip_protokol": "Ruang VIP + pendampingan protokoler",
  "vip-protokol": "Ruang VIP + pendampingan protokoler",
  "akses_pintu_vip_protokol": "Akses pintu + ruang VIP + pendampingan protokoler",
  "akses-pintu-vip-protokol": "Akses pintu + ruang VIP + pendampingan protokoler",
  "vip_plus_pendampingan_protokoler": "Ruang VIP + pendampingan protokoler",
  "akses_pintu_plus_pendampingan_protokoler": "Akses pintu + pendampingan protokoler",
};

function prettyAssistanceLabel(raw) {
  if (!raw) return "-";
  const v = String(raw).trim();
  if (ASSISTANCE_LABELS[v]) return ASSISTANCE_LABELS[v];

  let s = v.replace(/[_-]+/g, " ").trim();
  s = s.replace(/\bplus\b/gi, "+");
  s = s.replace(/\s*\+\s*/g, " + ");
  s = s
    .replace(/\bvip\b/gi, "VIP")
    .replace(/\bprotokol(er)?\b/gi, "pendampingan protokoler")
    .replace(/\bakses pintu\b/gi, "Akses pintu")
    .replace(/\bruang vip\b/gi, "Ruang VIP");
  s = s.replace(/^\s*\w/, (c) => c.toUpperCase());
  return s.replace(/\s{2,}/g, " ").trim();
}

function formatProtokolerEscort(raw) {
  if (!raw) return "Tidak";
  const val = String(raw).toLowerCase().trim();
  if (val === "true" || val === "1" || val === "ya" || val === "yes") return "Ya";
  if (val === "false" || val === "0" || val === "tidak" || val === "no") return "Tidak";
  return "Tidak";
}

const HasilProses = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const rawNomor = location.state?.nomor;
  const nomor = (rawNomor ?? '').toString().trim();

  const [data, setData] = useState(null);
  const [stationsMap, setStationsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPopupPembatalan, setShowPopupPembatalan] = useState(false);
  const [showPopupSukses, setShowPopupSukses] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false); 

  // ==== Helpers waktu ====
  const normalizeDateString = (t) => {
    if (t === null || t === undefined) return '';
    const s = String(t).trim();
    if (!s || /^null|undefined$/i.test(s)) return '';

    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000).toISOString();
    if (/^\d{13}$/.test(s)) return new Date(Number(s)).toISOString();

    const isoMicro = s.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d+)(Z|[+\-]\d{2}:\d{2})$/);
    if (isoMicro) {
      const ms = isoMicro[2].slice(0, 3).padEnd(3, '0');
      return `${isoMicro[1]}.${ms}${isoMicro[3]}`;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+\-]\d{2}:\d{2})?$/.test(s)) {
      if (/[Z+\-]\d{2}:\d{2}$/.test(s)) return s;
      return `${s}+07:00`;
    }

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
      return s.replace(' ', 'T') + '+07:00';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return `${s}T00:00:00+07:00`;
    }

    return s;
  };

  const fmtFull = (t) => {
    const norm = normalizeDateString(t);
    if (!norm) return '-';
    const d = new Date(norm);
    if (isNaN(d.getTime())) return '-';
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).formatToParts(d);
      const get = (type) => parts.find((p) => p.type === type)?.value || '';
      return `${get('hour')}:${get('minute')}:${get('second')}, ${get('day')}/${get('month')}/${get('year')}`;
    } catch {
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}, ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
    }
  };

  const fmtDate = (t) => {
    const norm = normalizeDateString(t);
    if (!norm) return '-';
    const d = new Date(norm);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  };

  // normalisasi nama stasiun
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getStations();
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        const m = new Map();
        raw.forEach((it, idx) => {
          const id  = (typeof it?.id === 'number') ? it.id : (it?.code ?? it?.station_code ?? idx);
          const nm  = it?.name ?? it?.station_name ?? it?.nama ?? it?.title ?? it?.label ?? `Stasiun ${idx+1}`;
          if (id !== undefined && id !== null) m.set(String(id), String(nm));
          if (it?.code)         m.set(String(it.code), String(nm));
          if (it?.station_code) m.set(String(it.station_code), String(nm));
          m.set(String(nm), String(nm));
        });
        if (mounted) setStationsMap(m);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // ==== Normalisasi tampilan stasiun & visit type ====
  const resolveStationName = (d) => {
    const candidates = [ d?.station_name, d?.visit_station, d?.station, d?.station_code, d?.station_id ]
      .filter(v => v !== undefined && v !== null);
    for (const c of candidates) {
      const key = String(c);
      if (stationsMap.has(key)) return stationsMap.get(key);
      if (isNaN(Number(key)) && key.trim()) return key;
    }
    return '-';
  };

  const resolveVisitType = (d) => {
    const candidates = [
      d?.visit_type_label, d?.visit_type_name, d?.visit_type, d?.visitor_type,
      d?.jenis_kunjungan, d?.type_name, d?.type
    ].filter(v => v !== undefined && v !== null);
    for (const c of candidates) {
      const s = String(c).trim();
      if (s) return s;
    }
    return '-';
  };

  // ==== Fetch detail by reference ====
  async function fetchDetail(n) {
    try { const r1 = await getVisitorCardDetail(n);            const d1 = r1?.data?.data ?? r1?.data ?? null; if (d1) return d1; } catch {}
    try { const r2 = await getVisitorCardDetail({ reference_number: n }); const d2 = r2?.data?.data ?? r2?.data ?? null; if (d2) return d2; } catch {}
    try { const r3 = await checkStatus({ reference_number: n });         const d3 = r3?.data?.data ?? r3?.data ?? null; if (d3) return d3; } catch (e) { throw e; }
    return null;
  }

  // Normalize status string from various backend fields
  function getNormalizedStatus(d) {
    const raw = (
      d?.status || d?.application_status || d?.state || d?.status_code || d?.status_text || ''
    ).toString().toLowerCase();
    return raw;
  }

  // If status indicates terminal state, redirect to the appropriate result page
  function checkAndRedirect(d) {
    if (!d) return false;
    const s = getNormalizedStatus(d);
    if (!s) return false;

    if (s === 'approved' || s === 'disetujui' || s.includes('approve') || s.includes('accepted')) {
      navigate('/status/approved', { state: { nomor } });
      return true;
    }
    if (s === 'rejected' || s === 'ditolak' || s.includes('reject') || s.includes('declin')) {
      navigate('/status/rejected', { state: { nomor } });
      return true;
    }
    if (s === 'cancelled' || s === 'canceled' || s === 'dibatalkan' || s.includes('batal')) {
      navigate('/status/cancelled', { state: { nomor } });
      return true;
    }
    return false;
  }

  useEffect(() => {
    let mounted = true;
    if (!nomor) {
      setError('Nomor referensi tidak ditemukan. Silakan kembali dan masukkan nomor Anda.');
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true); setError('');
      try {
        const d = await fetchDetail(nomor);
        if (!mounted) return;
        if (!d) setError('Data tidak ditemukan. Pastikan nomor referensi benar.');
        else {
          setData(d);
          // jika status sudah berubah menjadi approved/rejected/cancelled, redirect segera
          checkAndRedirect(d);
        }
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

  // ==== Auto refresh tiap 30 detik ====
  useEffect(() => {
    if (!nomor) return;
    const id = setInterval(() => {
      fetchDetail(nomor)
        .then((d) => {
          if (!d) return;
          setData(d);
          // jika status berubah jadi terminal, redirect
          checkAndRedirect(d);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [nomor]);

  // ==== Popup handlers - YANG SUDAH DIPERBAIKI ====
  const handleOpenPopupPembatalan = () => setShowPopupPembatalan(true);
  const handleClosePopupPembatalan = () => setShowPopupPembatalan(false);
  
  // ← PERBAIKAN: set flag bahwa pembatalan baru terjadi
  const handleConfirmPembatalan = () => { 
    setShowPopupPembatalan(false); 
    setShowPopupSukses(true);
    setJustCancelled(true); // tandai bahwa baru saja dibatalkan
  };

  // ← PERBAIKAN: setelah popup sukses ditutup, refresh dan redirect
  const handleClosePopupSukses = () => {
    setShowPopupSukses(false);
    
    // Kalau memang baru saja dibatalkan
    if (justCancelled) {
      // Refresh data dulu untuk memastikan status terupdate
      fetchDetail(nomor)
        .then((d) => {
          if (d) setData(d);
          
          // Tunggu sebentar (500ms) lalu redirect ke halaman status dibatalkan
          setTimeout(() => {
            navigate('/status/cancelled', { state: { nomor } });
          }, 500);
        })
        .catch(() => {
          // Kalau gagal fetch, tetap redirect (fallback)
          setTimeout(() => {
            navigate('/status/cancelled', { state: { nomor } });
          }, 500);
        });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)   return <div className="text-red-500 p-4">{error}</div>;
  if (!data)   return <div className="p-4">Data kosong.</div>;

  const lastUpdated =
    data?.last_updated_at ??
    data?.updated_at ??
    data?.processed_at ?? data?.approved_at ?? data?.rejected_at ??
    data?.created_at ?? '';

  const stationName   = resolveStationName(data);
  const visitTypeName = resolveVisitType(data);

  // ==== Siapkan identitas untuk pembatalan ====
  const refNumber = data?.reference_number || nomor;
  const appId     = data?.id || data?.application_id || data?.visit_id || null;

  return (
    <div className="page-wrapper-hasil">
      <div className="main-card-container">
        {/* Header */}
        <div className="status-header">
          <img src={Hourglass} alt="Hourglass Icon" className="hourglass-icon" />
          <div className="status-text">
            <h3>Permohonan Sedang Diproses</h3>
            <p>Permohonan anda sedang dalam tahap verifikasi</p>
            <p className="last-updated">Terakhir diperbarui: {fmtFull(lastUpdated)}</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">NOMOR REFERENSI</span>
            <span className="info-value">{data?.reference_number || refNumber}</span>
          </div>
          <div className="info-item">
            <span className="info-label">NAMA PEMOHON</span>
            <span className="info-value">{data?.full_name || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">TUJUAN KUNJUNGAN</span>
            <span className="info-value">{data?.visit_purpose || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">STASIUN KUNJUNGAN</span>
            <span className="info-value">{stationName}</span>
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-header">
            <img src={DetailInfoIcon} alt="detail info icon" className="detail-info-icon" />
            <h4>Detail Permohonan</h4>
          </div>
          <hr className="divider" />
          <div className="date-status-grid">
            <div className="date-item">
              <span className="date-label">Tanggal Mulai Berlaku</span>
              <span className="date-value">{fmtDate(data?.visit_start_date || data?.start_date)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">Tanggal Berakhir</span>
              <span className="date-value">{fmtDate(data?.visit_end_date || data?.end_date)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">Jenis Visitor</span>
              <span className="date-value">{visitTypeName}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status Saat Ini</span>
              <span className="status-value-disetujui">{data?.status || '-'}</span>
            </div>
            <div className="info-item">
            <span className="info-label">Nama Penanggung Jawab (PIC)</span>
            <span className="info-value">{data?.pic_name || '-'}</span>
          </div>
           <div className="info-item">
            <span className="info-label">Jabatan Penanggung Jawab</span>
            <span className="info-value">{data?.pic_position || '-'}</span>
          </div>
           <div className="info-item">
            <span className="info-label">Layanan Pendampingan</span>
            <span className="info-value">{prettyAssistanceLabel(data?.assistance_service)}</span>
          </div>

           <div className="info-item">
            <span className="info-label">Pintu Yang Diajukan</span>
            <span className="info-value">{data?.access_door || '-'}</span>
          </div>
           <div className="info-item">
            <span className="info-label">Jumlah & Jenis Kendaraan</span>
            <span className="info-value">{data?.vehicle_type || '-'}</span>
          </div>
           <div className="info-item">
            <span className="info-label">Waktu Akses</span>
            <span className="info-value">{data?.access_time || '-'}</span>
          </div>
           <div className="info-item">
            <span className="info-label">Nopol Kendaraan</span>
            <span className="info-value">{data?.vehicle_plate || '-'}</span>
          </div>
            <div className="info-item">
            <span className="info-label">Tujuan Akses</span>
            <span className="info-value">{data?.access_purpose || '-'}</span>
          </div>
            <div className="info-item">
            <span className="info-label">Pendampingan Protokoler</span>
            <span className="info-value">{formatProtokolerEscort(data?.need_protokoler_escort)}</span>
          </div>
            <div className="info-item">
            <span className="info-label">Jumlah Pendampingan Protokoler</span>
            <span className="info-value">{data?.need_protokoler_escort || '-'}</span>
          </div>
          </div>
        </div>

        <div className="approval-note-box">
          <img src={InformationBox} alt='information box' className="information-box-icon" />
          <div className="note-content">
            <h5 className="note-title">Informasi Status</h5>
            <p className="note-text">
              Permohonan Anda sedang dalam tahap verifikasi. Tim kami sedang meninjau dokumen yang diajukan untuk memastikan kelengkapan dan kesesuaian dengan persyaratan.
            </p>
          </div>
        </div>
        
        <div className="button-group-tolak">
          <button className="re-apply-button-tolak" type="button">
            <img src={CallIcon} alt="Hubungi Keamanan" className="reapply-icon-tolak" />
            Hubungi Keamanan
          </button>

          <button
            className="contact-button-tolak"
            type="button"
            onClick={handleOpenPopupPembatalan}
            aria-label="Batalkan Pengajuan"
          >
            <img src={SilangIcon} alt="Batalkan Pengajuan" className="phone-icon-tolak" />
            Batalkan Pengajuan
          </button>
        </div>
      </div>

      {showPopupPembatalan && (
        <PopupPembatalan
          onClose={handleClosePopupPembatalan}
          onConfirm={handleConfirmPembatalan}
          nomor={refNumber}
          reference={refNumber}
          applicationId={appId}
        />
      )}

      {showPopupSukses && <PopupSukses onClose={handleClosePopupSukses} />}
    </div>
  );
};

export default HasilProses;