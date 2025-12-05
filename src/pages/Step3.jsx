import { useState, useEffect } from 'react';
import { FaFileAlt, FaUpload } from 'react-icons/fa';
import checkIcon from '../assets/check1.svg';

const STORAGE_KEY_FORMDATA = 'visitForm_formData';

const Step3 = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Load saved formData from sessionStorage on mount (merge into parent state)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_FORMDATA);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          // if parsed.document is metadata, move to documentMeta and ensure document is null
          if (parsed.document && parsed.document.__isFileMeta) {
            parsed.documentMeta = parsed.document;
            parsed.document = null;
          }
          if (typeof setFormData === 'function') {
            setFormData((prev) => ({ ...(prev || {}), ...(parsed || {}) }));
          }
        }
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist formData to sessionStorage whenever it changes
  useEffect(() => {
    try {
      const toSave = { ...(formData || {}) };
      // Replace File with metadata so JSON.stringify works
      if (toSave.document instanceof File) {
        toSave.document = {
          __isFileMeta: true,
          name: toSave.document.name,
          type: toSave.document.type,
          size: toSave.document.size,
        };
      }
      // keep documentMeta if present
      sessionStorage.setItem(STORAGE_KEY_FORMDATA, JSON.stringify(toSave));
    } catch {
      // ignore storage errors
    }
  }, [formData]);

  useEffect(() => {
    // If parent formData contains a File -> success; if it contains documentMeta -> also treat as uploaded
    if (formData?.document instanceof File) {
      setUploadSuccess(true);
    } else if (formData?.documentMeta && formData.documentMeta.__isFileMeta) {
      setUploadSuccess(true);
    } else {
      setUploadSuccess(false);
    }
  }, [formData?.document, formData?.documentMeta]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    const newErrors = {};
    setUploadSuccess(false);

    if (!file) {
      setFormData({ ...formData, document: null, documentMeta: null });
      setErrors({});
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];

    if (!validTypes.includes(file.type)) {
      newErrors.document = 'File harus berupa PDF, DOC/DOCX, atau Gambar (JPG/PNG)';
    } else if (file.size > maxFileSize) {
      newErrors.document = 'Ukuran file tidak boleh melebihi 10 MB';
    } else {
      setIsUploading(true);
      setTimeout(() => {
        // Save File in parent state and also store lightweight metadata
        setFormData({
          ...formData,
          document: file,
          documentMeta: {
            __isFileMeta: true,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        });
        setIsUploading(false);
        setUploadSuccess(true);
      }, 800);
    }

    setErrors(newErrors);
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, document: null, documentMeta: null });
    setUploadSuccess(false);
    setErrors({});
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_FORMDATA);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          parsed.document = null;
          parsed.documentMeta = null;
          sessionStorage.setItem(STORAGE_KEY_FORMDATA, JSON.stringify(parsed));
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep(4);
  };

  const openPicker = () => {
    document.getElementById('documentInput')?.click();
  };

  const hasRealFile = formData?.document instanceof File;
  const hasMetaOnly = !hasRealFile && formData?.documentMeta && formData.documentMeta.__isFileMeta;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 max-w-4xl mx-auto min-h-[460px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
        <FaFileAlt className="mr-2 text-blue-600" /> Upload Dokumen
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="md:col-span-2">
          <p className="text-sm text-gray-600 mb-2">Surat Tugas (jika ada)</p>

          <div className="p-6 min-h-[300px] mb-2 w-full border border-gray-300 rounded flex items-center justify-center">
            {isUploading ? (
              <span className="text-blue-600 text-base text-center w-full">Mengunggah…</span>
            ) : (
              <>
                {hasRealFile ? (
                  <div className="flex flex-col items-center w-full text-center">
                    <img src={checkIcon} alt="Centang" className="mb-2" style={{ width: 64, height: 64 }} />
                    <span className="text-blue-500 text-sm mb-2">File berhasil diupload!</span>

                    {formData.document.type?.startsWith('image/') && (
                      <img src={URL.createObjectURL(formData.document)} alt={formData.document.name} className="max-h-40 mb-2 rounded shadow" />
                    )}

                    <span className="text-gray-600 mb-3 break-all font-medium">{formData.document.name}</span>

                    <div className="flex gap-2">
                      <button type="button" className="px-3 py-1 bg-gray-100 text-blue-600 rounded hover:bg-gray-200 text-sm font-medium shadow" onClick={openPicker}>
                        Ganti File
                      </button>
                      <button type="button" className="px-3 py-1 bg-gray-100 text-red-600 rounded hover:bg-gray-200 text-sm font-medium shadow" onClick={handleRemoveFile}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : hasMetaOnly ? (
                  <div className="flex flex-col items-center w-full text-center">
                    <img src={checkIcon} alt="Centang" className="mb-2" style={{ width: 64, height: 64 }} />
                    <span className="text-blue-500 text-sm mb-2">File terdeteksi dari sesi sebelumnya</span>

                    <span className="text-gray-600 mb-3 break-all font-medium">{formData.documentMeta?.name}</span>

                    <div className="flex gap-2">
                      <button type="button" className="px-3 py-1 bg-gray-100 text-blue-600 rounded hover:bg-gray-200 text-sm font-medium shadow" onClick={openPicker}>
                        Ganti File
                      </button>
                      <button type="button" className="px-3 py-1 bg-gray-100 text-red-600 rounded hover:bg-gray-200 text-sm font-medium shadow" onClick={handleRemoveFile}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <FaUpload className="text-gray-500 mb-2" size={28} />
                    <h3 className="text-gray-700 font-semibold mb-1">Klik untuk upload surat tugas</h3>

                    <p className="text-gray-500 text-sm mb-3">Surat tugas, surat izin, dll. (PDF, DOC, JPG, PNG - Max. 10MB)</p>

                    <button type="button" onClick={openPicker} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors shadow">
                      Pilih File
                    </button>
                  </div>
                )}
              </>
            )}

            <input id="documentInput" type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} disabled={isUploading} />
          </div>

          {errors.document && <p className="text-red-600 text-sm mt-1">{errors.document}</p>}
        </div>

        <div className="md:col-span-2 mt-auto">
          <div className="flex justify-between">
            <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors" disabled={isUploading}>
              Kembali
            </button>
            <button type="submit" className="px-4 py-2 bg-customBlue text-white rounded-md hover:bg-customBlue-hover transition-colors" disabled={isUploading}>
              Lanjutkan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Step3;