
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { Loader } from './components/Loader';
import { analyzeDefect } from './services/geminiService';
import type { AnalysisReport, AnalysisRequest } from './types';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';

const App: React.FC = () => {
  const [analysisRequest, setAnalysisRequest] = useState<AnalysisRequest | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyse = useCallback(async (request: AnalysisRequest) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisRequest(request);

    try {
      const result = await analyzeDefect(request);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAnalysisRequest(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-8">
            <ImageUploader 
              onAnalyse={handleAnalyse} 
              isLoading={isLoading} 
              onReset={handleReset}
              hasResult={!!analysisResult || !!error}
            />
          </div>
          <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden min-h-[300px] lg:min-h-[calc(100vh-10rem)] flex flex-col">
            <div className="p-4 bg-slate-700/50 border-b border-slate-600">
              <h2 className="text-xl font-bold text-sky-400">Результаты анализа</h2>
            </div>
            <div className="p-6 flex-grow flex items-center justify-center">
              {isLoading && <Loader />}
              {error && (
                <div className="text-center text-red-400">
                   <ExclamationTriangleIcon className="mx-auto h-12 w-12 mb-4" />
                  <p className="font-semibold">Ошибка анализа</p>
                  <p>{error}</p>
                </div>
              )}
              {!isLoading && !error && analysisResult && analysisRequest && (
                <AnalysisResult result={analysisResult} image={analysisRequest.imageUrl} />
              )}
              {!isLoading && !error && !analysisResult && (
                <div className="text-center text-slate-400">
                  <p>Загрузите фотографию дефекта и начните анализ.</p>
                  <p>Результаты появятся здесь.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-slate-400 text-sm border-t border-slate-800 mt-auto">
        По вопросам сотрудничества: {' '}
        <a 
          href="https://t.me/Espelinka" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sky-400 hover:underline"
        >
          @Espelinka
        </a>
      </footer>
    </div>
  );
};

export default App;
