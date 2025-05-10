import { useState } from 'react';
import { FaEnvelope, FaTimes, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { signInWithEmail, supabase } from '@/utils/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'check_email'>('form');
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
      
      // 成功發送魔法連結，進入檢查郵箱步驟
      setStep('check_email');
    } catch (err: any) {
      setError(err.message || '發送登入連結時出錯，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md p-6 mx-4 rounded-lg bg-gray-900 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {step === 'form' ? '登入/註冊' : '檢查您的郵箱'}
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
              使用電子郵件登入，無需密碼！我們將發送一個登入連結到您的郵箱。
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
                className="w-full bg-primary hover:bg-primary-dark text-black py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    正在發送...
                  </>
                ) : (
                  '發送登入連結'
                )}
              </button>
            </form>
            
            <p className="mt-6 text-sm text-center text-gray-500">
              無需密碼！我們將發送一個登入連結到您的郵箱，點擊即可登入。
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6 mx-auto w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
              <FaEnvelope size={24} />
            </div>
            <p className="text-gray-300 mb-4">
              登入連結已發送！
            </p>
            <p className="text-gray-400 mb-6">
              我們已向 <span className="font-bold text-white">{email}</span> 發送了一封含有登入連結的郵件。
            </p>
            <p className="text-gray-400 mb-4">
              請前往您的郵箱，點擊郵件中的連結完成登入。
            </p>
            <p className="text-sm text-gray-500 mb-6">
              如果未收到郵件，請檢查垃圾郵件夾或者嘗試重新發送。
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                返回
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-primary hover:bg-primary-dark text-black py-2 px-4 rounded-lg transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal; 