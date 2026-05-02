// Stop all ZenReading services
const http = require('http');

// Stop launcher (port 2999)
const stopLauncher = () => {
  http.get('http://localhost:2999/api/stop', () => {});
  setTimeout(() => process.exit(0), 1000);
};

// First stop the app server via launcher, then kill all
stopLauncher();
