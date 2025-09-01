import React from 'react';
import { FaUpload } from 'react-icons/fa';

const UploadField = ({ label, name, accept, onChange, error }) => {
  return (
    <div className="border border-gray-300 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-2">
        <FaUpload className="text-2xl text-gray-500" />
      </div>
      <p className="text-sm text-gray-600 mb-1">Klik untuk upload surat tugas</p>
      <p className="text-xs text-gray-500">Surat tugas, surat izin, dll. (PDF, DOC, DOCX - Max. 10MB)</p>
      <input
        type="file"
        name={name}
        accept={accept}
        onChange={onChange}
        className="hidden"
        id={`upload-${name}`}
      />
      <label
        htmlFor={`upload-${name}`}
        className="cursor-pointer mt-4 inline-block bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md text-sm"
      >
        Pilih File
      </label>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default UploadField;