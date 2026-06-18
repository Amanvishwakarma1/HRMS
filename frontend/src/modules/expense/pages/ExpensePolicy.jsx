import React from 'react';
import { ShieldAlert, BookOpen, Clock, BadgeCheck, Sparkles } from 'lucide-react';

function ExpensePolicy() {
  const policies = [
    {
      category: 'Travel & Accommodation',
      limit: '₹15,000 per trip',
      rules: [
        'Economy class air travel is allowed for trips exceeding 500 km.',
        'Pre-approval from immediate manager is required for lodging over ₹5,000/night.',
        'Cab rides must have start and end locations clearly marked on the receipt.'
      ]
    },
    {
      category: 'Food & Entertainment',
      limit: '₹5,005 per day limit',
      rules: [
        'Client business dinners are covered. Attendees names must be specified in the justification.',
        'Personal meals during business travel are capped at ₹1,500 per meal.',
        'Alcohol purchases are non-reimbursable under standard business expense policies.'
      ]
    },
    {
      category: 'Internet & Mobile Bills',
      limit: '₹2,000 per month limit',
      rules: [
        'Applies only to remote workers and on-call operations teams.',
        'A copy of the official itemized service bill must be attached.',
        'Prepaid mobile recharges must be justified with logs showing company-related usage.'
      ]
    },
    {
      category: 'Office Supplies & Miscellaneous',
      limit: '₹10,000 threshold limit',
      rules: [
        'Purchases of hardware/peripherals require IT approval prior to submitting expense.',
        'Receipts must bear the company VAT/GST registration number for credit processing.',
        'Ad-hoc expenses without category matching will route through special Admin reviews.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-500" /> Reimbursement Policy & Guidelines
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review official company policies, caps, receipt requirements, and claim approval chains.</p>
        </div>

        {/* Overview banner */}
        <div className="bg-sky-50/50 border border-sky-100 rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-5 items-start">
          <div className="p-3 bg-sky-100 rounded-2xl text-sky-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Quick Submission Compliance Checklist</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Before submitting any expense, ensure you have: (1) Attached a clear, high-resolution receipt (PDF or PNG/JPG), (2) Stated the correct cost center/project name, and (3) Documented the business rationale. Claims exceeding ₹10,000 will require Finance Verification and Manager Approvals.
            </p>
          </div>
        </div>

        {/* Policies grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {policies.map((p, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800">{p.category}</h3>
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg">
                  {p.limit}
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 font-semibold leading-relaxed">
                {p.rules.map((rule, rIdx) => (
                  <li key={rIdx} className="flex gap-2 items-start">
                    <BadgeCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Timelines and support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">Claim Processing Timelines</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Claims are reviewed by managers weekly. Finance approves verified claims on the 15th and 30th of each month. Payouts are credited directly to your registered salary account.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-800">Non-Compliance Policy</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Receipt tampering, duplicate uploads, or false justifications will lead to immediate rejection of the claim, automatic audit logging, and route to HR disciplinary action.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ExpensePolicy;