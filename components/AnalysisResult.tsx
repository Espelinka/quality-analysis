import React from 'react';
import type { AnalysisReport } from '../types';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';

interface AnalysisResultProps {
  result: AnalysisReport;
  image: string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, image }) => {
  const handleDownloadPdf = () => {
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Отчет об анализе дефекта</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 40px auto; 
            padding: 20px; 
          }
          @media print {
            body { 
              margin: 20px; 
              padding: 0; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          h1, h2, h3 { 
            color: #1e3a8a; 
            border-bottom: 2px solid #e0e0e0; 
            padding-bottom: 5px; 
            margin-top: 30px;
          }
          h1 { font-size: 2em; }
          h2 { font-size: 1.5em; }
          h3 { font-size: 1.2em; border-bottom: 1px solid #eee; }
          img { 
            max-width: 100%; 
            border-radius: 8px; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
            margin-top: 10px; 
          }
          .section { margin-bottom: 25px; }
          .norm-item { 
            background-color: #f0f9ff !important; 
            border: 1px solid #ddd; 
            border-left: 5px solid #0284c7; 
            padding: 15px; 
            margin-bottom: 10px; 
            border-radius: 4px; 
          }
          .norm-code { 
            font-weight: bold; 
            font-family: monospace; 
            color: #1e3a8a; 
          }
          .norm-text { font-style: italic; }
          .conclusion-negative { 
            color: #b91c1c; 
            font-weight: bold; 
            background-color: #fff1f2 !important;
            padding: 15px;
            border-left: 5px solid #b91c1c;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>Отчет об анализе строительного дефекта</h1>
        <div class="section">
          <p>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>
        <div class="section">
          <h2>Фотография дефекта</h2>
          <img src="${image}" alt="Фото дефекта">
        </div>
        
        ${!result.isIdentified ? `
        <div class="section">
            <h2>Заключение</h2>
            <p class="conclusion-negative">${result.defectDescription}</p>
        </div>
        ` : `
        <div class="section">
            <h2>Описание дефекта</h2>
            <p>${result.defectDescription}</p>
        </div>
        <div class="section">
            <h2>Возможные причины</h2>
            <p>${result.possibleCauses}</p>
        </div>
        <div class="section">
            <h2>Нарушенные нормы</h2>
            ${result.violatedNorms.length > 0 ? result.violatedNorms.map(norm => `
              <div class="norm-item">
                <p class="norm-code">${norm.code}</p>
                <p class="norm-text">«${norm.text}»</p>
              </div>
            `).join('') : '<p>Нарушенные нормы не определены.</p>'}
        </div>
        <div class="section">
            <h2>Рекомендуемые меры устранения</h2>
            <p>${result.remediationMeasures}</p>
        </div>
        `}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.onload = () => { // Wait for content to load, especially images
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } else {
      alert('Не удалось открыть окно для печати. Пожалуйста, разрешите всплывающие окна для этого сайта.');
    }
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
                    {result.violatedNorms.length > 0 && (
                        <button 
                            onClick={() => handleCopyToClipboard(result.violatedNorms.map(n => `${n.code}: ${n.text}`).join('\n'))}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-700 rounded-md transition-colors"
                            title="Копировать раздел"
                        >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <div className="space-y-3">
                    {result.violatedNorms.length > 0 ? (
                        result.violatedNorms.map((norm, index) => (
                            <div key={index} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                <p className="font-mono text-sm text-amber-300">{norm.code}</p>
                                <p className="mt-1 text-sm text-slate-300 italic">«{norm.text}»</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-sm">Нарушенные нормы не определены.</p>
                    )}
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