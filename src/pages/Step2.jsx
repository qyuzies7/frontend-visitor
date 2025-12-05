import { useState, useEffect } from 'react';
import { getStations, fetchOptionLists } from '../api';
import { FaUser } from 'react-icons/fa';
import FormField from '../components/FormField';

const STORAGE_KEY_FORMDATA = 'visitForm_formData';

const Step2 = ({ formData, setFormData, nextStep, prevStep, visitType }) => {
  const [errors, setErrors] = useState({});
  const [stations, setStations] = useState([]);

  const [opts, setOpts] = useState({
    assistance_service: [],
  });

  const norm = (arr = []) =>
    (Array.isArray(arr) ? arr : []).map((o, i) => {
      const value = o?.value ?? o?.id ?? String(i);
      const label = o?.label ?? o?.name ?? String(value);
      return { value, label };
    });

  const normalizeStations = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw.map((it, idx) => {
      if (typeof it === 'string') {
        const text = it.trim();
        return { id: `station-${idx}`, name: text, value: text };
      }
      const name =
        it?.name ??
        it?.station_name ??
        it?.nama ??
        it?.title ??
        it?.label ??
        it?.station ??
        String(it?.value ?? it?.code ?? it?.id ?? `Stasiun ${idx + 1}`);
      let id = it?.id;
      if (typeof id !== 'number') id = null;
      id = id ?? it?.code ?? it?.station_code ?? it?.value ?? idx;

      return {
        id,
        name: String(name).trim(),
        value: id,
      };
    });
  };

  useEffect(() => {
    getStations()
      .then((res) => {
        const raw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        const normalized = normalizeStations(raw);

        setStations(
          normalized.length
            ? normalized
            : [
                { id: 'lempuyangan', value: 'Stasiun Lempuyangan', name: 'Stasiun Lempuyangan' },
                { id: 'yogyakarta', value: 'Stasiun Yogyakarta', name: 'Stasiun Yogyakarta' },
                { id: 'solo-balapan', value: 'Stasiun Solo Balapan', name: 'Stasiun Solo Balapan' },
              ]
        );
      })
      .catch(() => {
        setStations([
          { id: 'lempuyangan', value: 'Stasiun Lempuyangan', name: 'Stasiun Lempuyangan' },
          { id: 'yogyakarta', value: 'Stasiun Yogyakarta', name: 'Stasiun Yogyakarta' },
          { id: 'solo-balapan', value: 'Stasiun Solo Balapan', name: 'Stasiun Solo Balapan' },
        ]);
      });

    fetchOptionLists()
      .then((res) => {
        setOpts({
          assistance_service: norm(res.assistance_service),
        });
      })
      .catch(() => {
        setOpts({ assistance_service: [] });
      });
  }, []);

  // load saved formData from sessionStorage on mount (so refresh restores values)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_FORMDATA);
      if (raw) {
        const parsed = JSON.parse(raw);
        // merge saved values into current formData
        if (typeof setFormData === 'function') {
          setFormData((prev) => ({ ...(prev || {}), ...(parsed || {}) }));
        }
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist formData to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_FORMDATA, JSON.stringify(formData || {}));
    } catch {}
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Nama Lengkap wajib diisi';
    if (!formData.company) newErrors.company = 'Instansi/Perusahaan wajib diisi';
    if (!formData.picName) newErrors.picName = 'Nama Penanggung Jawab (PIC) wajib diisi';
    if (!formData.picPosition) newErrors.picPosition = 'Jabatan Penanggung Jawab wajib diisi';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Nomor Handphone wajib diisi';
    else if (!/^\d{10,13}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Nomor Handphone tidak valid';
    if (!formData.email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email tidak valid';
    if (!formData.visitDate) newErrors.visitDate = 'Tanggal Kunjungan wajib diisi';
    if (!formData.endDate) newErrors.endDate = 'Tanggal Selesai Kunjungan wajib diisi';
    if (!formData.visitStation) newErrors.visitStation = 'Stasiun Kunjungan wajib diisi';
    if (!formData.visitPurpose) newErrors.visitPurpose = 'Tujuan Kunjungan wajib diisi';
    if (!formData.serviceType) newErrors.serviceType = 'Pilih Layanan Pendampingan';

    if (formData.visitDate && formData.endDate) {
      const visitDate = new Date(formData.visitDate);
      const endDate = new Date(formData.endDate);
      const diffDays = Math.round((endDate - visitDate) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        newErrors.endDate = 'Tanggal selesai kunjungan tidak boleh sebelum tanggal kunjungan';
      } else {
        switch (visitType) {
          case 'regular':
            if (diffDays !== 0) newErrors.endDate = 'Pengunjung regular hanya boleh memilih 1 hari';
            break;
          case 'vip':
          case 'darurat':
            if (diffDays > 2) newErrors.endDate = 'Maksimal 3 hari untuk VIP/Darurat';
            break;
          case 'vendor':
            if (diffDays < 30 || diffDays > 365) newErrors.endDate = 'Vendor 1–12 bulan';
            break;
          default:
            break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) nextStep();
  };

  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
        <FaUser className="mr-2 text-blue-600" /> Data Diri Pengunjung
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nama Lengkap"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handleChange}
          error={errors.fullName}
        />
        <FormField
          label="Instansi/Perusahaan"
          name="company"
          value={formData.company || ''}
          onChange={handleChange}
          error={errors.company}
        />
        <FormField
          label="Nama Penanggung Jawab (PIC)"
          name="picName"
          value={formData.picName || ''}
          onChange={handleChange}
          error={errors.picName}
        />
        <FormField
          label="Jabatan Penanggung Jawab"
          name="picPosition"
          value={formData.picPosition || ''}
          onChange={handleChange}
          error={errors.picPosition}
        />
        <FormField
          label="Nomor Handphone"
          name="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={handleChange}
          error={errors.phoneNumber}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          label="Tanggal Kunjungan"
          name="visitDate"
          type="date"
          value={formData.visitDate || ''}
          onChange={handleChange}
          error={errors.visitDate}
          min={todayISO}
        />
        <FormField
          label="Selesai Kunjungan"
          name="endDate"
          type="date"
          value={formData.endDate || ''}
          onChange={(e) => {
            handleChange(e);
            setFormData({ ...formData, endDate: e.target.value, visitEndDate: e.target.value });
          }}
          error={errors.endDate}
          min={formData.visitDate || todayISO}
        />

        <FormField
          label="Stasiun Kunjungan"
          name="visitStation"
          type="select"
          value={formData.visitStation || ''}
          onChange={handleChange}
          error={errors.visitStation}
        >
          <option value="">Pilih Stasiun</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FormField>

        <FormField
          label="Layanan Pendampingan"
          name="serviceType"
          type="select"
          value={formData.serviceType || ''}
          onChange={handleChange}
          error={errors.serviceType}
        >
          <option value="">Pilih Layanan</option>
          {opts.assistance_service.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </FormField>

        <div className="mb-4 md:col-span-2">
          <FormField
            label="Tujuan Kunjungan"
            name="visitPurpose"
            type="textarea"
            value={formData.visitPurpose || ''}
            onChange={handleChange}
            error={errors.visitPurpose}
            rows="4"
          />
        </div>

        <div className="flex justify-between md:col-span-2">
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            Kembali
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-customBlue text-white rounded-md hover:bg-customBlue-hover transition-colors"
          >
            Lanjutkan
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2;