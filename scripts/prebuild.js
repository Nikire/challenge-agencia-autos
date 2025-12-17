const { execSync } = require('child_process');

const skipLint = process.env.SKIP_LINT === 'true';

if (skipLint) {
  console.log('SKIP_LINT=true, skipping lint and format checks');
  process.exit(0);
}

console.log('Running ESLint check...');
try {
  execSync('npm run lint:check', { stdio: 'inherit' });
} catch {
  console.error('ESLint check failed');
  process.exit(1);
}

console.log('Running Prettier check...');
try {
  execSync('npm run format:check', { stdio: 'inherit' });
} catch {
  console.error('Prettier check failed');
  process.exit(1);
}

console.log('All checks passed!');
