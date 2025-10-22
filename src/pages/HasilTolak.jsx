import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getVisitorCardDetail, checkStatus, getStations } from '../api';
import './HasilTolak.css';
import CrossIcon from '../assets/silang.svg';
import DetailInfoIcon from '../assets/detailinfo.svg';

const HasilTolak = () => {
  const location = useLocation();
  const rawNomor = location.state?.nomor;
  const nomor = (rawNomor ?? '').toString().trim();

  const [data, setData] = useState(null);
  const [stationsMap, setStationsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // === Jenis Visitor ===
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

  async function fetchDetail(n) {
    try { const r1 = await getVisitorCardDetail(n);            const d1 = r1?.data?.data ?? r1?.data ?? null; if (d1) return d1; } catch {}
    try { const r2 = await getVisitorCardDetail({ reference_number: n }); const d2 = r2?.data?.data ?? r2?.data ?? null; if (d2) return d2; } catch {}
    try { const r3 = await checkStatus({ reference_number: n });         const d3 = r3?.data?.data ?? r3?.data ?? null; if (d3) return d3; } catch (e) { throw e; }
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
      setLoading(true); setError('');
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

  useEffect(() => {
    if (!nomor) return;
    const id = setInterval(() => {
      fetchDetail(nomor).then((d) => d && setData(d)).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [nomor]);

  if (loading) return <div>Loading...</div>;
  if (error)   return <div className="text-red-500 p-4">{error}</div>;
  if (!data)   return <div className="p-4">Data kosong.</div>;

  const lastUpdated =
    data?.last_updated_at ??
    data?.updated_at ??
    data?.rejected_at ?? data?.processed_at ??
    data?.created_at ?? '';

  const stationName   = resolveStationName(data);
  const visitTypeName = resolveVisitType(data);
  const reason        = data.rejection_reason || data.reason || '-';

  return (
    <div className="page-wrapper-hasil">
      <div className="main-card-container">
        {/* Header */}
        <div className="status-header">
          <img src={CrossIcon} alt="Rejected Icon" className="cross-icon-tolak" />
          <div className="status-text-tolak">
            <h3>Permohonan Ditolak</h3>
            <p>Mohon periksa kembali data/dokumen Anda sesuai catatan berikut</p>
            <p className="last-updated-tolak">Terakhir diperbarui: {fmtFull(lastUpdated)}</p>
          </div>
        </div>

        <div className="info-grid-tolak">
          <div className="info-item-tolak">
            <span className="info-label-tolak">NOMOR REFERENSI</span>
            <span className="info-value-tolak">{data.reference_number}</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">NAMA PEMOHON</span>
            <span className="info-value-tolak">{data.full_name}</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">TUJUAN KUNJUNGAN</span>
            <span className="info-value-tolak">{data.visit_purpose}</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">STASIUN KUNJUNGAN</span>
            <span className="info-value-tolak">{stationName}</span>
          </div>
        </div>

        {/* Detail */}
        <div className="detail-section-tolak">
          <div className="detail-header-tolak">
            <img src={DetailInfoIcon} alt="detail info icon" className="user-icon-tolak" />
            <h4>Detail Permohonan</h4>
          </div>
          <hr className="divider-tolak" />
          <div className="date-status-grid-tolak">
            <div className="date-item-tolak">
              <span className="date-label-tolak">Tanggal Mulai Berlaku</span>
              <span className="date-value-tolak">{fmtDate(data.visit_start_date || data.start_date)}</span>
            </div>
            <div className="date-item-tolak">
              <span className="date-label-tolak">Tanggal Berakhir</span>
              <span className="date-value-tolak">{fmtDate(data.visit_end_date || data.end_date)}</span>
            </div>
            <div className="date-item-tolak">
              <span className="date-label-tolak">Jenis Visitor</span>
              <span className="date-value-tolak">{visitTypeName}</span>
            </div>
            <div className="status-item-tolak">
              <span className="status-label-tolak">Status Saat Ini</span>
              <span className="status-value-tolak">{data.status || 'rejected'}</span>
            </div>
          </div>
        </div>

        <div className="rejection-note-box-tolak">
          <div className="note-content-tolak">
            <h5>Alasan Penolakan</h5>
            <p>{reason}</p>
          </div>
        </div>

        <div className="button-group-tolak">
          <button className="re-apply-button-tolak">Ajukan Ulang</button>
        </div>
      </div>
    </div>
  );
};

export default HasilTolak;
