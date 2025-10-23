import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getVisitorCardDetail, checkStatus, getStations } from '../api';
import { Icon } from '@iconify/react';
import './HasilTolak.css';
import DetailInfoIcon from '../assets/detailinfo.svg';

const HasilTolak = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rawNomor = location.state?.nomor;
  const nomor = (rawNomor ?? '').toString().trim();

  const [data, setData] = useState(null);
  const [stationsMap, setStationsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // hover state untuk tombol Ajukan Ulang
  const [hovered, setHovered] = useState(false);

  const red = '#E54000';

  // === Normalizer WIB ===
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

  // === Map stasiun (id/code/station_code/station_id/nama -> nama) ===
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
            it?.name ??
            it?.station_name ??
            it?.nama ??
            it?.title ??
            it?.label ??
            `Stasiun ${idx + 1}`;
          const keys = [it?.id, it?.code, it?.station_code, it?.station_id, nm];
          keys.forEach((k) => {
            if (k !== undefined && k !== null && String(k).trim() !== '') {
              m.set(String(k), String(nm));
            }
          });
        });
        if (mounted) setStationsMap(m);
      } catch {
        // biarkan kosong jika gagal
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // === Resolver stasiun (pakai map; kalau sudah nama, pakai langsung) ===
  const resolveStationName = (d) => {
    const cands = [
      d?.station_name,
      d?.visit_station,
      d?.station,
      d?.station_code,
      d?.station_id,
    ].filter((v) => v !== undefined && v !== null);
    for (const c of cands) {
      const key = String(c);
      if (stationsMap.has(key)) return stationsMap.get(key);
      if (isNaN(Number(key)) && key.trim()) return key; // sudah nama
    }
    return '-';
  };

  const resolveVisitType = (d) => {
    const cands = [
      d?.visit_type_label,
      d?.visit_type,
      d?.visitor_type,
      d?.jenis_kunjungan,
      d?.type_name,
      d?.type,
    ].filter(Boolean);
    for (const c of cands) {
      const s = String(c).trim();
      if (s) return s;
    }
    return '-';
  };

  // === Ambil detail ===
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

  // === Fetch awal ===
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
    return () => {
      mounted = false;
    };
  }, [nomor]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!data) return <div>Data kosong.</div>;

  const lastUpdated =
    data?.last_updated_at ||
    data?.updated_at ||
    data?.rejected_at ||
    data?.processed_at ||
    data?.created_at ||
    '';

  const stationName = resolveStationName(data);
  const visitTypeName = resolveVisitType(data);
  const reason = data.rejection_reason || data.reason || '-';

  // === Handler Ajukan Ulang ===
  const goApply = () => {
    navigate('/apply', {
      state: {
        from: 'hasil-tolak',
        previous_reference: data?.reference_number ?? nomor,
        full_name: data?.full_name,
        visit_purpose: data?.visit_purpose,
        station_name: stationName,
      },
      replace: false,
    });
  };

  // Style tombol dinamis berdasarkan hover
  const btnStyle = {
    border: `1px solid ${red}`,
    color: hovered ? '#FFFFFF' : red,
    fontWeight: 600,
    borderRadius: 8,
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: hovered ? red : 'white',
    cursor: 'pointer',
    transition: 'background 120ms ease, color 120ms ease',
    userSelect: 'none',
  };

  return (
    <div className="page-wrapper-hasil" style={{ background: '#EBF1F8' }}>
      <div className="main-card-container" style={{ borderTop: `5px solid ${red}` }}>
        {/* Header */}
        <div className="status-header">
          <Icon icon="ep:close-bold" color={red} width={90} height={90} />
          <div className="status-text-tolak" style={{ color: red }}>
            <h3>Permohonan Ditolak</h3>
            <p>Permohonan anda tidak dapat diproses lebih lanjut</p>
            <p className="last-updated-tolak">Terakhir diperbarui: {fmtFull(lastUpdated)}</p>
          </div>
        </div>

        {/* Info Grid */}
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
              <span className="date-value-tolak">
                {fmtDate(data.visit_start_date || data.start_date)}
              </span>
            </div>
            <div className="date-item-tolak">
              <span className="date-label-tolak">Tanggal Berakhir</span>
              <span className="date-value-tolak">
                {fmtDate(data.visit_end_date || data.end_date)}
              </span>
            </div>
            <div className="date-item-tolak">
              <span className="date-label-tolak">Jenis Visitor</span>
              <span className="date-value-tolak">{visitTypeName}</span>
            </div>
            <div className="status-item-tolak">
              <span className="status-label-tolak">Status Saat Ini</span>
              <span className="status-value-tolak" style={{ color: red, fontWeight: 600 }}>
                Ditolak
              </span>
            </div>
          </div>
        </div>

        {/* Alasan Penolakan */}
        <div
          className="rejection-note-box-tolak"
          style={{
            border: `1px solid ${red}`,
            background: '#FFECEC',
            borderRadius: 8,
            padding: 24,
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <Icon icon="solar:danger-triangle-bold" color={red} width={28} height={28} />
          <div className="note-content-tolak">
            <h5 style={{ color: red, margin: 0 }}>Alasan Penolakan</h5>
            <p style={{ marginTop: 6 }}>{reason}</p>
          </div>
        </div>

        {/* Tombol Ajukan Ulang (hover -> merah, teks+icon putih) */}
        <div className="button-group-tolak" style={{ marginTop: 24 }}>
          <button
            className="re-apply-button-tolak"
            style={btnStyle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={goApply}
          >
            <Icon
              icon="mingcute:repeat-line"
              color={hovered ? '#FFFFFF' : red}
              width={20}
              height={20}
            />
            <span style={{ color: hovered ? '#FFFFFF' : red }}>Ajukan Ulang</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HasilTolak;
