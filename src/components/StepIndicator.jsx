const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300 mb-8 overflow-x-hidden md:overflow-x-auto md:no-scrollbar">
      <div className="relative flex items-center justify-between w-full md:min-w-[600px]">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          return (
            <div key={stepNumber} className="flex flex-col items-center z-10 min-w-[60px] md:min-w-[100px]">
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-transform duration-300 text-white ${
                  isActive ? 'scale-110 shadow-lg' : isCompleted ? '' : 'bg-gray-200 text-gray-600'
                }`}
                style={
                  isActive || isCompleted
                    ? { background: 'linear-gradient(to right, #1E3A8A 0%, #3B82F6 100%)' }
                    : {}
                }
              >
                {stepNumber}
              </div>
              <span className="text-[10px] md:text-xs mt-1 text-gray-600 text-center max-w-[60px] md:max-w-[80px] truncate">
                {label}
              </span>
            </div>
          );
        })}
        {/* Garis penghubung dengan warna dinamis */}
        {steps.length > 1 && (
          <div
            className="absolute top-3 md:top-4 h-0.5 bg-gray-300"
            style={{
              left: 'calc(30px + 0.5rem)', // Sesuaikan untuk mobile
              right: 'calc(30px + 0.5rem)', // Sesuaikan untuk mobile
            }}
          >
            {/* Garis biru yang menunjukkan progres */}
            <div
              className="absolute h-0.5 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                background: 'linear-gradient(to right, #1E3A8A 0%, #3B82F6 100%)',
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepIndicator;