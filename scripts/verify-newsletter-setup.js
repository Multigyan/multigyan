/**
 * Newsletter System Verification Script
 * Run this to verify your newsletter system is set up correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Newsletter System Setup...\n');

let hasErrors = false;

// Check 1: Environment variables
console.log('📝 Checking environment variables...');
const envPath = path.join(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'EMAIL_FROM_NAME',
    'NEWSLETTER_UNSUBSCRIBE_SECRET',
    'NEXT_PUBLIC_SITE_URL'
  ];

  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your`) && !envContent.includes(`${varName}=re_your`)) {
      console.log(`  ✅ ${varName} is set`);
    } else {
      console.log(`  ❌ ${varName} is missing or needs to be updated`);
      hasErrors = true;
    }
  });
} else {
  console.log('  ❌ .env.local file not found');
  hasErrors = true;
}

// Check 2: Models
console.log('\n📦 Checking models...');
const modelsToCheck = [
  '../models/Newsletter.js',
  '../models/NewsletterCampaign.js'
];

modelsToCheck.forEach(modelPath => {
  const fullPath = path.join(__dirname, modelPath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${path.basename(modelPath)} exists`);
  } else {
    console.log(`  ❌ ${path.basename(modelPath)} is missing`);
    hasErrors = true;
  }
});

// Check 3: Email library
console.log('\n📧 Checking email library...');
const emailLibPath = path.join(__dirname, '../lib/email.js');
if (fs.existsSync(emailLibPath)) {
  console.log('  ✅ Email library exists');
} else {
  console.log('  ❌ Email library is missing');
  hasErrors = true;
}

// Check 4: API routes
console.log('\n🔌 Checking API routes...');
const apiRoutes = [
  '../app/api/newsletter/subscribe/route.js',
  '../app/api/newsletter/unsubscribe/route.js',
  '../app/api/newsletter/confirm/route.js',
  '../app/api/admin/newsletter/campaigns/route.js',
  '../app/api/admin/newsletter/campaigns/[id]/route.js',
  '../app/api/admin/newsletter/campaigns/[id]/send/route.js'
];

apiRoutes.forEach(routePath => {
  const fullPath = path.join(__dirname, routePath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${routePath.replace('../app/api/', '')} exists`);
  } else {
    console.log(`  ❌ ${routePath.replace('../app/api/', '')} is missing`);
    hasErrors = true;
  }
});

// Check 5: Admin pages
console.log('\n🎨 Checking admin pages...');
const adminPages = [
  '../app/(dashboard)/dashboard/admin/newsletter/page.js',
  '../app/(dashboard)/dashboard/admin/newsletter/create/page.js'
];

adminPages.forEach(pagePath => {
  const fullPath = path.join(__dirname, pagePath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${path.basename(path.dirname(pagePath))} page exists`);
  } else {
    console.log(`  ❌ ${path.basename(path.dirname(pagePath))} page is missing`);
    hasErrors = true;
  }
});

// Check 6: Dependencies
console.log('\n📚 Checking dependencies...');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.dependencies.resend) {
    console.log('  ✅ resend package is installed');
  } else {
    console.log('  ❌ resend package is not installed');
    hasErrors = true;
  }
} else {
  console.log('  ❌ package.json not found');
  hasErrors = true;
}

// Final results
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup verification FAILED');
  console.log('\n📖 Please check NEWSLETTER_IMPLEMENTATION_GUIDE.md for setup instructions');
  console.log('\n🔧 Issues to fix:');
  console.log('   1. Update RESEND_API_KEY in .env.local');
  console.log('   2. Get your API key from: https://resend.com/api-keys');
} else {
  console.log('✅ Setup verification PASSED');
  console.log('\n🎉 Your newsletter system is ready!');
  console.log('\n📖 Next steps:');
  console.log('   1. Get your Resend API key from https://resend.com');
  console.log('   2. Update RESEND_API_KEY in .env.local');
  console.log('   3. Run: npm run dev');
  console.log('   4. Visit: http://localhost:3000/dashboard/admin/newsletter');
}
console.log('='.repeat(50) + '\n');

process.exit(hasErrors ? 1 : 0);
