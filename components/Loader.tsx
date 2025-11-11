
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-400"></div>
      <p className="text-lg text-slate-300 animate-pulse">Идет анализ дефекта...</p>
      <p className="text-sm text-slate-400">Пожалуйста, подождите. Это может занять несколько секунд.</p>
    </div>
  );
};
