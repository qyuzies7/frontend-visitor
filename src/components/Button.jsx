import React from 'react';

const Button = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-6 rounded-full text-sm font-semibold transition duration-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;