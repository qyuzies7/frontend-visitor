import { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CardType from '../components/CardType';
import { getVisitTypes } from '../api';

const Step1 = ({ onNext }) => {
  const [selectedCode, setSelectedCode] = useState('');
  const navigate = useNavigate();

  // ID numerik disesuaikan dengan isi tabel visit_types di DB-mu
  const [visitorTypes, setVisitorTypes] = useState([
    {
      id: 1,
      code: 'regular',
      label: 'Visitor Regular',
      description: 'Kunjungan untuk tamu umum harian.\n(1 hari)',
      borderColor: 'border-t-4 border-t-blue-700',
      iconBgColor: 'bg-blue-300',
      textColor: 'text-blue-900',
      selectedBorderColor: 'border-blue-700',
    },
    {
      id: 2,
      code: 'vip',
      label: 'Visitor VIP',
      description: 'Kunjungan untuk undangan khusus, prioritas, dan akses VIP.\n(1–3 hari)',
      borderColor: 'border-t-4 border-t-purple-700',
      iconBgColor: 'bg-purple-300',
      textColor: 'text-purple-900',
      selectedBorderColor: 'border-purple-700',
    },
    {
      id: 3,
      code: 'vendor',
      label: 'Visitor Vendor',
      description: 'Kunjungan untuk vendor resmi, bisnis, dan mitra.\n(1 bulan – 1 tahun)',
      borderColor: 'border-t-4 border-t-yellow-700',
      iconBgColor: 'bg-yellow-300',
      textColor: 'text-yellow-900',
      selectedBorderColor: 'border-yellow-700',
    },
    {
      id: 4,
      code: 'pelajar',
      label: 'Visitor Pelajar',
      description: 'Kunjungan untuk pelajar/mahasiswa.\n(Sesuai kegiatan)',
      borderColor: 'border-t-4 border-t-green-700',
      iconBgColor: 'bg-green-300',
      textColor: 'text-green-900',
      selectedBorderColor: 'border-green-700',
    },
    {
      id: 5,
      code: 'darurat',
      label: 'Visitor Darurat',
      description: 'Kunjungan untuk keadaan darurat/inspeksi.\n(1–3 hari)',
      borderColor: 'border-t-4 border-t-red-700',
      iconBgColor: 'bg-red-300',
      textColor: 'text-red-900',
      selectedBorderColor: 'border-red-700',
    },
  ]);

  // helper buat ambil label/description dari berbagai kemungkinan field
  const pickText = (item, keys) => {
    for (const k of keys) {
      const v = item?.[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return undefined;
  };

  // normalisasi kode dari API (biar ketemu dengan 'code' default)
  const normalizeCode = (item) => {
    const raw =
      item?.code ??
      item?.slug ??
      item?.type ??
      item?.type_code ??
      item?.name ??
      item?.title ??
      item?.id;
    if (!raw) return undefined;
    const s = String(raw).toLowerCase().trim();
    if (s.includes('vip')) return 'vip';
    if (s.includes('vendor')) return 'vendor';
    if (s.includes('pelajar') || s.includes('student') || s.includes('mahasiswa')) return 'pelajar';
    if (s.includes('darurat') || s.includes('emergency') || s.includes('inspeksi')) return 'darurat';
    if (s.includes('reg') || s.includes('umum') || s.includes('general')) return 'regular';
    return s;
  };

  useEffect(() => {
    getVisitTypes()
      .then((res) => {
        const api = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        // Bangun map by normalized code -> { id (numeric?) , label, description }
        const m = new Map();
        api.forEach((it) => {
          const code = normalizeCode(it);
          if (!code) return;
          const idNum = Number(it?.id);
          const label = pickText(it, ['label', 'name', 'title', 'nama', 'jenis']);
          const description = pickText(it, ['description', 'desc', 'deskripsi', 'keterangan', 'detail', 'notes']);
          m.set(code, {
            id: Number.isFinite(idNum) ? idNum : undefined,
            label,
            description,
          });
        });

        // Merge ke default: ID numerik default tetap dipakai kalau API tidak jelas
        setVisitorTypes((prev) =>
          prev.map((def) => {
            const hit = m.get(def.code);
            return {
              ...def,
              id: hit?.id ?? def.id,
              label: hit?.label ?? def.label,
              description: hit?.description?.trim() ? hit.description : def.description,
            };
          })
        );
      })
      .catch(() => {
        // Abaikan → tetap pakai default
      });
  }, []);

  const handleSubmit = () => {
    if (!selectedCode) {
      alert('Pilih jenis kunjungan terlebih dahulu!');
      return;
    }
    const selected = visitorTypes.find((t) => t.code === selectedCode);
    if (!selected) {
      alert('Tipe kunjungan tidak valid.');
      return;
    }
    onNext({
      jenisKunjungan: selected.id,
      jenisKunjunganLabel: selected.label,
    });
  };

  const handleBack = () => {
    navigate('/apply/attention');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-blue-800 flex items-center">
        <FaUser className="mr-2 text-blue-600" /> Pilih Jenis Kunjungan Anda
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {visitorTypes.map((type) => (
          <CardType
            key={type.code}
            id={type.code}
            label={type.label}
            description={type.description}
            borderColor={type.borderColor}
            iconBgColor={type.iconBgColor}
            textColor={type.textColor}
            selectedBorderColor={type.selectedBorderColor}
            onClick={() => setSelectedCode(type.code)}
            isSelected={selectedCode === type.code}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
        >
          Kembali
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedCode}
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            selectedCode ? 'bg-customBlue hover:bg-customBlue-hover' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
};

export default Step1;
