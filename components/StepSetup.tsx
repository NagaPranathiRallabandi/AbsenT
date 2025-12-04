import React, { useState, useEffect, useRef } from 'react';
import { extractClassListFromImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Student } from '../types';

interface StepSetupProps {
  initialValues: Student[];
  onNext: (students: Student[]) => void;
}

export const StepSetup: React.FC<StepSetupProps> = ({ initialValues, onNext }) => {
  const [inputText, setInputText] = useState('');
  const [parsedCount, setParsedCount] = useState(0);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize input text if we have previous data
  useEffect(() => {
    if (initialValues.length > 0 && !inputText) {
      // Convert objects back to CSV format for editing
      const csv = initialValues.map(s => {
        let line = s.id;
        if (s.name) line += `, ${s.name}`;
        if (s.phone) line += `, ${s.phone}`;
        return line;
      }).join('\n');
      setInputText(csv);
    }
  }, [initialValues]);

  const naturalSort = (a: Student, b: Student) => {
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  };

  const parseInputToStudents = (input: string): Student[] => {
    const lines = input.split('\n');
    const students: Student[] = [];
    const seenIds = new Set<string>();

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check for simple range: "1-60"
      const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);

      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          if (end - start > 1000) return; // safety limit
          for (let i = start; i <= end; i++) {
            const id = i.toString();
            if (!seenIds.has(id)) {
              students.push({ id, name: '', phone: '' });
              seenIds.add(id);
            }
          }
        }
      } else {
        // Parse CSV: ID, Name, Phone
        // Split by comma, respecting that name might have spaces
        const parts = trimmed.split(',').map(p => p.trim());
        const id = parts[0];
        
        if (id && !seenIds.has(id)) {
          students.push({
            id,
            name: parts[1] || '',
            phone: parts[2] || ''
          });
          seenIds.add(id);
        }
      }
    });

    return students.sort(naturalSort);
  };

  useEffect(() => {
    const list = parseInputToStudents(inputText);
    setParsedCount(list.length);
    if (list.length > 0) setError('');
  }, [inputText]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const extractedStudents = await extractClassListFromImage(base64String);
          if (extractedStudents.length > 0) {
            // Convert to CSV string
            const newCsv = extractedStudents.map(s => {
              // Ensure we don't output undefined
              return `${s.id}, ${s.name || ''}, ${s.phone || ''}`;
            }).join('\n');
            
            // Append to existing text
            setInputText(prev => prev ? `${prev}\n${newCsv}` : newCsv);
          } else {
            setError("No student data found in the image.");
          }
        } catch (e) {
          setError("Failed to extract data from image.");
        } finally {
          setIsAnalyzing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError("Error reading file.");
      setIsAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedStudents = parseInputToStudents(inputText);
    
    if (parsedStudents.length === 0) {
      setError("Please enter at least one roll number.");
      return;
    }
    if (parsedStudents.length > 2000) {
      setError("Class size limited to 2000.");
      return;
    }

    onNext(parsedStudents);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingSpinner text="Scanning class details..." />
        <p className="text-slate-400 text-sm mt-4 text-center px-6">
          Reading IDs, Names, and Phone numbers...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-center max-w-md mx-auto w-full">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Class List Setup</h1>
        <p className="text-slate-500 text-sm">Upload a master list (ID, Name, Phone) or enter manually.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[75vh] max-h-[650px]">
        
        <div className="mb-4">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
          />
          <button 
            type="button"
            onClick={triggerFileInput}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl border border-dashed border-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            Upload Class Photo
          </button>
        </div>

        <div className="flex-1 flex flex-col mb-4">
          <div className="flex justify-between items-baseline mb-2">
            <label htmlFor="rollList" className="block text-sm font-medium text-slate-700">
              Data Entry
            </label>
            <span className="text-xs text-slate-400">
              Format: ID, Name, Phone
            </span>
          </div>
          
          <textarea
            id="rollList"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={"23K4201, John Doe, 9876543210\n23K4202, Jane Smith, 9123456789\n1-60"}
            className="flex-1 w-full px-4 py-3 text-sm font-mono text-slate-700 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors resize-none whitespace-pre"
          />
          
          <div className="mt-2 flex justify-between items-center text-sm">
             <span className={`${error ? 'text-red-500' : 'text-slate-500'}`}>
               {error || (parsedCount > 0 ? `${parsedCount} students loaded` : 'No valid data yet')}
             </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={parsedCount === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
        >
          Next Step
        </button>
      </form>
    </div>
  );
};