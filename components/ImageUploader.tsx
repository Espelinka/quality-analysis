import React, { useState, useCallback, useRef } from 'react';
import type { AnalysisRequest } from '../types';

interface ImageUploaderProps {
  onAnalyse: (request: AnalysisRequest) => void;
  isLoading: boolean;
  onReset: () => void;
  hasResult: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onAnalyse, isLoading, onReset, hasResult }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [refinement, setRefinement] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
      if (validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.heic')) {
        setError(null);
        setImageFile(file);
        const url = await fileToBase64(file);
        setImageUrl(url);
      } else {
        setError('Неподдерживаемый формат. Допустимы: JPG, PNG, WEBP, HEIC.');
        setImageFile(null);
        setImageUrl(null);
      }
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (imageFile && imageUrl) {
      onAnalyse({ imageFile, imageUrl, comment, refinement });
    } else {
      setError("Пожалуйста, выберите файл для анализа.");
    }
  };
  
  const handleLocalReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setComment('');
    setRefinement('');
    setError(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onReset();
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-slate-300 mb-2">
              Фотография дефекта
            </label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md cursor-pointer hover:border-sky-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Превью дефекта" className="mx-auto max-h-60 rounded-md object-contain" />
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-400">
                      <p className="pl-1">Нажмите для загрузки (JPG, PNG, WEBP, HEIC)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,.heic,.heif" onChange={handleFileChange} ref={fileInputRef}/>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-slate-300">
              Комментарий инженера (опционально)
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-slate-600 bg-slate-700 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white"
              placeholder="Например: 'Трещина в несущей стене, 2 этаж'"
            />
          </div>
          
          <div>
            <label htmlFor="refinement" className="block text-sm font-medium text-slate-300">
              Уточнить запрос (опционально)
            </label>
            <textarea
              id="refinement"
              name="refinement"
              rows={3}
              value={refinement}
              onChange={(e) => setRefinement(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-slate-600 bg-slate-700 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white"
              placeholder="Например: 'рассмотри только трещину на колонне слева'"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-8 flex gap-4">
          {hasResult ? (
            <button
                type="button"
                onClick={handleLocalReset}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
            >
                Новый анализ
            </button>
          ) : (
            <button
              type="submit"
              disabled={!imageFile || isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Анализ...' : 'Анализировать'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};