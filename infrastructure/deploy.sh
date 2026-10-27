#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-staging}"
REGION="${2:-us-east-1}"
STACK_NAME="automask-serverless-${ENVIRONMENT}"

echo "========================================================================"
echo "🚀 AutoMask WhatsApp Automation SaaS - AWS Deployment Pipeline"
echo "   Environment: ${ENVIRONMENT}"
echo "   Region:      ${REGION}"
echo "   Stack:       ${STACK_NAME}"
echo "========================================================================"

# 1. AWS Authentication Verification
echo -e "\n[Step 1/6] Verifying AWS Caller Identity..."
aws sts get-caller-identity

# 2. Automated Test Suite Execution
echo -e "\n[Step 2/6] Executing Local Automated Master Test Suite (112 tests)..."
(cd server && npm run test:all)

# 3. Compile Backend and Frontend
echo -e "\n[Step 3/6] Building Backend & Frontend Assets..."
(cd server && npm run build)
(cd client && npm run build)

# 4. Deploy Serverless CloudFormation / SAM Stack
echo -e "\n[Step 4/6] Deploying AWS Serverless Stack via CloudFormation..."
aws cloudformation deploy \
  --template-file infrastructure/template.yaml \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --parameter-overrides Environment="${ENVIRONMENT}"

# 5. Retrieve Deployment Outputs
echo -e "\n[Step 5/6] Retrieving CloudFormation Stack Outputs..."
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs" \
  --output table

# 6. Database Migrations & Multi-Tenant RLS Verification
echo -e "\n[Step 6/6] Executing Database Migrations 001-008 & RLS Verification..."
(cd server && npm run verify:rds)

echo "========================================================================"
echo "🎉 AutoMask SaaS Deployment & Verification Completed Successfully!"
echo "========================================================================"
