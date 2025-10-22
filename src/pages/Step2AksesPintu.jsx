import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import FormField from '../components/FormField';

const Step2AksesPintu = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.accessDoor) newErrors.accessDoor = 'Pilih pintu yang diajukan';
    if (!formData.accessTime) newErrors.accessTime = 'Waktu akses wajib diisi';
    if (!formData.accessPurpose) newErrors.accessPurpose = 'Tujuan akses wajib diisi';
    if (!formData.protokolerCount) newErrors.protokolerCount = 'Jumlah pendamping protokoler wajib diisi';
    if (!formData.vehicleType) newErrors.vehicleType = 'Jumlah & jenis kendaraan wajib diisi';
    if (!formData.vehiclePlate) newErrors.vehiclePlate = 'Nomor polisi kendaraan wajib diisi';
    if (typeof formData.needProtokolerEscort === 'undefined' || formData.needProtokolerEscort === '') {
      newErrors.needProtokolerEscort = 'Pilih kebutuhan pendampingan protokoler';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) nextStep();
  };

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
          <option value="timur">Timur</option>
          <option value="selatan">Selatan</option>
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
          <option value="jemput">Jemput</option>
          <option value="antar">Antar</option>
        </FormField>

        <FormField
          label="Jumlah Pendamping Protokoler (maks. 2)"
          name="protokolerCount"
          type="select"
          value={formData.protokolerCount || ''}
          onChange={handleChange}
          error={errors.protokolerCount}
        >
          <option value="">Pilih Jumlah</option>
          <option value="1">1</option>
          <option value="2">2</option>
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

        <FormField
          label="Apakah Anda membutuhkan pendampingan protokoler?"
          name="needProtokolerEscort"
          type="select"
          value={formData.needProtokolerEscort || ''}
          onChange={handleChange}
          error={errors.needProtokolerEscort}
        >
          <option value="">Pilih</option>
          <option value="ya">Ya</option>
          <option value="tidak">Tidak</option>
        </FormField>

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