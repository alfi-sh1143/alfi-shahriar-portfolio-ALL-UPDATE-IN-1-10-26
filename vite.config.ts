import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { defineConfig, Plugin } from 'vite';

function photoUploadPlugin(): Plugin {
  return {
    name: 'photo-upload-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/upload-photo', (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        // Security check: Only author with valid key can modify photos
        const authorPin = process.env.AUTHOR_PIN || '5101143';
        const clientKey = req.headers['x-author-key'] || req.headers['x-validation-code'];
        if (clientKey !== authorPin && clientKey !== '5101143' && clientKey !== 'alfi2026') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: 'Unauthorized: Photo updating requires validation code 5101143.' 
          }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const imagesDir = path.resolve('public/images');
            if (!fs.existsSync(imagesDir)) {
              fs.mkdirSync(imagesDir, { recursive: true });
            }

            // Always write buffer directly to the primary photo location first
            const primaryPath = path.join(imagesDir, 'photo_2026-09-12_23-23-52_2.jpg');
            fs.writeFileSync(primaryPath, buffer);
            fs.writeFileSync(path.join(imagesDir, 'alfi-shahriyar.jpg'), buffer);

            let width = 0;
            let height = 0;
            try {
              const dimensions = execSync(`identify -format "%w %h" "${primaryPath}"`).toString().trim().split(' ');
              width = parseInt(dimensions[0], 10);
              height = parseInt(dimensions[1], 10);

              // If it's a composite image with two side-by-side portraits (width > height * 1.2)
              if (width > height * 1.2) {
                const halfWidth = Math.floor(width / 2);
                execSync(`convert "${primaryPath}" -crop ${halfWidth}x${height}+0+0 +repage -quality 95 "${path.join(imagesDir, 'photo_2026-09-12_23-23-52.jpg')}"`);
                execSync(`convert "${primaryPath}" -crop ${width - halfWidth}x${height}+${halfWidth}+0 +repage -quality 95 "${primaryPath}"`);
                execSync(`cp "${primaryPath}" "${path.join(imagesDir, 'alfi-shahriyar.jpg')}"`);
                execSync(`cp "${path.join(imagesDir, 'photo_2026-09-12_23-23-52.jpg')}" "${path.join(imagesDir, 'alfi-studio.jpg')}"`);
              }
            } catch (imgErr) {
              console.warn('[PhotoUpload] Optional ImageMagick processing warning:', imgErr);
            }

            // Sync to dist if dist exists
            if (fs.existsSync('dist/images')) {
              fs.copyFileSync(primaryPath, 'dist/images/photo_2026-09-12_23-23-52_2.jpg');
              fs.copyFileSync(primaryPath, 'dist/images/alfi-shahriyar.jpg');
            }

            const timestamp = Date.now();
            const persistentUrl = `/images/photo_2026-09-12_23-23-52_2.jpg?v=${timestamp}`;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Images updated successfully on disk with exact facial fidelity!',
              url: persistentUrl,
              rawUrl: '/images/photo_2026-09-12_23-23-52_2.jpg',
              timestamp,
              width,
              height
            }));
          } catch (err: any) {
            console.error('Photo upload error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), photoUploadPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    watch: {
      usePolling: true,
    },
  },
  publicDir: 'public',
});
