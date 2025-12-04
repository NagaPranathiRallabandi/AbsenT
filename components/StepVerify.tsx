import React, { useState, useEffect } from 'react';
import { Student } from '../types';

interface StepVerifyProps {
  scannedNumbers: string[];
  classStudents: Student[];
  onConfirm: (finalPresentees: string[]) => void;
  onBack: () => void;
}

export const StepVerify: React.FC<StepVerifyProps> = ({ scannedNumbers, classStudents, onConfirm, onBack }) => {
  // Verified: Found in both scan and class list
  const [verifiedPresentees, setVerifiedPresentees] = useState<string[]>([]);
  // Unknown: Found in scan but NOT in class list
  const [unknownPresentees, setUnknownPresentees] = useState<string[]>([]);
  
  const [manualInput, setManualInput] = useState('');

  const naturalSort = (a: string, b: string) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  };

  // Helper to get the numeric value at the end of a string
  const getTrailingNumber = (str: string): number | null => {
    const match = str.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  useEffect(() => {
    const uniqueScanned: string[] = Array.from(new Set(scannedNumbers));
    // Create a Set of valid Class IDs for fast lookup
    const classIdSet = new Set(classStudents.map(s => s.id));

    const verifiedSet = new Set<string>();
    const unknownSet = new Set<string>();

    const findMatches = (scannedId: string): string[] => {
      // 1. Exact String Match
      if (classIdSet.has(scannedId)) return [scannedId];

      // 2. Smart Match (Last N Digits)
      const isNumericScan = /^\d+$/.test(scannedId);
      if (!isNumericScan) return [];

      const scanVal = parseInt(scannedId, 10);
      const potentialMatches: string[] = [];

      classStudents.forEach(student => {
        const classVal = getTrailingNumber(student.id);

        if (classVal !== null) {
          // If scanned is "1", match "...01" (4201 % 100 = 1)
          const modulo = scanVal < 100 ? 100 : (scanVal < 1000 ? 1000 : 10000);
          
          if (classVal % modulo === scanVal) {
             potentialMatches.push(student.id);
          }
        }
      });

      return potentialMatches;
    };

    uniqueScanned.forEach((scannedId) => {
      if (verifiedSet.has(scannedId)) return;

      const matches = findMatches(scannedId);

      if (matches.length === 1) {
        verifiedSet.add(matches[0]);
      } else {
        unknownSet.add(scannedId);
      }
    });

    setVerifiedPresentees(Array.from(verifiedSet).sort(naturalSort));
    setUnknownPresentees(Array.from(unknownSet).sort(naturalSort));
  }, [scannedNumbers, classStudents]);

  const removeVerified = (id: string) => {
    setVerifiedPresentees(prev => prev.filter(n => n !== id));
  };

  const removeUnknown = (id: string) => {
    setUnknownPresentees(prev => prev.filter(n => n !== id));
  };

  const approveUnknown = (scannedId: string) => {
    const isNumericScan = /^\d+$/.test(scannedId);
    let candidates: string[] = [];

    if (isNumericScan) {
      const scanVal = parseInt(scannedId, 10);
       classStudents.forEach(student => {
        const classVal = getTrailingNumber(student.id);
        if (classVal !== null) {
           const modulo = scanVal < 100 ? 100 : (scanVal < 1000 ? 1000 : 10000);
           if (classVal % modulo === scanVal) {
             candidates.push(student.id);
           }
        }
      });
    }

    setUnknownPresentees(prev => prev.filter(n => n !== scannedId));
    
    if (candidates.length > 0) {
      setVerifiedPresentees(prev => {
        const newSet = new Set([...prev, ...candidates]);
        return Array.from(newSet).sort(naturalSort);
      });
    } else {
      setVerifiedPresentees(prev => [...prev, scannedId].sort(naturalSort));
    }
  };

  const addManual = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualInput.trim();
    if (cleanId) {
      if (verifiedPresentees.includes(cleanId)) {
        setManualInput('');
        return;
      }
      setVerifiedPresentees(prev => [...prev, cleanId].sort(naturalSort));
      
      if (unknownPresentees.includes(cleanId)) {
        setUnknownPresentees(prev => prev.filter(n => n !== cleanId));
      }
      setManualInput('');
    }
  };

  const finalSubmit = () => {
    onConfirm(verifiedPresentees);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full">
       <div className="flex items-center mb-4">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-xl font-bold ml-2">Verify Presentees</h2>
      </div>

      <form onSubmit={addManual} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Add ID manually..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-0 outline-none"
        />
        <button 
          type="submit"
          disabled={!manualInput}
          className="bg-slate-800 text-white px-6 rounded-xl font-medium disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        
        {/* Section 1: Unknown */}
        {unknownPresentees.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
             <div className="flex items-start gap-3 mb-3">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-lg mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-amber-800">Review Required</h3>
                  <p className="text-sm text-amber-700">These scanned numbers didn't automatically match a single student.</p>
                </div>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {unknownPresentees.map(id => (
                  <div key={id} className="flex rounded-lg overflow-hidden border border-amber-200 shadow-sm">
                    <button 
                      onClick={() => approveUnknown(id)}
                      className="bg-white px-3 py-2 font-bold text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1"
                    >
                      {id} <span className="text-xs opacity-50">?</span>
                    </button>
                    <button 
                      onClick={() => removeUnknown(id)}
                      className="bg-amber-100 px-2 py-2 text-amber-700 hover:bg-red-100 hover:text-red-700 border-l border-amber-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Section 2: Verified */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-3 flex justify-between">
            <span>Verified Presentees</span>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{verifiedPresentees.length}</span>
          </h3>
          
          {verifiedPresentees.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic">
              No valid IDs selected yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {verifiedPresentees.map(id => (
                <button
                  key={id}
                  onClick={() => removeVerified(id)}
                  className="px-3 py-2 flex items-center justify-between bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors group text-sm"
                >
                  <span className="truncate mr-2">{id}</span>
                  <div className="opacity-0 group-hover:opacity-100 text-red-500">
                     &times;
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <button
          onClick={finalSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
        >
          Calculate Absentees
        </button>
      </div>
    </div>
  );
};