const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('========================================================================');
console.log('📦 AutoMask AWS Lambda Deployment Packaging Utility');
console.log('========================================================================');

const serverDir = path.resolve(__dirname, '../server');
const distDir = path.join(serverDir, 'dist');
const zipFile = path.join(distDir, 'lambda.zip');

try {
  // 1. Build TypeScript
  console.log('1. Compiling TypeScript backend...');
  execSync('npm run build', { cwd: serverDir, stdio: 'inherit' });

  // 2. Verify lambda.js exists
  const lambdaHandlerPath = path.join(distDir, 'lambda.js');
  if (!fs.existsSync(lambdaHandlerPath)) {
    throw new Error(`dist/lambda.js not found at: ${lambdaHandlerPath}`);
  }
  console.log('✅ Lambda handler verified at dist/lambda.js');

  // 3. Create deployment zip using native PowerShell on Windows
  console.log('2. Creating lambda.zip archive...');
  const powershellCmd = `Compress-Archive -Path "${distDir}\\*", "${serverDir}\\node_modules" -DestinationPath "${zipFile}" -Force`;
  
  // Note: For lean production deployments, omit devDependencies
  console.log(`Executing: ${powershellCmd}`);
  execSync(`powershell -Command "${powershellCmd}"`, { stdio: 'inherit' });

  const stats = fs.statSync(zipFile);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Lambda deployment package created: ${zipFile} (${sizeMb} MB)`);
  console.log('========================================================================');
} catch (err) {
  console.error('❌ Failed to package Lambda:', err.message);
  process.exit(1);
}
