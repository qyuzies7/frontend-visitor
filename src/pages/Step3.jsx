import { useState } from 'react';
import { FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import UploadField from '../components/UploadField';
import checkIcon from '../assets/check1.svg';

const Step3 = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const maxFileSize = 10 * 1024 * 1024; // 10 MB in bytes

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const newErrors = {};
    setUploadSuccess(false);

    if (file) {
      // Validasi tipe file
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp'
      ];
      if (!validTypes.includes(file.type)) {
        newErrors.document = 'File harus berupa PDF, DOC/DOCX, atau Gambar (JPG, PNG, WEBP)';
      }
      // Validasi ukuran file
      else if (file.size > maxFileSize) {
        newErrors.document = 'Ukuran file tidak boleh melebihi 10 MB';
      } else {
        setIsUploading(true);
        setTimeout(() => {
          setFormData({ ...formData, document: file });
          setIsUploading(false);
          setUploadSuccess(true);
        }, 1500);
      }
    } else {
      setFormData({ ...formData, document: null });
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep(4);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto min-h-[460px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
        <FaFileAlt className="mr-2 text-blue-600" /> Upload Dokumen
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="md:col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            Surat Tugas (jika ada) atau Gambar (JPG, PNG, WEBP)
          </p>
          <div className="border rounded p-6 flex flex-col items-center justify-center min-h-[150px] mb-2 w-full">
            {isUploading ? (
              <span className="text-blue-600 text-lg">Uploading...</span>
            ) : (
              <>
                {uploadSuccess && formData.document && (
                  <div className="flex flex-col items-center mb-2 w-full">
                    <img
                      src={checkIcon}
                      alt="Centang"
                      style={{ width: '64px', height: '64px', marginBottom: '8px' }}
                      className="animate-bounce"
                    />
                    {/* Pesan sukses di bawah centang */}
                    <span className="text-blue-500 text-sm mb-2">File berhasil diupload!</span>
                    {formData.document.type && formData.document.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(formData.document)}
                        alt={formData.document.name}
                        className="max-h-40 mb-2 rounded shadow"
                      />
                    ) : null}
                    <span className="text-gray-500 mb-2 break-all font-semibold">
                      {formData.document.name}
                    </span>
                    <button
                      type="button"
                       className="px-3 py-1 bg-gray-100 text-blue-600 rounded hover:bg-gray-200 hover:text-blue-800 text-sm font-medium shadow"
                      onClick={() => {
                        setFormData({ ...formData, document: null });
                        setUploadSuccess(false);
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                )}
                {!formData.document && (
                  <>
                    {uploadSuccess && (
                      <span className="text-green-600 text-lg font-semibold mb-2 flex items-center">
                        <FaCheckCircle style={{ fontSize: '40px', color: '#2563eb', marginRight: '8px' }} />
                        Upload selesai!
                      </span>
                    )}
                    <UploadField
                      label="Surat Tugas / Gambar (Opsional, PDF, DOC/DOCX, JPG, PNG, WEBP)"
                      name="document"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                      error={errors.document}
                      disabled={isUploading}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="md:col-span-2 mt-auto">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              disabled={isUploading}
            >
              Kembali
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-customBlue text-white rounded-md hover:bg-customBlue-hover transition-colors"
              disabled={isUploading}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Step3;