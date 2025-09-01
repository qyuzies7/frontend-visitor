import { useState } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import UploadField from '../components/UploadField';

const Step3 = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const maxFileSize = 10 * 1024 * 1024; // 10 MB in bytes

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const newErrors = {};

    if (file) {
      // Validasi tipe file
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        newErrors.document = 'File harus berupa PDF atau DOC/DOCX';
      }
      // Validasi ukuran file
      else if (file.size > maxFileSize) {
        newErrors.document = 'Ukuran file tidak boleh melebihi 10 MB';
      } else {
        // Simpan file ke formData jika valid
        setFormData({ ...formData, document: file });
      }
    } else {
      // Jika tidak ada file, hapus dari formData (opsional)
      setFormData({ ...formData, document: null });
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tidak perlu validasi wajib karena upload bersifat opsional
    nextStep();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 w-full px-4">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
        <FaFileAlt className="mr-2 text-blue-600" /> Upload Dokumen
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <p className="text-sm text-gray-600 mb-2">Surat Tugas (jika ada)</p>
          <UploadField
            label="Surat Tugas (Opsional, PDF atau DOC/DOCX)"
            name="document"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            error={errors.document}
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

export default Step3;