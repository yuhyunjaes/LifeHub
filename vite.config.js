import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),       // ✅ React 플러그인 추가
        tailwindcss(),
    ],
    server: {
        host: 'localhost', // IPv4 강제
        port: 5173,
    },
});
