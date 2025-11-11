import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This makes the environment variable available in the client-side code
    // It reads VITE_API_KEY from Vercel's environment and makes it accessible as process.env.API_KEY in the code.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  }
});
