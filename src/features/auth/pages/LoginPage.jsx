import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, Phone, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import { useLoginMutation, useSendOtpMutation, useVerifyOtpMutation } from '../authApi.js';
import { setCredentials } from '../authSlice.js';

export default function LoginPage() {
  const [mode, setMode] = useState('email'); // 'email' | 'otp' | 'verify-otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otpCode: '',
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [sendOtp, { isLoading: otpSending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: otpVerifying }] = useVerifyOtpMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateEmail = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhone = () => {
    const newErrors = {};
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      const res = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      dispatch(setCredentials(res.data.user));
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validatePhone()) return;

    try {
      await sendOtp({ phone: formData.phone }).unwrap();
      toast.success('OTP sent to your phone');
      setMode('verify-otp');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otpCode) {
      setErrors({ otpCode: 'OTP is required' });
      return;
    }

    try {
      const res = await verifyOtp({
        phone: formData.phone,
        code: formData.otpCode,
      }).unwrap();

      dispatch(setCredentials(res.data.user));
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Home-cooked meals,<br />
            delivered with love.
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Discover authentic homemade food from nearby kitchens. 
            Fresh, hygienic, and made just for you.
          </p>

          {/* Floating food cards decoration */}
          <div className="mt-12 flex gap-4">
            {['🍛', '🥘', '🍲'].map((emoji, i) => (
              <div
                key={i}
                className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl border border-white/20"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">Rajabhoj</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-800">Welcome back</h2>
          <p className="text-surface-500 mt-1 mb-8">
            Log in to your account to continue
          </p>

          {/* Mode toggle */}
          <div className="flex bg-surface-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('email'); setErrors({}); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === 'email'
                  ? 'bg-white text-surface-800 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => { setMode('otp'); setErrors({}); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === 'otp' || mode === 'verify-otp'
                  ? 'bg-white text-surface-800 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              Phone OTP
            </button>
          </div>

          {/* Email login form */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <Input
                id="login-email"
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                id="login-password"
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={loginLoading}
              >
                Log in
              </Button>
            </form>
          )}

          {/* OTP send form */}
          {mode === 'otp' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <Input
                id="login-phone"
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={otpSending}
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* OTP verify form */}
          {mode === 'verify-otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <p className="text-sm text-surface-500 bg-surface-100 rounded-xl p-3">
                OTP sent to <span className="font-semibold text-surface-700">{formData.phone}</span>
                <button
                  type="button"
                  onClick={() => setMode('otp')}
                  className="ml-2 text-primary-500 hover:text-primary-600 font-medium"
                >
                  Change
                </button>
              </p>
              <Input
                id="login-otp"
                label="Enter OTP"
                name="otpCode"
                type="text"
                placeholder="000000"
                value={formData.otpCode}
                onChange={handleChange}
                error={errors.otpCode}
                maxLength={6}
                autoComplete="one-time-code"
              />
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={otpVerifying}
              >
                Verify & Login
              </Button>
            </form>
          )}

          {/* Bottom link */}
          <p className="mt-8 text-center text-sm text-surface-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
