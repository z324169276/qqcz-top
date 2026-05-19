import { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

interface PinProtectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'verify' | 'setup' | 'change';
}

export function PinProtection({ isOpen, onClose, onSuccess, mode }: PinProtectionProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const setFamilyPin = useStore((state) => (state as any).setFamilyPin);

  const handleSubmit = () => {
    setError('');

    if (mode === 'setup') {
      if (pin.length !== 6) {
        setError('请输入6位PIN码');
        return;
      }
      if (step === 'enter') {
        setStep('confirm');
        return;
      }
      if (pin !== confirmPin) {
        setError('两次输入的PIN码不一致');
        return;
      }
      
      if (setFamilyPin) {
        setFamilyPin(pin);
      } else {
        localStorage.setItem('familyPin', pin);
      }
      toast.success('PIN码设置成功');
      onSuccess();
      onClose();
      return;
    }

    if (mode === 'verify') {
      const storedPin = localStorage.getItem('familyPin');
      if (pin === storedPin) {
        onSuccess();
        onClose();
      } else {
        setError('PIN码错误');
        setPin('');
      }
      return;
    }

    if (mode === 'change') {
      const storedPin = localStorage.getItem('familyPin');
      if (currentPin !== storedPin) {
        setError('当前PIN码错误');
        return;
      }
      if (pin.length !== 6) {
        setError('请输入6位新PIN码');
        return;
      }
      if (pin !== confirmPin) {
        setError('两次输入的PIN码不一致');
        return;
      }
      localStorage.setItem('familyPin', pin);
      toast.success('PIN码修改成功');
      onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90%] max-w-sm p-6 animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'setup' && '设置PIN码'}
            {mode === 'verify' && '输入PIN码'}
            {mode === 'change' && '修改PIN码'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {mode === 'setup' && '设置6位数字PIN码保护家长功能'}
            {mode === 'verify' && '请输入PIN码验证身份'}
            {mode === 'change' && '请先输入当前PIN码'}
          </p>
        </div>

        <div className="space-y-4">
          {mode === 'change' && step === 'enter' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                当前PIN码
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="******"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          {(mode !== 'change' || step === 'confirm') && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                {mode === 'change' ? '新PIN码' : 'PIN码'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="******"
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>
          )}

          {(mode === 'setup' || mode === 'change') && step === 'confirm' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                确认PIN码
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="******"
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setShowPin(!showPin)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPin ? '隐藏PIN码' : '显示PIN码'}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function usePinProtection() {
  const [showPinVerify, setShowPinVerify] = useState(false);
  const [pinCallback, setPinCallback] = useState<(() => void) | null>(null);

  const verifyPin = (callback: () => void) => {
    const hasPin = localStorage.getItem('familyPin');
    if (!hasPin) {
      callback();
      return;
    }
    setPinCallback(() => callback);
    setShowPinVerify(true);
  };

  const handlePinSuccess = () => {
    if (pinCallback) {
      pinCallback();
      setPinCallback(null);
    }
  };

  return {
    showPinVerify,
    setShowPinVerify,
    verifyPin,
    handlePinSuccess,
  };
}
