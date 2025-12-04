import React, { useMemo, useRef } from 'react';
import { AttendanceData, Student } from '../types';

// Declare global types for the external libraries
declare const window: any;

interface StepResultProps {
  data: AttendanceData;
  onReset: () => void;
}

export const StepResult: React.FC<StepResultProps> = ({ data, onReset }) => {
  const { classStudents, presentees } = data;
  const tableRef = useRef<HTMLDivElement>(null);

  const naturalSort = (a: Student, b: Student) => {
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  };

  const absentees: Student[] = useMemo(() => {
    const presentSet = new Set(presentees);
    // Filter the master list
    return classStudents
      .filter(student => !presentSet.has(student.id))
      .sort(naturalSort);
  }, [classStudents, presentees]);

  const extraPresentees = useMemo(() => {
    const classIdSet = new Set(classStudents.map(s => s.id));
    return presentees
      .filter(id => !classIdSet.has(id))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classStudents, presentees]);

  const copyToClipboard = () => {
    const text = `Absentees (${absentees.length}):\n` + 
      absentees.map(s => `${s.id} ${s.name} ${s.phone}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert("List copied to clipboard!");
    });
  };

  const exportPDF = () => {
    if (!window.jspdf) return alert("PDF library not loaded");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text(`Absentees Report - ${new Date().toLocaleDateString()}`, 14, 15);
    doc.text(`Total: ${absentees.length}`, 14, 25);

    doc.autoTable({
      startY: 30,
      head: [['ID', 'Name', 'Phone']],
      body: absentees.map(s => [s.id, s.name, s.phone]),
    });

    doc.save("attendance_report.pdf");
  };

  const exportExcel = () => {
    if (!window.XLSX) return alert("Excel library not loaded");
    const wb = window.XLSX.utils.book_new();
    const ws = window.XLSX.utils.json_to_sheet(absentees);
    window.XLSX.utils.book_append_sheet(wb, ws, "Absentees");
    window.XLSX.writeFile(wb, "attendance_report.xlsx");
  };

  const exportImage = async () => {
    if (!tableRef.current || !window.html2canvas) return alert("Image library not loaded");
    const canvas = await window.html2canvas(tableRef.current);
    const link = document.createElement('a');
    link.download = 'attendance_report.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Attendance Report</h2>
        <div className="flex justify-center gap-4 text-sm mt-2">
           <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
             {presentees.length} Present
           </span>
           <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
             {absentees.length} Absent
           </span>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-center gap-2 mb-4 overflow-x-auto py-2">
        <button onClick={exportPDF} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">
           PDF
        </button>
        <button onClick={exportExcel} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">
           Excel
        </button>
        <button onClick={exportImage} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">
           Image
        </button>
        <button onClick={copyToClipboard} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">
           Copy Text
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Absentees List</h3>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2" ref={tableRef}>
          {absentees.length === 0 ? (
            <div className="h-full flex items-center justify-center text-green-600 flex-col py-10">
              <span className="font-medium text-lg">All students present!</span>
            </div>
          ) : (
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                 <tr>
                   <th className="px-3 py-2 w-1/4">Roll No</th>
                   <th className="px-3 py-2">Name</th>
                   <th className="px-3 py-2 text-right">Phone</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {absentees.map((s) => (
                   <tr key={s.id} className="hover:bg-slate-50">
                     <td className="px-3 py-3 font-bold text-slate-700">{s.id}</td>
                     <td className="px-3 py-3 text-slate-600">{s.name || '-'}</td>
                     <td className="px-3 py-3 text-right text-slate-500 font-mono">{s.phone || '-'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
          
          {extraPresentees.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-100">
               <strong>Extras ({extraPresentees.length}):</strong> {extraPresentees.join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onReset}
          className="w-full bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-semibold py-4 rounded-xl transition-colors"
        >
          Start New Class
        </button>
      </div>
    </div>
  );
};