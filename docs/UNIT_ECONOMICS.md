# AutoMask SaaS Unit Economics & Financial Viability Model

**Date:** 23 October 2026  
**Auditor / Modeler:** Senior Software Architect & Technical Product Owner  
**Currency:** Indian Rupees (INR, ₹) & USD ($ at ₹84/USD)  
**Status:** Calibrated Model with Fixed vs. Variable Cost Separation  

---

## 1. Executive Summary & Billing Architecture

A critical flaw in early SaaS unit economic models is assuming that the SaaS vendor can absorb WhatsApp Meta conversation fees within a low monthly subscription (e.g. ₹499/month). 

In India, Meta charges:
- **User-Initiated (Service) Conversation**: ~₹0.35 ($0.0040) per 24-hour window (first 1,000/month free per WABA).
- **Business-Initiated (Marketing) Conversation**: ~₹0.90 ($0.0107) per 24-hour window.
- **Utility Conversation**: ~₹0.12 ($0.0014) per 24-hour window.

If an institute sends 3,000 marketing messages and receives 1,000 student inquiries, Meta charges alone would exceed ₹3,000. **Absorbing Meta messaging fees on a ₹499 or ₹999 plan would result in severe negative gross margins.**

### The Core Architectural Safeguard: Direct Meta Billing
AutoMask implements the **Coexistence / Direct Meta Billing Model**:
1. The coaching institute connects their own WhatsApp Business Account (WABA) via Embedded Signup.
2. The institute registers their own credit card or payment method in Meta Business Manager.
3. **Meta bills the coaching institute directly for all conversation fees.**
4. AutoMask charges exclusively for the SaaS software platform, AI RAG inferencing, workflow engine, team inbox, and calendar booking infrastructure.

---

## 2. Shared Fixed Infrastructure Costs (Per Month)

Shared fixed costs remain constant regardless of the number of tenants up to the baseline cluster capacity (~200 active institutes).

| Infrastructure Component | Provider & Specification | Monthly Cost (USD) | Monthly Cost (INR @ ₹84) | Allocation per Tenant (at 50 Tenants) |
|---|---|:---:|:---:|:---:|
| **Application Server (ECS / VPS)** | AWS ECS Fargate (2 tasks: 2 vCPU, 4GB RAM) or Hetzner CPX41 | $48.00 | ₹4,032 | ₹80.64 |
| **Relational Database** | AWS RDS PostgreSQL 17 (db.t4g.small, Multi-AZ storage) | $58.00 | ₹4,872 | ₹97.44 |
| **In-Memory Cache & Queue** | AWS ElastiCache Redis 7 (cache.t4g.micro) | $16.00 | ₹1,344 | ₹26.88 |
| **Object Storage (Media/Backups)** | AWS S3 (Standard + Glacier Backups, ~100GB) | $3.50 | ₹294 | ₹5.88 |
| **Observability & Logging** | CloudWatch Logs + Grafana Cloud Free Tier | $10.00 | ₹840 | ₹16.80 |
| **Domain, SSL, Email (SES)** | Cloudflare + AWS SES (Transactional emails) | $5.00 | ₹420 | ₹8.40 |
| **Total Shared Fixed Overhead** | **Full Baseline Cluster** | **$140.50** | **₹11,802** | **₹236.04** |

*Note: At 100 active tenants, fixed overhead drops to ₹118/tenant/month; at 200 tenants, it drops to ₹59/tenant/month.*

---

## 3. Variable Costs per Tenant (Per Month)

### 3.1 AI LLM Inferencing (Gemini 1.5 Flash / Groq Llama 3)
- **Engine**: Gemini 1.5 Flash (or Groq LLaMA 3.3 70B via OpenRouter).
- **Cost**:
  - Input: $0.075 per 1M tokens (~₹6.30 / 1M tokens)
  - Output: $0.30 per 1M tokens (~₹25.20 / 1M tokens)
- **Token Profile per Student Inquiry**:
  - System prompt + RAG facts context: ~700 input tokens.
  - Student message: ~50 input tokens.
  - AI response: ~100 output tokens.
  - Cost per interaction: $(750 \times 0.000000075) + (100 \times 0.00000030) = \$0.00008625$ (~₹0.0072 per inquiry).

### 3.2 Payment Gateway Fees (Razorpay)
- **Fee**: 2.0% of subscription price + 18% GST on the fee = **2.36% effective deduction**.

### 3.3 Customer Support & Onboarding Allocation
- Estimated at ₹35/tenant/month (blended cost of documentation, automated bot onboarding, and occasional WhatsApp support).

---

## 4. Plan-by-Plan Unit Economics

### Plan 1: Starter Plan (₹499 / Month)
*Target: Small local tuition centers (1 branch, ~1,000 student inquiries/mo)*

| Revenue & Cost Items | Assumptions & Formula | Amount (INR) | % of Revenue |
|---|---|:---:|:---:|
| **Gross Monthly Subscription** | Net of GST (excl. 18% GST) | **₹499.00** | 100.0% |
| **Payment Gateway (Razorpay)** | 2.36% of ₹499 | -₹11.78 | 2.4% |
| **AI LLM Inferencing** | 600 AI inquiries avg (of 1,000 cap) @ ₹0.0072 | -₹4.32 | 0.9% |
| **Customer Support Allocation** | Shared Tier 1 support | -₹35.00 | 7.0% |
| **Total Direct Variable Costs** | Gateway + LLM + Support | **-₹51.10** | **10.2%** |
| **Gross Contribution Margin (Before Fixed)** | ₹499.00 - ₹51.10 | **₹447.90** | **89.8%** |
| **Allocated Fixed Overhead (at 50 Tenants)** | ₹11,802 / 50 | -₹236.04 | 47.3% |
| **Net Operating Profit (at 50 Tenants)** | ₹447.90 - ₹236.04 | **₹211.86** | **42.5%** |
| **Net Operating Profit (at 100 Tenants)** | Fixed drops to ₹118.02 | **₹329.88** | **66.1%** |

