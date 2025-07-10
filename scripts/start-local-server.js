const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting LTOC Platform on http://localhost:3000\n');

const projectDir = path.join(__dirname, 'functional-platform');
process.chdir(projectDir);

const server = exec('PORT=3000 npx next dev', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
});

server.stdout.on('data', (data) => {
  console.log(data);
});

server.stderr.on('data', (data) => {
  console.error(data);
});

console.log('Server is starting...');
console.log('Once ready, open http://localhost:3000 in your browser');
console.log('Press Ctrl+C to stop the server\n');