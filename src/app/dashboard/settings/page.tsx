"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, Shield, Lock, Eye, EyeOff, Check, Loader2, 
  AlertCircle, ChevronRight, User, Globe, Bell, QrCode,
  Copy, Download
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const CURRENCIES = [
  { code: 'USDC', name: 'US Dollar', symbol: '$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'XLM', name: 'Stellar Lumens', symbol: 'XLM' },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [pinStep, setPinStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  
  const currentPinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newPinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [demoAmount, setDemoAmount] = useState("500");
  const [demoMerchant, setDemoMerchant] = useState("Demo Store");
  const [demoUpiId, setDemoUpiId] = useState("demostore@upi");
  
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');
  const [currencyLoading, setCurrencyLoading] = useState(false);

  useEffect(() => {
    fetch("/api/expo/profile")
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setSelectedCurrency(data.preferred_currency || 'USDC');
        setLoading(false);
        if (!data.app_pin) setPinStep('new');
      });
  }, []);

  const handleCurrencyChange = async (currency: string) => {
    setSelectedCurrency(currency);
    setCurrencyLoading(true);
    try {
      const res = await fetch('/api/expo/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_currency: currency }),
      });
      if (res.ok) {
        setProfile({ ...profile, preferred_currency: currency });
        toast.success(`Currency changed to ${currency}`);
      } else {
        toast.error('Failed to update currency');
      }
    } catch {
      toast.error('Failed to update currency');
    } finally {
      setCurrencyLoading(false);
    }
  };

  const handlePinInput = (
    index: number, 
    value: string, 
    pinArray: string[], 
    setPinArray: (arr: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (!/^\d*$/.test(value)) return;
    const newArr = [...pinArray];
    newArr[index] = value.slice(-1);
    setPinArray(newArr);
    if (value && index < 3) refs.current[index + 1]?.focus();
  };

  const handlePinKeyDown = (
    index: number, 
    e: React.KeyboardEvent,
    pinArray: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === 'Backspace' && !pinArray[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePinReset = async () => {
    setPinError('');
    
    if (pinStep === 'current' && profile?.app_pin) {
      if (currentPin.some(d => d === '')) {
        setPinError('Please enter your current PIN');
        return;
      }
      setPinStep('new');
      setTimeout(() => newPinRefs.current[0]?.focus(), 100);
      return;
    }

    if (pinStep === 'new') {
      if (newPin.some(d => d === '')) {
        setPinError('Please enter a new PIN');
        return;
      }
      setPinStep('confirm');
      setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
      return;
    }

    if (pinStep === 'confirm') {
      if (confirmPin.some(d => d === '')) {
        setPinError('Please confirm your PIN');
        return;
      }
      if (newPin.join('') !== confirmPin.join('')) {
        setPinError('PINs do not match');
        setConfirmPin(['', '', '', '']);
        setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
        return;
      }

      setPinLoading(true);
      try {
        const res = await fetch('/api/expo/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_pin: profile?.app_pin ? currentPin.join('') : undefined,
            new_pin: newPin.join(''),
          }),
        });
        const data = await res.json();
        if (data.error) {
          setPinError(data.error);
          if (data.error.includes('Current PIN')) {
            setPinStep('current');
            setCurrentPin(['', '', '', '']);
          }
        } else {
          toast.success('PIN updated successfully');
          setActiveSection(null);
          setCurrentPin(['', '', '', '']);
          setNewPin(['', '', '', '']);
          setConfirmPin(['', '', '', '']);
          setPinStep(profile?.app_pin ? 'current' : 'new');
          setProfile({ ...profile, app_pin: newPin.join('') });
        }
      } catch {
        setPinError('Failed to update PIN');
      } finally {
        setPinLoading(false);
      }
    }
  };

  const generateDemoQR = () => {
    return `upi://pay?pa=${demoUpiId}&pn=${encodeURIComponent(demoMerchant)}&am=${demoAmount}&cu=INR`;
  };

  const copyDemoQR = () => {
    navigator.clipboard.writeText(generateDemoQR());
    toast.success('UPI link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C694F9]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">SETTINGS</h1>
        <p className="text-zinc-500">Manage your account and security</p>
      </div>

      <div className="space-y-4">
        <motion.div 
          className="glass-card rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => setActiveSection(activeSection === 'pin' ? null : 'pin')}
            className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C694F9]/20 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#C694F9]" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">{profile?.app_pin ? 'Change PIN' : 'Set PIN'}</p>
                <p className="text-zinc-500 text-sm">Secure your transactions</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform ${activeSection === 'pin' ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {activeSection === 'pin' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-6 border-t border-white/5">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-zinc-400">
                      {pinStep === 'current' && 'Enter your current PIN'}
                      {pinStep === 'new' && 'Enter a new 4-digit PIN'}
                      {pinStep === 'confirm' && 'Confirm your new PIN'}
                    </p>
                  </div>

                  <div className="flex justify-center gap-3">
                    {pinStep === 'current' && [0, 1, 2, 3].map((i) => (
                      <input
                        key={`current-${i}`}
                        ref={(el) => { currentPinRefs.current[i] = el; }}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={currentPin[i]}
                        onChange={(e) => handlePinInput(i, e.target.value, currentPin, setCurrentPin, currentPinRefs)}
                        onKeyDown={(e) => handlePinKeyDown(i, e, currentPin, currentPinRefs)}
                        className="w-14 h-14 text-center text-2xl font-black bg-white/5 border-2 border-white/10 rounded-xl focus:border-[#C694F9] focus:outline-none"
                      />
                    ))}
                    {pinStep === 'new' && [0, 1, 2, 3].map((i) => (
                      <input
                        key={`new-${i}`}
                        ref={(el) => { newPinRefs.current[i] = el; }}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={newPin[i]}
                        onChange={(e) => handlePinInput(i, e.target.value, newPin, setNewPin, newPinRefs)}
                        onKeyDown={(e) => handlePinKeyDown(i, e, newPin, newPinRefs)}
                        className="w-14 h-14 text-center text-2xl font-black bg-white/5 border-2 border-white/10 rounded-xl focus:border-[#C694F9] focus:outline-none"
                      />
                    ))}
                    {pinStep === 'confirm' && [0, 1, 2, 3].map((i) => (
                      <input
                        key={`confirm-${i}`}
                        ref={(el) => { confirmPinRefs.current[i] = el; }}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={confirmPin[i]}
                        onChange={(e) => handlePinInput(i, e.target.value, confirmPin, setConfirmPin, confirmPinRefs)}
                        onKeyDown={(e) => handlePinKeyDown(i, e, confirmPin, confirmPinRefs)}
                        className="w-14 h-14 text-center text-2xl font-black bg-white/5 border-2 border-white/10 rounded-xl focus:border-[#C694F9] focus:outline-none"
                      />
                    ))}
                  </div>

                  {pinError && (
                    <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {pinError}
                    </p>
                  )}

                  <Button
                    onClick={handlePinReset}
                    disabled={pinLoading}
                    className="w-full h-14 bg-[#C694F9] hover:bg-[#C694F9]/90 text-black font-black rounded-xl"
                  >
                    {pinLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      pinStep === 'confirm' ? 'SAVE PIN' : 'CONTINUE'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="glass-card rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setActiveSection(activeSection === 'demo' ? null : 'demo')}
            className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Demo UPI QR Generator</p>
                <p className="text-zinc-500 text-sm">Test merchant payments</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform ${activeSection === 'demo' ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {activeSection === 'demo' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-6 border-t border-white/5">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 text-xs">
                    <p className="font-bold mb-1">Demo Mode</p>
                    <p className="text-amber-500/70">This QR is for testing the merchant payment flow. No real money is involved.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Merchant Name</label>
                      <Input
                        value={demoMerchant}
                        onChange={(e) => setDemoMerchant(e.target.value)}
                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                        placeholder="Demo Store"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">UPI ID</label>
                      <Input
                        value={demoUpiId}
                        onChange={(e) => setDemoUpiId(e.target.value)}
                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                        placeholder="merchant@upi"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount (INR)</label>
                      <Input
                        type="number"
                        value={demoAmount}
                        onChange={(e) => setDemoAmount(e.target.value)}
                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                        placeholder="500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-2xl">
                      <QRCodeSVG 
                        value={generateDemoQR()} 
                        size={180}
                        level="H"
                      />
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="font-black text-lg">{demoMerchant}</p>
                    <p className="text-zinc-500 text-sm">{demoUpiId}</p>
                    <p className="text-2xl font-black text-green-500">₹{parseFloat(demoAmount || '0').toLocaleString('en-IN')}</p>
                  </div>

                  <Button
                    onClick={copyDemoQR}
                    variant="outline"
                    className="w-full h-12 border-white/10 rounded-xl font-bold gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy UPI Link
                  </Button>

                  <p className="text-[10px] text-zinc-600 text-center">
                    Scan this QR from the "Pay Merchant (UPI)" or "Scan & Pay" screen
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
            className="glass-card rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setActiveSection(activeSection === 'currency' ? null : 'currency')}
              className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Preferred Currency</p>
                  <p className="text-zinc-500 text-sm">Select your display currency</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-[#C694F9]">{selectedCurrency}</span>
                <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform ${activeSection === 'currency' ? 'rotate-90' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {activeSection === 'currency' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 space-y-4 border-t border-white/5">
                    <p className="text-sm text-zinc-400">Choose your preferred currency for transactions</p>
                    <div className="space-y-2">
                      {CURRENCIES.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => handleCurrencyChange(currency.code)}
                          disabled={currencyLoading}
                          className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                            selectedCurrency === currency.code 
                              ? 'bg-[#C694F9]/20 border-2 border-[#C694F9]' 
                              : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-black text-lg">
                              {currency.symbol}
                            </span>
                            <div className="text-left">
                              <p className="font-bold">{currency.code}</p>
                              <p className="text-xs text-zinc-500">{currency.name}</p>
                            </div>
                          </div>
                          {selectedCurrency === currency.code && (
                            <Check className="w-5 h-5 text-[#C694F9]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="glass-card rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Profile</p>
                <p className="text-zinc-500 text-sm">{profile?.full_name || 'Not set'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Currency</p>
                <p className="font-bold">{profile?.preferred_currency || 'USDC'}</p>
              </div>
            </div>
          </motion.div>
      </div>
    </div>
  );
}