---

### Plan 2: Growth Plan (₹999 / Month)
*Target: Established institutes (1–3 branches, ~3,000 inquiries/mo, multi-counselor)*

| Revenue & Cost Items | Assumptions & Formula | Amount (INR) | % of Revenue |
|---|---|:---:|:---:|
| **Gross Monthly Subscription** | Net of GST (excl. 18% GST) | **₹999.00** | 100.0% |
| **Payment Gateway (Razorpay)** | 2.36% of ₹999 | -₹23.58 | 2.4% |
| **AI LLM Inferencing** | 1,800 AI inquiries avg (of 3,000 cap) @ ₹0.0072 | -₹12.96 | 1.3% |
| **Customer Support Allocation** | Shared Tier 1 & 2 support | -₹45.00 | 4.5% |
| **Total Direct Variable Costs** | Gateway + LLM + Support | **-₹81.54** | **8.2%** |
| **Gross Contribution Margin (Before Fixed)** | ₹999.00 - ₹81.54 | **₹917.46** | **91.8%** |
| **Allocated Fixed Overhead (at 50 Tenants)** | ₹11,802 / 50 | -₹236.04 | 23.6% |
| **Net Operating Profit (at 50 Tenants)** | ₹917.46 - ₹236.04 | **₹681.42** | **68.2%** |
| **Net Operating Profit (at 100 Tenants)** | Fixed drops to ₹118.02 | **₹799.44** | **80.0%** |

---

### Plan 3: Pro Plan (₹2,499 / Month)
*Target: Large coaching institutes & academies (multiple branches, 10,000 inquiries/mo)*

| Revenue & Cost Items | Assumptions & Formula | Amount (INR) | % of Revenue |
|---|---|:---:|:---:|
| **Gross Monthly Subscription** | Net of GST (excl. 18% GST) | **₹2,499.00** | 100.0% |
| **Payment Gateway (Razorpay)** | 2.36% of ₹2,499 | -₹58.98 | 2.4% |
| **AI LLM Inferencing** | 6,000 AI inquiries avg (of 10,000 cap) @ ₹0.0072 | -₹43.20 | 1.7% |
| **Customer Support Allocation** | Priority phone/WhatsApp support | -₹80.00 | 3.2% |
| **Total Direct Variable Costs** | Gateway + LLM + Support | **-₹182.18** | **7.3%** |
| **Gross Contribution Margin (Before Fixed)** | ₹2,499.00 - ₹182.18 | **₹2,316.82** | **92.7%** |
| **Allocated Fixed Overhead (at 50 Tenants)** | ₹11,802 / 50 | -₹236.04 | 9.4% |
| **Net Operating Profit (at 50 Tenants)** | ₹2,316.82 - ₹236.04 | **₹2,080.78** | **83.3%** |
| **Net Operating Profit (at 100 Tenants)** | Fixed drops to ₹118.02 | **₹2,198.80** | **88.0%** |

---

## 5. Breakeven Analysis & Tenant Growth Trajectory

### 5.1 Breakeven Tenant Count
Assuming an equal distribution of tenants across the 3 plans (Blended ARPU = ₹1,332 / month):
- Blended Contribution Margin = $\approx ₹1,227$ (92%).
- Monthly Fixed Overhead = ₹11,802.
$$\text{Breakeven Tenants} = \frac{₹11,802}{₹1,227} \approx 10 \text{ Paying Institutes}$$

*Just 10 active coaching institutes cover the entire multi-AZ cloud infrastructure.*

### 5.2 Profitability Matrix Across Tenant Scales

| Scale | Blended Monthly Revenue | Total Variable Costs | Fixed Cloud Overhead | Net Monthly Operating Profit | Operating Margin |
|---|:---:|:---:|:---:|:---:|:---:|
| **Pilot (10 Institutes)** | ₹13,320 | ₹1,050 | ₹11,802 | **+₹468** | 3.5% |
| **Early Stage (30 Institutes)** | ₹39,960 | ₹3,150 | ₹11,802 | **+₹25,008** | 62.6% |
| **Growth (50 Institutes)** | ₹66,600 | ₹5,250 | ₹11,802 | **+₹49,548** | 74.4% |
| **Scale (100 Institutes)** | ₹133,200 | ₹10,500 | ₹11,802 | **+₹110,898** | 83.3% |
| **Maturity (250 Institutes)** | ₹333,000 | ₹26,250 | ₹17,703* | **+₹289,047** | 86.8% |

*\*At 250 institutes, cloud infrastructure is upgraded 1.5x (larger RDS instance).*

---

## 6. Sensitivity Analysis & Critical Guardrails

1. **Guardrail against LLM Token Inflation**:
   - If an adversarial student spams thousands of complex inquiries, input prompt caching and a hard rate-limit of **15 AI replies per phone number per 24 hours** cap the maximum variable loss at $< ₹0.15$ per student.
2. **Meta Pricing Fluctuation Protection**:
   - Because Meta bills the client directly, changes in Meta's conversation pricing have **zero impact on AutoMask gross margins**.
3. **Razorpay Chargeback Protection**:
   - Monthly SaaS subscriptions are non-refundable for the current billing cycle, with automated cancellation at period end.
