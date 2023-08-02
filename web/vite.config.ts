import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
    //  超过 200 kb 就压缩
    plugins: [react(), viteCompression({ threshold: 200_000 })],
});
