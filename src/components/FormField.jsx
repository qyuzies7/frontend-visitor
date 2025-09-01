// src/components/FormField.jsx
import React from 'react';

const FormField = ({ label, name, value, onChange, error, type = 'text', children, ...props }) => {
  const inputClasses = `mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            {...props}
          ></textarea>
        );
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            {...props}
          >
            {children}
          </select>
        );
      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            {...props}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {renderInput()}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormField;