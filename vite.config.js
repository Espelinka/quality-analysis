import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Эта конфигурация напрямую считывает переменную из среды сборки (например, из Vercel)
  // и делает ее доступной в клиентском коде как process.env.API_KEY.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
