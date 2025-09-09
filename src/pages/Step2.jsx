import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import FormField from '../components/FormField';

const Step2 = ({ formData, setFormData, nextStep, prevStep, visitType }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Nama Lengkap wajib diisi';
    if (!formData.company) newErrors.company = 'Instansi/Perusahaan wajib diisi';
    if (!formData.idNumber) newErrors.idNumber = 'Nomor KTP wajib diisi';
    else if (!/^\d{16}$/.test(formData.idNumber)) newErrors.idNumber = 'Nomor KTP harus 16 digit';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Nomor Handphone wajib diisi';
    else if (!/^\d{10,13}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Nomor Handphone tidak valid';
    if (!formData.email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email tidak valid';
    if (!formData.visitDate) newErrors.visitDate = 'Tanggal Kunjungan wajib diisi';
    if (!formData.endDate) newErrors.endDate = 'Tanggal Selesai Kunjungan wajib diisi';
    if (!formData.visitStation) newErrors.visitStation = 'Stasiun Kunjungan wajib diisi';
    if (!formData.visitPurpose) newErrors.visitPurpose = 'Tujuan Kunjungan wajib diisi';

    // Validasi masa berlaku berdasarkan jenis kartu
    if (formData.visitDate && formData.endDate) {
      const visitDate = new Date(formData.visitDate);
      const endDate = new Date(formData.endDate);
      const diffDays = (endDate - visitDate) / (1000 * 60 * 60 * 24);

      // Pastikan endDate tidak sebelum visitDate
      if (diffDays < 0) {
        newErrors.endDate = 'Tanggal selesai kunjungan tidak boleh sebelum tanggal kunjungan';
      } else {
        switch (visitType) {
          case 'regular':
            if (diffDays !== 0) {
              newErrors.endDate = 'Pengunjung regular hanya boleh memilih tanggal kunjungan 1 hari';
            }
            break;
          case 'vip':
          case 'darurat':
            if (diffDays > 2) {
              newErrors.endDate = 'Masa berlaku untuk pengunjung VIP atau Darurat maksimal 3 hari';
            }
            break;
          case 'vendor':
            if (diffDays < 30 || diffDays > 365) {
              newErrors.endDate = 'Masa berlaku untuk pengunjung Vendor harus antara 1 bulan hingga 1 tahun';
            }
            break;
          case 'pelajar':
            // Tidak ada batasan ketat untuk pelajar, selama endDate >= visitDate
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
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
        <FaUser className="mr-2 text-blue-600" /> Data Diri Pengunjung
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nama Lengkap"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />
        <FormField
          label="Instansi/Perusahaan"
          name="company"
          value={formData.company}
          onChange={handleChange}
          error={errors.company}
        />
        <FormField
          label="Nomor KTP"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleChange}
          error={errors.idNumber}
        />
        <FormField
          label="Nomor Handphone"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          label="Tanggal Kunjungan"
          name="visitDate"
          type="date"
          value={formData.visitDate}
          onChange={handleChange}
          error={errors.visitDate}
          min={new Date().toISOString().split('T')[0]}
        />
        <FormField
          label="Selesai Kunjungan"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          error={errors.endDate}
          min={formData.visitDate || new Date().toISOString().split('T')[0]}
        />
        <FormField
          label="Stasiun Kunjungan"
          name="visitStation"
          type="select"
          value={formData.visitStation}
          onChange={handleChange}
          error={errors.visitStation}
        >
          <option value="">Pilih Stasiun</option>
          <option value="Stasiun Lempuyangan">Stasiun Lempuyangan</option>
          <option value="Stasiun Yogyakarta">Stasiun Yogyakarta</option>
          <option value="Stasiun Solo Balapan">Stasiun Solo Balapan</option>
        </FormField>
        <div className="mb-4 md:col-span-2">
          <FormField
            label="Tujuan Kunjungan"
            name="visitPurpose"
            type="textarea"
            value={formData.visitPurpose}
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