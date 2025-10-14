import { useState } from 'react';
import { Phone, User, Lock } from 'lucide-react';
import { sendVerificationCode, registerUser } from '../services/authService';

interface RegisterPageProps {
  onSuccess: (userId: string) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onSuccess, onSwitchToLogin }: RegisterPageProps) {
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (phoneNumber.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    const result = await sendVerificationCode(phoneNumber);
    setLoading(false);

    if (result.success) {
      setStep('verification');
    } else {
      setError(result.error || 'Failed to send verification code');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    setLoading(true);
    const result = await registerUser(phoneNumber, name, fullCode);
    setLoading(false);

    if (result.user) {
      onSuccess(result.user.id);
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    const result = await sendVerificationCode(phoneNumber);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yaung Chi</h1>
          <p className="text-gray-600">AI Agriculture Assistant</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="09123456789"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">
                Enter Verification Code
              </h2>
              <p className="text-sm text-gray-600 text-center mb-6">
                We sent a 6-digit code to {phoneNumber}
              </p>

              <div className="flex gap-2 justify-center mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
