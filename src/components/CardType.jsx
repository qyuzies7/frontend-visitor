import React from 'react';
import { FaUser } from 'react-icons/fa';

const CardType = ({ id, label, description, borderColor, iconBgColor, textColor, selectedBorderColor, onClick, isSelected }) => {
  return (
    <button
      key={id}
      onClick={onClick}
      className={`p-4 rounded-lg bg-white border-2 ${borderColor} hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 shadow-md ${
        isSelected ? `${selectedBorderColor} border-2` : 'border-transparent'
      } flex flex-col items-center justify-center text-center`}
    >
      <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center mb-2`}>
        <FaUser className="text-xl" />
      </div>
      <span className={`text-sm font-medium ${textColor}`}>{label}</span>
      <span className={`text-xs ${textColor} mt-1 whitespace-pre-line`}>{description}</span>
    </button>
  );
};

export default CardType;