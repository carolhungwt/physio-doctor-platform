console.log('Step 1: Script started');

const http = require('http');
console.log('Step 2: HTTP module loaded');

const server = http.createServer((req, res) => {
  console.log('Step 3: Request received');
  res.end('OK');
});

console.log('Step 4: Server created');

server.listen(3001, '0.0.0.0', () => {
  console.log('Step 5: Server is listening on port 3001');
});

console.log('Step 6: Listen called');
