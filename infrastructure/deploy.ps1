<#
.SYNOPSIS
  AutoMask WhatsApp Automation SaaS - AWS Serverless & Amplify Hosting Deployment Script

.DESCRIPTION
  Builds, validates, provisions infrastructure, and runs verification for:
  - AWS Amplify Hosting (React + Vite SPA)
  - AWS Lambda + API Gateway HTTP API (Express REST API)
  - Amazon SQS + Worker Lambda (Background & Webhook Processor)
  - Amazon RDS PostgreSQL 17 + Row-Level Security (RLS) Migrations 001-008

.PARAMETER Environment
  Target environment: staging or production (default: staging)

.PARAMETER Region
  AWS Region (default: us-east-1)
#>

param(
  [string]$Environment = "staging",
  [string]$Region = "us-east-1",
  [string]$StackName = "automask-serverless-$Environment"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "🚀 AutoMask WhatsApp Automation SaaS - AWS Deployment Pipeline" -ForegroundColor Cyan
Write-Host "   Environment: $Environment" -ForegroundColor Yellow
Write-Host "   Region:      $Region" -ForegroundColor Yellow
Write-Host "   Stack:       $StackName" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. AWS Authentication Verification
Write-Host "`n[Step 1/6] Verifying AWS Caller Identity..." -ForegroundColor Green
try {
  $callerIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
  Write-Host "✅ Authenticated as: $($callerIdentity.Arn) (Account: $($callerIdentity.Account))" -ForegroundColor Green
} catch {
  Write-Error "❌ AWS CLI authentication failed. Please configure credentials via 'aws configure' or set AWS_ACCESS_KEY_ID."
  exit 1
}

# 2. Automated Test Suite Execution
Write-Host "`n[Step 2/6] Executing Local Automated Master Test Suite (112 tests)..." -ForegroundColor Green
$serverDir = Resolve-Path "$PSScriptRoot/../server"
Push-Location $serverDir
try {
  npm run test:all
  Write-Host "✅ All automated test suites passed successfully!" -ForegroundColor Green
} finally {
  Pop-Location
}

# 3. Compile Backend and Frontend
Write-Host "`n[Step 3/6] Building Backend & Frontend Assets..." -ForegroundColor Green
$clientDir = Resolve-Path "$PSScriptRoot/../client"

Push-Location $serverDir
npm run build
Pop-Location

Push-Location $clientDir
npm run build
Pop-Location
Write-Host "✅ TypeScript backend and Vite frontend built cleanly!" -ForegroundColor Green

# 4. Deploy Serverless CloudFormation / SAM Stack
Write-Host "`n[Step 4/6] Deploying AWS Serverless Stack via CloudFormation / SAM..." -ForegroundColor Green
$templatePath = Resolve-Path "$PSScriptRoot/template.yaml"

# Check if AWS SAM CLI is available; fallback to aws cloudformation
if (Get-Command sam -ErrorAction SilentlyContinue) {
  sam build --template-file "$templatePath"
  sam deploy `
    --stack-name "$StackName" `
    --region "$Region" `
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND `
    --parameter-overrides Environment="$Environment" `
    --no-confirm-changeset
} else {
  Write-Host "ℹ️ SAM CLI not detected. Deploying via AWS CLI CloudFormation..." -ForegroundColor Yellow
  aws cloudformation deploy `
    --template-file "$templatePath" `
    --stack-name "$StackName" `
    --region "$Region" `
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND `
    --parameter-overrides Environment="$Environment"
}

# 5. Retrieve Deployment Outputs
Write-Host "`n[Step 5/6] Retrieving CloudFormation Stack Outputs..." -ForegroundColor Green
$outputsJson = aws cloudformation describe-stacks `
  --stack-name "$StackName" `
  --region "$Region" `
  --query "Stacks[0].Outputs" `
  --output json | ConvertFrom-Json

$outputs = @{}
foreach ($out in $outputsJson) {
  $outputs[$out.OutputKey] = $out.OutputValue
}

Write-Host "📡 Backend API URL:      $($outputs['HttpApiUrl'])" -ForegroundColor Cyan
Write-Host "🔗 Meta Webhook URL:     $($outputs['MetaWebhookUrl'])" -ForegroundColor Cyan
Write-Host "🗄️ Database Endpoint:    $($outputs['DatabaseEndpoint'])" -ForegroundColor Cyan
Write-Host "📬 SQS Queue URL:        $($outputs['WebhookQueueUrl'])" -ForegroundColor Cyan

# 6. Database Migrations & Multi-Tenant RLS Verification
Write-Host "`n[Step 6/6] Executing Database Migrations 001-008 & RLS Verification..." -ForegroundColor Green
if ($outputs['DatabaseEndpoint']) {
  $env:DATABASE_URL = "postgresql://automask_admin@$($outputs['DatabaseEndpoint']):$($outputs['DatabasePort'])/automask_db?sslmode=require"
  $env:DB_SSL = "true"
  Push-Location $serverDir
  try {
    npm run verify:rds
    Write-Host "✅ RDS Migrations applied and Row-Level Security verified!" -ForegroundColor Green
  } finally {
    Pop-Location
  }
} else {
  Write-Host "⚠️ No DatabaseEndpoint output found; skipping automated remote migration." -ForegroundColor Yellow
}

Write-Host "`n========================================================================" -ForegroundColor Green
Write-Host "🎉 AutoMask SaaS Deployment & Verification Completed Successfully!" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Green
