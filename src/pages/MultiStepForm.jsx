import { useState } from 'react';
import StepIndicator from '../components/StepIndicator';
import Step1 from './Step1';
import Step2 from './Step2';
import Step2AksesPintu from './Step2AksesPintu';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import Button from '../components/Button';

const MultiStepForm = ({ initialStep = 1 }) => {
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('activeStep');
    return saved ? Number(saved) : initialStep;
  });

   const [formData, setFormData] = useState({});

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => {
      localStorage.setItem('activeStep', prev + 1);
      return prev + 1;
    });
  };

  const handleBack = () => {
    setStep((prev) => {
      localStorage.setItem('activeStep', prev - 1);
      return prev - 1;
    });
  };

  // Step Indicator names
  const steps = [
    'Jenis Kunjungan',
    'Data Diri',
    'Akses Pintu',
    'Upload Dokumen',
    'Konfirmasi',
    'Status'
  ];

  let CurrentStep;
  switch (step) {
    case 1:
      CurrentStep = <Step1 onNext={handleNext} />;
      break;
    case 2:
      CurrentStep = (
        <Step2
          formData={formData}
          setFormData={setFormData}
          nextStep={handleNext}
          prevStep={handleBack}
          visitType={formData.jenisKunjungan}
        />
      );
      break;
    case 3:
      CurrentStep = (
        <Step2AksesPintu
          formData={formData}
          setFormData={setFormData}
          nextStep={handleNext}
          prevStep={handleBack}
        />
      );
      break;
    case 4:
      CurrentStep = (
        <Step3
          formData={formData}
          setFormData={setFormData}
          nextStep={handleNext}
          prevStep={handleBack}
        />
      );
      break;
    case 5:
      CurrentStep = (
        <Step4
          formData={formData}
          setFormData={setFormData}
          nextStep={handleNext}
          prevStep={handleBack}
        />
      );
      break;
    case 6:
      CurrentStep = <Step5 submissionNumber={formData.submissionNumber} />;
      break;
    default:
      CurrentStep = <div>Error: Step tidak valid</div>;
  }

  return (
    <div className="min-h-screen bg-blue-100 p-2 md:p-6 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <StepIndicator currentStep={step} steps={steps} />
        <div className="w-full">
          {CurrentStep}
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;