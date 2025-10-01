console.log('Starting server...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.method, req.url);
  
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(JSON.stringify({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  }));
});

server.listen(3001, () => {
  console.log('✓ Test server running on http://localhost:3001');
  console.log('✓ You can test it with: curl http://localhost:3001');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
