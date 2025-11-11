
import React from 'react';
import type { AnalysisReport } from '../types';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';

interface AnalysisResultProps {
  result: AnalysisReport;
  image: string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, image }) => {
  const handleDownloadPdf = () => {
    // In a real application, this would trigger a backend API call
    // to generate and return a PDF file.
    alert('Симуляция скачивания PDF отчета. В реальном приложении здесь будет вызов backend для генерации файла.');
    console.log("Generating PDF with data:", { result, image, date: new Date().toLocaleDateString('ru-RU') });
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Текст скопирован в буфер обмена');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Не удалось скопировать текст');
    });
  };

  const renderSection = (title: string, content: string | React.ReactNode, fullTextToCopy?: string) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-sky-400">{title}</h3>
        {fullTextToCopy && (
            <button 
              onClick={() => handleCopyToClipboard(fullTextToCopy)}
              className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-700 rounded-md transition-colors"
              title="Копировать раздел"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
            </button>
        )}
      </div>
      <div className="text-slate-300 space-y-2 prose prose-invert prose-sm max-w-none">
        {content}
      </div>
    </div>
  );
  
  return (
    <div className="w-full text-left animate-fade-in space-y-6">
      {!result.isIdentified ? (
          renderSection("Заключение", <p className="text-amber-400">{result.defectDescription}</p>, result.defectDescription)
      ) : (
        <>
            {renderSection(
                "Описание дефекта", 
                <p>{result.defectDescription}</p>, 
                result.defectDescription
            )}
            
            {renderSection(
                "Возможные причины", 
                <p>{result.possibleCauses}</p>,
                result.possibleCauses
            )}

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-sky-400">Нарушенные нормы</h3>
                    <button 
                        onClick={() => handleCopyToClipboard(result.violatedNorms.map(n => `${n.code}: ${n.text}`).join('\n'))}
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-700 rounded-md transition-colors"
                        title="Копировать раздел"
                    >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="space-y-3">
                    {result.violatedNorms.map((norm, index) => (
                        <div key={index} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            <p className="font-mono text-sm text-amber-300">{norm.code}</p>
                            <p className="mt-1 text-sm text-slate-300 italic">«{norm.text}»</p>
                        </div>
                    ))}
                </div>
            </div>

            {renderSection(
                "Рекомендуемые меры устранения", 
                <p>{result.remediationMeasures}</p>,
                result.remediationMeasures
            )}
        </>
      )}

      <div className="pt-6 border-t border-slate-700">
        <button
          onClick={handleDownloadPdf}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 bg-sky-400 hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Скачать PDF-отчёт
        </button>
      </div>
    </div>
  );
};
