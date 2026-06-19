import { spawn } from 'child_process';
import process from 'process';

console.log("Starting supervisor with strict rejection and uncaught tracing...");
const server = spawn('node', [
  '--unhandled-rejections=strict',
  '--trace-uncaught',
  'server.js'
], {
  cwd: 'C:/Users/lenovo/Desktop/HRMS/backend',
  env: process.env
});

server.stdout.on('data', (data) => {
  console.log(`[SERVER STDOUT] ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER STDERR] ${data.toString().trim()}`);
});

server.on('error', (err) => {
  console.error('[SERVER SPAWN ERROR]', err);
});

server.on('exit', (code, signal) => {
  console.log(`[SERVER EXIT] Exit Code: ${code}, Signal: ${signal}`);
});

server.on('close', (code, signal) => {
  console.log(`[SERVER CLOSE] Exit Code: ${code}, Signal: ${signal}`);
});

// Keep supervisor alive
setInterval(() => {}, 1000);
