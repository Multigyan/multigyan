// File: scripts/check-deployment.js
// Purpose: Verify your app is ready for production deployment
// Usage: node scripts/check-deployment.js

const fs = require('fs');
const path = require('path');

console.log('🚀 MULTIGYAN DEPLOYMENT READINESS CHECKER\n');
console.log('=' .repeat(50) + '\n');

// Color codes for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Track results
let passedChecks = 0;
let totalChecks = 0;

function check(name, condition, successMsg, errorMsg, isWarning = false) {
  totalChecks++;
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${name}: ${successMsg}`);
    passedChecks++;
    return true;
  } else {
    if (isWarning) {
      console.log(`${colors.yellow}⚠${colors.reset} ${name}: ${errorMsg}`);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${name}: ${errorMsg}`);
    }
    return false;
  }
}

function checkFile(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch {
    return null;
  }
}

// ============================================
// 1. ESSENTIAL FILES
// ============================================
console.log(`${colors.blue}1. CHECKING ESSENTIAL FILES${colors.reset}\n`);

check(
  'package.json',
  checkFile('package.json'),
  'Found',
  'Missing package.json file!'
);

check(
  'next.config.mjs',
  checkFile('next.config.mjs'),
  'Found',
  'Missing next.config.mjs!'
);

check(
  'vercel.json',
  checkFile('vercel.json'),
  'Found',
  'Missing vercel.json (recommended)',
  true
);

check(
  '.gitignore',
  checkFile('.gitignore'),
  'Found',
  'Missing .gitignore!'
);

console.log('');

// ============================================
// 2. ENVIRONMENT VARIABLES
// ============================================
console.log(`${colors.blue}2. CHECKING ENVIRONMENT VARIABLES${colors.reset}\n`);

const envLocal = readFile('.env.local');

check(
  '.env.local',
  envLocal !== null,
  'Found',
  'Missing .env.local file!'
);

if (envLocal) {
  check(
    'MONGODB_URI',
    envLocal.includes('MONGODB_URI'),
    'Configured',
    'MONGODB_URI not found in .env.local'
  );

  check(
    'NEXTAUTH_SECRET',
    envLocal.includes('NEXTAUTH_SECRET'),
    'Configured',
    'NEXTAUTH_SECRET not found in .env.local'
  );

  check(
    'Cloudinary Config',
    envLocal.includes('CLOUDINARY_CLOUD_NAME') && 
    envLocal.includes('CLOUDINARY_API_KEY'),
    'Configured',
    'Cloudinary variables not found'
  );
}

// Check .gitignore includes .env.local
const gitignore = readFile('.gitignore');
check(
  '.env.local in .gitignore',
  gitignore && gitignore.includes('.env.local'),
  'Protected from Git',
  'WARNING: .env.local not in .gitignore! Your secrets might be exposed!',
  false
);

console.log('');

// ============================================
// 3. SEO FILES
// ============================================
console.log(`${colors.blue}3. CHECKING SEO FILES${colors.reset}\n`);

check(
  'sitemap.xml',
  checkFile('app/sitemap.xml') || checkFile('public/sitemap.xml'),
  'Found',
  'Missing sitemap.xml (important for SEO)',
  true
);

check(
  'robots.txt',
  checkFile('app/robots.txt') || checkFile('public/robots.txt'),
  'Found',
  'Missing robots.txt (important for SEO)',
  true
);

console.log('');

// ============================================
// 4. ADSENSE FILES
// ============================================
console.log(`${colors.blue}4. CHECKING GOOGLE ADSENSE FILES${colors.reset}\n`);

check(
  'ads.txt',
  checkFile('public/ads.txt'),
  'Found',
  'Missing ads.txt (required for AdSense)',
  true
);

const adsTxt = readFile('public/ads.txt');
if (adsTxt) {
  check(
    'ads.txt configured',
    adsTxt.includes('google.com') && adsTxt.includes('pub-'),
    'Contains Google AdSense configuration',
    'ads.txt exists but not configured with Publisher ID',
    true
  );
}

console.log('');

