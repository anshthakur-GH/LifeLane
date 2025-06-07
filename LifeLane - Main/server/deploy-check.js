import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Deployment Environment Check ===');

// Check Node.js version
console.log('\nNode.js Version:', process.version);

// Check environment variables
console.log('\nEnvironment Variables:');
const requiredEnvVars = [
  'MYSQL_HOST',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'MYSQL_DATABASE',
  'MYSQL_PORT',
  'JWT_SECRET',
  'PORT',
  'NODE_ENV'
];

requiredEnvVars.forEach(varName => {
  console.log(`${varName}: ${process.env[varName] ? '✓ Set' : '✗ Missing'}`);
});

// Check directory structure
console.log('\nDirectory Structure:');
const requiredDirs = [
  '../dist',
  './data'
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  console.log(`${dir}: ${fs.existsSync(fullPath) ? '✓ Exists' : '✗ Missing'}`);
});

// Check for dist/index.html
const distIndexPath = path.join(__dirname, '../dist/index.html');
console.log('\nFrontend Build:');
console.log(`dist/index.html: ${fs.existsSync(distIndexPath) ? '✓ Exists' : '✗ Missing'}`);

console.log('\n=== Check Complete ==='); 