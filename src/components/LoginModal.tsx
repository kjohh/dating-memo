import { useState } from 'react';
import { FaEnvelope, FaTimes, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { signInWithEmail, supabase } from '@/utils/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.includes('@')) {
      setError('請輸入有效的電子郵件地址');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signInWithEmail(email);
      
      if (error) {
        throw error;
      }
      
      // 成功發送驗證碼，進入下一步
      setStep('otp');
    } catch (err: any) {
      setError(err.message || '發送驗證碼時出錯，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!otp || otp.length < 6) {
      setError('請輸入有效的驗證碼');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (error) {
        throw error;
      }
      
      // 驗證成功
      setStep('success');
      // 短暫顯示成功訊息後關閉模態框
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || '驗證碼無效，請重新輸入');
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md p-6 mx-4 rounded-lg bg-gray-900 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {step === 'form' ? '登入/註冊' : 
             step === 'otp' ? '輸入驗證碼' : 
             '登入成功'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {step === 'form' ? (
          <>
            <p className="text-gray-400 mb-6">
              使用電子郵件登入，無需密碼！我們將發送一個驗證碼到您的郵箱。
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">
                  電子郵件
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    正在發送...
                  </>
                ) : (
                  '發送驗證碼'
                )}
              </button>
            </form>
            
            <p className="mt-6 text-sm text-center text-gray-500">
              無需密碼！我們將發送一個驗證碼到您的郵箱，輸入即可登入。
            </p>
          </>
        ) : step === 'otp' ? (
          <>
            <div className="mb-4">
              <button 
                onClick={() => setStep('form')}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <FaArrowLeft className="mr-1" /> 返回
              </button>
            </div>
            
            <p className="text-gray-400 mb-6">
              我們已發送驗證碼到：<span className="font-bold text-white">{email}</span>
            </p>
            
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium mb-1 text-gray-300">
                  驗證碼
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg tracking-wider"
                  placeholder="請輸入6位驗證碼"
                  disabled={isVerifying}
                  maxLength={6}
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  請檢查您的收件箱（包括垃圾郵件夾）
                </p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
              >
                {isVerifying ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    正在驗證...
                  </>
                ) : (
                  '驗證並登入'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6 mx-auto w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
              <FaEnvelope size={24} />
            </div>
            <p className="text-gray-300 mb-4">
              登入成功！
            </p>
            <p className="text-gray-400">
              正在將您重定向到應用...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal; 