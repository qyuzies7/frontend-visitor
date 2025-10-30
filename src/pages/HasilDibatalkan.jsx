import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getVisitorCardDetail, checkStatus, getStations } from '../api';
import { Icon } from '@iconify/react';
import './HasilTolak.css'; 
import DetailInfoIcon from '../assets/detailinfo.svg';

const HasilDibatalkan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rawNomor = location.state?.nomor;
  const nomor = (rawNomor ?? '').toString().trim();

  const [data, setData] = useState(null);
  const [stationsMap, setStationsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [hovered, setHovered] = useState(false);

  const gray = '#6B7280';

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
    const norm = normalizeDateString(t);
    if (!norm) return '-';
    const d = new Date(norm);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
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
        const raw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        const m = new Map();
        raw.forEach((it, idx) => {
          const nm =
            it?.name ?? it?.station_name ?? it?.nama ?? it?.title ?? it?.label ?? `Stasiun ${idx + 1}`;
          const keys = [it?.id, it?.code, it?.station_code, it?.station_id, nm];
          keys.forEach((k) => {
            if (k !== undefined && k !== null && String(k).trim() !== '') {
              m.set(String(k), String(nm));
            }
          });
        });
        if (mounted) setStationsMap(m);
      } catch {}
    })();
    return () => (mounted = false);
  }, []);

  const resolveStationName = (d) => {
    const cands = [d?.station_name, d?.visit_station, d?.station, d?.station_code, d?.station_id].filter(
      (v) => v !== undefined && v !== null
    );
    for (const c of cands) {
      const key = String(c);
      if (stationsMap.has(key)) return stationsMap.get(key);
      if (isNaN(Number(key)) && key.trim()) return key;
    }
    return '-';
  };

  const resolveVisitType = (d) => {
    const cands = [d?.visit_type_label, d?.visit_type, d?.visitor_type, d?.jenis_kunjungan, d?.type_name, d?.type].filter(
      Boolean
    );
    for (const c of cands) {
      const s = String(c).trim();
      if (s) return s;
    }
    return '-';
  };

  async function fetchDetail(n) {
    try {
      const r1 = await getVisitorCardDetail(n);
      const d1 = r1?.data?.data ?? r1?.data ?? null;
      if (d1) return d1;
    } catch {}
    try {
      const r2 = await checkStatus({ reference_number: n });
      const d2 = r2?.data?.data ?? r2?.data ?? null;
      if (d2) return d2;
    } catch {}
    return null;
  }

  useEffect(() => {
    let mounted = true;
    if (!nomor) {
      setError('Nomor referensi tidak ditemukan.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const d = await fetchDetail(nomor);
        if (!mounted) return;
        if (!d) setError('Data tidak ditemukan.');
        else setData(d);
      } catch {
        if (!mounted) return;
        setError('Gagal memuat data dari server.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [nomor]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!data) return <div>Data kosong.</div>;

  const lastUpdated =
    data?.last_updated_at || data?.updated_at || data?.processed_at || data?.created_at || '';

  const stationName = resolveStationName(data);
  const visitTypeName = resolveVisitType(data);

  const goApply = () => {
    navigate('/apply', {
      state: {
        from: 'hasil-dibatalkan',
        previous_reference: data?.reference_number ?? nomor,
        full_name: data?.full_name,
        visit_purpose: data?.visit_purpose,
        station_name: stationName,
      },
      replace: false,
    });
  };

  const btnStyle = {
    border: `1px solid ${gray}`,
    color: hovered ? '#FFFFFF' : gray,
    fontWeight: 600,
    borderRadius: 8,
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: hovered ? gray : 'white',
    cursor: 'pointer',
    transition: 'background 120ms ease, color 120ms ease',
    userSelect: 'none',
  };

  return (
    <div className="page-wrapper-hasil" style={{ background: '#EBF1F8' }}>
      <div className="main-card-container" style={{ borderTop: `5px solid ${gray}` }}>
        
        <div className="status-header">
          <Icon icon="ic:round-cancel" color={gray} width={90} height={90} />
          <div className="status-text-tolak" style={{ color: gray }}>
            <h3 style={{ color: gray }}>Permohonan Dibatalkan</h3>
            <p style={{ color: '#5A5A5A' }}>Permohonan Anda telah dibatalkan</p>
            <p className="last-updated-tolak">Terakhir diperbarui: {fmtFull(lastUpdated)}</p>
          </div>
        </div>

        <div className="info-grid-tolak">
          <div className="info-item-tolak">
            <span className="info-label-tolak">NOMOR REFERENSI</span>
            <span className="info-value-tolak">{data.reference_number || '-'}</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">NAMA PEMOHON</span>
            <span className="info-value-tolak">{data.full_name || '-'}</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">TUJUAN KUNJUNGAN</span>
            <span className="info-value-tolak">{data.visit_purpose || '-'}</span>
          </div>
          <div className="info-item-tolak">
            <span className="info-label-tolak">STASIUN KUNJUNGAN</span>
            <span className="info-value-tolak">{stationName}</span>
          </div>
        </div>

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
              <span className="status-value-tolak" style={{ color: gray, fontWeight: 500 }}>
                Dibatalkan
              </span>
            </div>
          </div>
        </div>

        <div className="button-group-tolak" style={{ marginTop: 24, justifyContent: 'flex-start' }}>
          <button
            className="re-apply-button-tolak"
            style={btnStyle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={goApply}
          >
            <Icon
              icon="mingcute:repeat-line"
              color={hovered ? '#FFFFFF' : gray}
              width={20}
              height={20}
            />
            <span style={{ color: hovered ? '#FFFFFF' : gray }}>Ajukan Ulang</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default HasilDibatalkan;