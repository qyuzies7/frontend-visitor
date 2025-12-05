import { useState, useEffect } from 'react';
import { fetchOptionLists } from '../api';
import { FaUser } from 'react-icons/fa';
import FormField from '../components/FormField';

const STORAGE_KEY_FORMDATA = 'visitForm_formData';

const Step2AksesPintu = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});

  const [opts, setOpts] = useState({
    access_door: [],
    access_purpose: [],
    protokoler_count: [],
    need_protokoler_escort: [], 
  });

  const norm = (arr = []) =>
    (Array.isArray(arr) ? arr : []).map((o, i) => {
      const value = o?.value ?? o?.id ?? String(i);
      const label = o?.label ?? o?.name ?? String(value);
      return { value, label };
    });

  useEffect(() => {
    fetchOptionLists()
      .then((res) => {
        setOpts({
          access_door: norm(res.access_door),
          access_purpose: norm(res.access_purpose),
          protokoler_count: norm(res.protokoler_count),
          need_protokoler_escort: norm(res.need_protokoler_escort),
        });
      })
      .catch(() => {
        setOpts({ access_door: [], access_purpose: [], protokoler_count: [], need_protokoler_escort: [] });
      });
  }, []);

  // load saved formData from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_FORMDATA);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof setFormData === 'function') {
          setFormData((prev) => ({ ...(prev || {}), ...(parsed || {}) }));
        }
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist formData whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_FORMDATA, JSON.stringify(formData || {}));
    } catch {}
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'needProtokolerEscort') {
      const boolVal = value === 'true';
      const next = {
        ...formData,
        needProtokolerEscort: boolVal,
      };
      // jika TIDAK butuh, kosongkan jumlah
      if (boolVal === false) {
        next.protokolerCount = '';
        setErrors((prev) => ({ ...prev, protokolerCount: '' }));
      }
      setFormData(next);
      setErrors((prev) => ({ ...prev, [name]: '' }));
      return;
    }

    const next = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    setFormData(next);
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.accessDoor) newErrors.accessDoor = 'Pilih pintu yang diajukan';
    if (!formData.accessTime) newErrors.accessTime = 'Waktu akses wajib diisi';
    if (!formData.accessPurpose) newErrors.accessPurpose = 'Tujuan akses wajib diisi';
    if (!formData.vehicleType) newErrors.vehicleType = 'Jumlah & jenis kendaraan wajib diisi';
    if (!formData.vehiclePlate) newErrors.vehiclePlate = 'Nomor polisi kendaraan wajib diisi';
    if (typeof formData.needProtokolerEscort !== 'boolean') {
      newErrors.needProtokolerEscort = 'Pilih kebutuhan pendampingan protokoler';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) nextStep();
  };

  const escortStr =
    typeof formData.needProtokolerEscort === 'boolean'
      ? String(formData.needProtokolerEscort)
      : '';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
        <FaUser className="mr-2 text-blue-600" /> Permohonan Akses Pintu
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Pilih Pintu yang Diajukan"
          name="accessDoor"
          type="select"
          value={formData.accessDoor || ''}
          onChange={handleChange}
          error={errors.accessDoor}
        >
          <option value="">Pilih Pintu</option>
          {opts.access_door.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </FormField>

        <FormField
          label="Waktu Akses"
          name="accessTime"
          type="time"
          value={formData.accessTime || ''}
          onChange={handleChange}
          error={errors.accessTime}
        />

        <FormField
          label="Tujuan Akses"
          name="accessPurpose"
          type="select"
          value={formData.accessPurpose || ''}
          onChange={handleChange}
          error={errors.accessPurpose}
        >
          <option value="">Pilih Tujuan</option>
          {opts.access_purpose.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}

        </FormField>

        <FormField
          label="Apakah Anda membutuhkan pendampingan protokoler?"
          name="needProtokolerEscort"
          type="select"
          value={escortStr}
          onChange={handleChange}
          error={errors.needProtokolerEscort}
        >
          <option value="">Pilih</option>
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </FormField>

        <FormField
          label="Jumlah Pendamping Protokoler (opsional)"
          name="protokolerCount"
          type="select"
          value={formData.protokolerCount || ''}
          onChange={handleChange}
          error={errors.protokolerCount}
          disabled={formData.needProtokolerEscort === false}
        >
          <option value="">(Kosongkan jika tidak perlu)</option>
          {opts.protokoler_count.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}

        </FormField>

        <FormField
          label="Jumlah & Jenis Kendaraan"
          name="vehicleType"
          value={formData.vehicleType || ''}
          onChange={handleChange}
          error={errors.vehicleType}
          placeholder="contoh: 2 Mobil, 1 Bus"
        />

        <FormField
          label="Nomor Polisi Kendaraan"
          name="vehiclePlate"
          value={formData.vehiclePlate || ''}
          onChange={handleChange}
          error={errors.vehiclePlate}
          placeholder="contoh: AB 1234 CD, AB 5678 EF"
        />

        <div className="flex justify-between md:col-span-2 mt-4">
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

export default Step2AksesPintu;