// ============================================
// 5. DEPENDENCIES
// ============================================
console.log(`${colors.blue}5. CHECKING DEPENDENCIES${colors.reset}\n`);

const packageJson = readFile('package.json');
if (packageJson) {
  const pkg = JSON.parse(packageJson);
  
  check(
    'Next.js version',
    pkg.dependencies.next,
    `Version: ${pkg.dependencies.next}`,
    'Next.js not found in dependencies'
  );

  check(
    'React version',
    pkg.dependencies.react,
    `Version: ${pkg.dependencies.react}`,
    'React not found in dependencies'
  );

  check(
    'Mongoose (Database)',
    pkg.dependencies.mongoose,
    'Configured for MongoDB',
    'Mongoose not found (database connection)',
    true
  );

  // Check for build script
  check(
    'Build script',
    pkg.scripts && pkg.scripts.build,
    'Configured',
    'No build script in package.json'
  );

  check(
    'Start script',
    pkg.scripts && pkg.scripts.start,
    'Configured',
    'No start script in package.json'
  );
}

console.log('');

// ============================================
// 6. STATIC ASSETS
// ============================================
console.log(`${colors.blue}6. CHECKING STATIC ASSETS${colors.reset}\n`);

check(
  'favicon.ico',
  checkFile('app/favicon.ico') || checkFile('public/favicon.ico'),
  'Found',
  'Missing favicon.ico (recommended)',
  true
);

check(
  'public directory',
  checkFile('public'),
  'Found',
  'Missing public directory'
);

console.log('');

// ============================================
// 7. SECURITY CHECKS
// ============================================
console.log(`${colors.blue}7. SECURITY CHECKS${colors.reset}\n`);

const nextConfig = readFile('next.config.mjs');
if (nextConfig) {
  check(
    'Console removal in production',
    nextConfig.includes('removeConsole'),
    'Enabled (reduces bundle size)',
    'Consider enabling removeConsole for production',
    true
  );

  check(
    'Security headers',
    nextConfig.includes('X-Frame-Options') || 
    nextConfig.includes('X-Content-Type-Options'),
    'Configured',
    'Consider adding security headers',
    true
  );

  check(
    'Image optimization',
    nextConfig.includes('images') && 
    nextConfig.includes('remotePatterns'),
    'Configured',
    'Image optimization not fully configured',
    true
  );
}

console.log('');

// ============================================
// FINAL SCORE
// ============================================
console.log('=' .repeat(50));
console.log(`\n${colors.blue}DEPLOYMENT READINESS SCORE${colors.reset}\n`);

const percentage = ((passedChecks / totalChecks) * 100).toFixed(0);

if (percentage >= 90) {
  console.log(`${colors.green}${passedChecks}/${totalChecks} checks passed (${percentage}%)${colors.reset}`);
  console.log(`${colors.green}✓ YOUR APP IS READY FOR DEPLOYMENT!${colors.reset}\n`);
} else if (percentage >= 70) {
  console.log(`${colors.yellow}${passedChecks}/${totalChecks} checks passed (${percentage}%)${colors.reset}`);
  console.log(`${colors.yellow}⚠ Your app is mostly ready, but fix the errors above${colors.reset}\n`);
} else {
  console.log(`${colors.red}${passedChecks}/${totalChecks} checks passed (${percentage}%)${colors.reset}`);
  console.log(`${colors.red}✗ CRITICAL ISSUES FOUND - Fix errors before deployment!${colors.reset}\n`);
}

// ============================================
// NEXT STEPS
// ============================================
console.log(`${colors.blue}NEXT STEPS:${colors.reset}\n`);

if (percentage < 100) {
  console.log('1. Fix all errors marked with ✗');
  console.log('2. Address warnings marked with ⚠');
}

console.log('3. Run: npm run build (test production build)');
console.log('4. Run: npm run start (test production server)');
console.log('5. Push code to GitHub');
console.log('6. Deploy to Vercel');
console.log('7. Configure environment variables on Vercel');
console.log('8. Connect your custom domain\n');

console.log('=' .repeat(50));
console.log(`\n${colors.blue}Good luck with your deployment! 🚀${colors.reset}\n`);
