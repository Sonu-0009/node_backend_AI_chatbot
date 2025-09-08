// Simple smoke test script that starts the server and pings /health
import '../src/server.js';
import http from 'http';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  await wait(1500);
  http.get('http://localhost:' + (process.env.PORT || 8000) + '/health', (res) => {
    console.log('Health status code:', res.statusCode);
    process.exit(0);
  }).on('error', (err) => {
    console.error('Health check failed', err);
    process.exit(1);
  });
})();



