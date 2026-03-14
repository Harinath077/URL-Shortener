import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight, Link2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  // Price calculations
  const orbitMonthly = 499;
  const orbitAnnual = 399;
  
  const apexMonthly = 1499;
  const apexAnnual = 1199;

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-slate-300 font-sans selection:bg-indigo-500/30">
      <Navbar />

      <main className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Background Gradients / Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-400 text-sm font-medium tracking-wide"
            >
              <Star size={14} className="fill-indigo-400" />
              <span>Antigravity Pricing</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-syne font-bold text-white mb-6 leading-tight tracking-tight"
            >
              Scaling links shouldn't <br className="hidden md:block" />
              defy your budget.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
            >
              Professional URL shortening and analytics for the Indian ecosystem. 
              <span className="text-indigo-300 font-medium"> Up to 40% cheaper than Bitly.</span>
            </motion.p>

            {/* Billing Toggle */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center flex-col items-center"
            >
              <div className="relative flex items-center bg-[#13131A] p-1 rounded-full border border-slate-800 shadow-inner">
                <button
                  onClick={() => setIsAnnual(false)}
                  style={{ appearance: 'none', WebkitAppearance: 'none', background: 'transparent', border: 'none' }}
                  className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    !isAnnual ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  style={{ appearance: 'none', WebkitAppearance: 'none', background: 'transparent', border: 'none' }}
                  className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    isAnnual ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Annually
                </button>

                {/* Animated pill background */}
                <motion.div
                  className="absolute top-1 bottom-1 w-1/2 bg-[#2A2A38] rounded-full border border-slate-700 pointer-events-none"
                  initial={false}
                  animate={{ left: isAnnual ? '50%' : '4px', width: isAnnual ? 'calc(50% - 4px)' : 'calc(50% - 4px)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>

              {/* Tooltip / Label */}
              <div className="mt-4 flex items-center justify-center">
                <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Save 20% by choosing Annual 
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1: Orbit */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="bg-[#13131A]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 lg:p-10 relative shadow-xl hover:border-slate-700 transition-colors"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-syne font-bold text-white mb-2">Orbit</h3>
                <p className="text-sm text-slate-400">For freelancers, creators & small teams</p>
              </div>
              
              <div className="mb-6 h-[80px]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-syne font-bold text-white">₹{isAnnual ? orbitAnnual : orbitMonthly}</span>
                  <span className="text-slate-500 font-medium">/month</span>
                </div>
                {isAnnual && <p className="text-sm text-green-400 font-medium mt-1">Billed at ₹{orbitAnnual * 12}/year</p>}
              </div>
              
              <button 
                style={{ appearance: 'none', WebkitAppearance: 'none', outline: 'none' }}
                className="w-full py-3.5 px-4 bg-[#2A2A38] hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-600 transition-colors mb-8 cursor-pointer"
              >
                Start with Orbit
              </button>
              
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4">What's included in Orbit</p>
                <ul className="space-y-3.5">
                  <Feature text="10,000 shortened links/month" />
                  <Feature text="1 custom short domain" />
                  <Feature text="Click & geography analytics" />
                  <Feature text="QR code generation with branding" />
                  <Feature text="Link expiry & password protection" />
                  <Feature text="Up to 3 team members" />
                  <Feature text="Email support" />
                </ul>
              </div>
            </motion.div>

            {/* Plan 2: Apex */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="bg-indigo-950/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 lg:p-10 relative shadow-2xl shadow-indigo-500/10 overflow-hidden"
            >
              {/* Popular Badge Container */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400" />
              <div className="absolute top-6 right-6">
                <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </span>
              </div>

              {/* Apex Glow Effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-syne font-bold text-white mb-2">Apex</h3>
                <p className="text-sm text-slate-400">For scaling businesses & agencies</p>
              </div>
              
              <div className="mb-6 h-[80px] relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-syne font-bold text-white">₹{isAnnual ? apexAnnual : apexMonthly}</span>
                  <span className="text-slate-500 font-medium">/month</span>
                </div>
                {isAnnual && <p className="text-sm text-indigo-300 font-medium mt-1">Billed at ₹{apexAnnual * 12}/year</p>}
              </div>
              
              <button 
                style={{ appearance: 'none', WebkitAppearance: 'none', outline: 'none' }}
                className="relative z-10 w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-semibold rounded-xl border border-indigo-500 transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                Go Apex 
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              
              <div className="space-y-4 relative z-10 mt-8">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">Everything in Orbit, plus:</p>
                <ul className="space-y-3.5">
                  <Feature text="Unlimited links/month" emphasized />
                  <Feature text="5 custom short domains" />
                  <Feature text="Advanced analytics (device, UTM, funnel)" />
                  <Feature text="Full REST API access & webhooks" />
                  <Feature text="Bulk link creation via CSV upload" />
                  <Feature text="Unlimited team members with role permissions" />
                  <Feature text="Priority chat support + dedicated account manager" />
                </ul>
              </div>
            </motion.div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

function Feature({ text, emphasized }) {
  return (
    <li className="flex items-start gap-3">
      <div className="bg-indigo-500/20 text-indigo-400 rounded-full p-1 mt-0.5 flex-shrink-0">
        <Check size={12} strokeWidth={3} />
      </div>
      <span className={`text-[15px] leading-snug ${emphasized ? 'text-white font-medium' : 'text-slate-300'}`}>
        {text}
      </span>
    </li>
  );
}
