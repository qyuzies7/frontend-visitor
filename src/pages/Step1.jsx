import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import CardType from '../components/CardType';
import { useNavigate } from 'react-router-dom';

const Step1 = ({ onNext }) => {
  const [selectedType, setSelectedType] = useState('');
  const navigate = useNavigate();

  const visitorTypes = [
    {
      id: 'regular',
      label: 'Visitor Regular',
      description: 'Kunjungan untuk tamu umum harian.',
      borderColor: 'border-t-4 border-t-blue-700',
      iconBgColor: 'bg-blue-300',
      textColor: 'text-blue-900',
      selectedBorderColor: 'border-blue-700',
    },
    {
      id: 'vip',
      label: 'Visitor VIP',
      description: 'Kunjungan untuk undangan khusus, prioritas, dan akses VIP.',
      borderColor: 'border-t-4 border-t-purple-700',
      iconBgColor: 'bg-purple-300',
      textColor: 'text-purple-900',
      selectedBorderColor: 'border-purple-700',
    },
    {
      id: 'vendor',
      label: 'Visitor Vendor',
      description: 'Kunjungan untuk vendor resmi, bisnis, dan mitra.',
      borderColor: 'border-t-4 border-t-yellow-700',
      iconBgColor: 'bg-yellow-300',
      textColor: 'text-yellow-900',
      selectedBorderColor: 'border-yellow-700',
    },
    {
      id: 'pelajar',
      label: 'Visitor Pelajar',
      description: 'Kunjungan untuk pelajar, mahasiswa, atau kelompok pendidikan.',
      borderColor: 'border-t-4 border-t-green-700',
      iconBgColor: 'bg-green-300',
      textColor: 'text-green-900',
      selectedBorderColor: 'border-green-700',
    },
    {
      id: 'darurat',
      label: 'Visitor Darurat',
      description: 'Kunjungan untuk keadaan darurat, medis, atau keperluan mendesak.',
      borderColor: 'border-t-4 border-t-red-700',
      iconBgColor: 'bg-red-300',
      textColor: 'text-red-900',
      selectedBorderColor: 'border-red-700',
    },
  ];

  const handleSubmit = () => {
    if (selectedType) {
      onNext({ jenisKunjungan: selectedType });
    } else {
      alert('Pilih jenis kunjungan terlebih dahulu!');
    }
  };

  // Tombol kembali menggunakan useNavigate ke landing page
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
            key={type.id}
            id={type.id}
            label={type.label}
            description={type.description}
            borderColor={type.borderColor}
            iconBgColor={type.iconBgColor}
            textColor={type.textColor}
            selectedBorderColor={type.selectedBorderColor}
            onClick={() => setSelectedType(type.id)}
            isSelected={selectedType === type.id}
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
          disabled={!selectedType}
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            selectedType ? 'bg-customBlue hover:bg-customBlue-hover' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
};

export default Step1;