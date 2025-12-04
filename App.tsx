import React, { useState } from 'react';
import { StepSetup } from './components/StepSetup';
import { StepCapture } from './components/StepCapture';
import { StepVerify } from './components/StepVerify';
import { StepResult } from './components/StepResult';
import { AppStep, AttendanceData, Student } from './types';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [data, setData] = useState<AttendanceData>({
    classStudents: [],
    presentees: [],
    absentees: [],
    image: null
  });

  const handleSetupComplete = (students: Student[]) => {
    setData(prev => ({ ...prev, classStudents: students }));
    setStep(AppStep.CAPTURE);
  };

  const handleCaptureComplete = (numbers: string[], image: string) => {
    setData(prev => ({ ...prev, presentees: numbers, image }));
    setStep(AppStep.VERIFY);
  };

  const handleVerificationComplete = (finalPresentees: string[]) => {
    setData(prev => ({ ...prev, presentees: finalPresentees }));
    setStep(AppStep.RESULT);
  };

  const handleReset = () => {
    // We reset everything BUT the class list, assuming user might want to run another day for same class.
    setData(prev => ({
      ...prev,
      presentees: [],
      absentees: [],
      image: null
    }));
    setStep(AppStep.SETUP);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full h-[90vh] max-h-[800px] flex flex-col">
        {step === AppStep.SETUP && (
          <StepSetup 
            initialValues={data.classStudents} 
            onNext={handleSetupComplete} 
          />
        )}
        
        {step === AppStep.CAPTURE && (
          <StepCapture 
            onDataExtracted={handleCaptureComplete}
            onBack={() => setStep(AppStep.SETUP)}
          />
        )}

        {step === AppStep.VERIFY && (
          <StepVerify 
            scannedNumbers={data.presentees}
            classStudents={data.classStudents}
            onConfirm={handleVerificationComplete}
            onBack={() => setStep(AppStep.CAPTURE)}
          />
        )}

        {step === AppStep.RESULT && (
          <StepResult 
            data={data}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}