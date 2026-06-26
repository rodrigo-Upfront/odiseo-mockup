import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function seedPlugin() {
  return {
    name: 'vite-seed-plugin',
    configureServer(server) {
      return () => {
        server.middlewares.use('/__update-seed', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', () => {
            try {
              const { type, data } = JSON.parse(body);

              if (!type || !data || !Array.isArray(data)) {
                res.statusCode = 400;
                res.end('Invalid request body');
                return;
              }

              const seedDir = path.join(__dirname, 'src', 'shared', 'data', 'seeds');
              const filename = type === 'clients' ? 'clients.json' : 'users.json';
              const filepath = path.join(seedDir, filename);

              fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `${type} seed updated` }));
            } catch (error) {
              console.error('Error updating seed:', error);
              res.statusCode = 500;
              res.end('Internal Server Error');
            }
          });
        });
      };
    },
  };
}
