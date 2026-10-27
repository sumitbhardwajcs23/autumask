import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Smartphone,
  Lock,
  X
} from 'lucide-react';
import { UsageQuota } from '../../types';
import { billingApi } from '../../services/api';

interface BillingViewProps {
  usage?: UsageQuota;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const BillingView: React.FC<BillingViewProps> = ({ usage }) => {
  const [currentPlanId, setCurrentPlanId] = useState('pro');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  
  // Razorpay Checkout Modal (Sandbox & Live)
  const [razorpayModalData, setRazorpayModalData] = useState<{
    orderId: string;
    amount: number;
    planId: string;
    planName: string;
    keyId: string;
  } | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '₹499',
      period: '/ month',
      description: 'Ideal for single tutors & boutique institutes.',
      features: [
        '2 Team members',
        '1,000 Workflow executions/mo',
        '300 AI grounded replies/mo',
        'Lead capture & tags',
        'Meta Cloud API connection',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '₹999',
      period: '/ month',
      description: 'Growing coaching centres with demo classes.',
      features: [
        '5 Team members',
        '3,000 Workflow executions/mo',
        '1,000 AI grounded replies/mo',
        'Demo slot booking engine',
        'WhatsApp reminders & broadcasts',
        'CSV Export',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Institute',
      price: '₹2,499',
      period: '/ month',
      popular: true,
      description: 'High-volume coaching institutes with multi-counsellor teams.',
      features: [
        '15 Team members (Multi-counsellor)',
        '10,000 Workflow executions/mo',
        '4,000 AI replies / 50k token pack',
        'Priority SLA & Instant Takeover',
        'Full Audit logs & Custom RAG Knowledge',
      ],
    },
  ];

  const handleSelectPlan = async (planId: string, planName: string, amount: number) => {
    setIsProcessing(planId);
    try {
      const res = await billingApi.createRazorpayOrder(planId);
      
      if (res.order) {
        // If real Razorpay script is loaded on window
        if (typeof window !== 'undefined' && window.Razorpay && !res.mockMode) {
          const options = {
            key: res.keyId,
            amount: res.order.amount,
            currency: 'INR',
            name: 'AutoMask WhatsApp SaaS',
            description: `Subscription: ${planName}`,
            order_id: res.order.id,
            handler: async (response: any) => {
              const verifyRes = await billingApi.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              });
              setCurrentPlanId(planId);
              setSuccessNotice(verifyRes.message || `Upgraded to ${planName} successfully!`);
              setTimeout(() => setSuccessNotice(null), 5000);
            },
            prefill: {
              name: 'Dr. Prakash',
              email: 'owner@prakashinstitute.edu.in',
              contact: '+919876543210',
            },
            theme: {
              color: '#059669', // AutoMask Emerald
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Open interactive test Razorpay modal with Instant UPI / QR
          setRazorpayModalData({
            orderId: res.order.id,
            amount: res.order.amount,
            planId,
            planName,
            keyId: res.keyId,
          });
        }
      }
    } catch (err: any) {
      alert(`Razorpay checkout initialization failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConfirmMockPayment = async () => {
    if (!razorpayModalData) return;
    setIsProcessing(razorpayModalData.planId);
    try {
      const paymentId = `pay_${Date.now()}`;
      const verifyRes = await billingApi.verifyRazorpayPayment({
        razorpay_order_id: razorpayModalData.orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'mock_signature_approved',
        planId: razorpayModalData.planId,
      });

      setCurrentPlanId(razorpayModalData.planId);
      setSuccessNotice(`🎉 Razorpay Payment Verified! Workspace upgraded to ${razorpayModalData.planName}. (ID: ${paymentId})`);
      setRazorpayModalData(null);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      alert(`Verification failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
            Subscription & Razorpay Billing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, predictable pricing designed for coaching institutes. Secured by Razorpay.
          </p>
        </div>

        {/* Razorpay Verified Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-2xl text-xs font-bold w-max">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Razorpay Verified Merchant • UPI & NetBanking Active</span>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Active Subscription</span>
          </div>
          <h2 className="text-2xl font-black font-['Outfit']">
            AutoMask Workspace — {plans.find(p => p.id === currentPlanId)?.name || 'Pro Plan'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            Renews on 15 Nov 2026 via Razorpay recurring billing. GST Invoice available for download.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs">
          <div className="font-bold text-emerald-100">Monthly AI Allowance</div>
          <div className="text-xl font-extrabold text-white font-['Outfit'] mt-0.5">
            32,450 / 50,000
          </div>
          <div className="text-[10px] text-emerald-200 mt-0.5">65% used • 17,550 remaining</div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = currentPlanId === p.id;
          const numPrice = p.id === 'starter' ? 499 : p.id === 'growth' ? 999 : 2499;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 font-extrabold text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-slate-800 font-['Outfit']">{p.name}</h3>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-3xl font-black text-slate-900 font-['Outfit']">{p.price}</span>
                  <span className="text-xs text-slate-400 font-medium">{p.period}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{p.description}</p>

                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <button
                  disabled={isCurrent || isProcessing === p.id}
                  onClick={() => handleSelectPlan(p.id, p.name, numPrice)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isProcessing === p.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isCurrent ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Current Active Plan</span>
                    </span>
                  ) : (
                    <span>Pay with Razorpay →</span>
                  )}
                </button>

                {!isCurrent && (
                  <span className="text-[10px] text-slate-400 text-center block">
                    Instant activation via UPI, QR, or Card
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Razorpay Gateway Trust Section */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
            <Lock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Bank-Grade 256-Bit Security by Razorpay</h4>
            <p className="text-[11px] text-slate-500">
              Payments are processed through PCI-DSS Level 1 compliant infrastructure. Supports UPI, RuPay, Visa, MasterCard, and NetBanking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-bold">
            ⚡ Instant UPI (GPay/PhonePe)
          </span>
          <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-bold">
            💳 Credit & Debit Cards
          </span>
          <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-bold">
            🏛️ 50+ NetBanking Banks
          </span>
          <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-bold">
            🧾 GST Tax Invoices
          </span>
        </div>
      </div>

      {/* RAZORPAY SANDBOX CHECKOUT MODAL */}
      {razorpayModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Razorpay Payment Gateway</h3>
                  <p className="text-[10px] text-slate-400">Order ID: {razorpayModalData.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => setRazorpayModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-1">
              <span className="text-xs text-emerald-800 font-medium">Payable Amount</span>
              <div className="text-2xl font-black text-emerald-700 font-['Outfit']">
                ₹{(razorpayModalData.amount / 100).toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">
                Upgrade to {razorpayModalData.planName}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Choose Payment Mode:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">UPI / QR</span>
                    <span className="text-[9px] text-slate-500">GPay, PhonePe, Paytm</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Cards</span>
                    <span className="text-[9px] text-slate-500">Visa, Master, RuPay</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-24 h-24 bg-white border border-slate-300 rounded-xl mx-auto flex items-center justify-center text-slate-400">
                <QrCode className="w-16 h-16 text-slate-700" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 block">
                UPI ID: automask.razorpay@icici
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRazorpayModalData(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMockPayment}
                disabled={isProcessing !== null}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing !== null && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simulate Successful Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
