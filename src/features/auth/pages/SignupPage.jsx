import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User, Phone, ChefHat, Truck, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import { useSignupMutation } from '../authApi.js';
import { setCredentials } from '../authSlice.js';

const roles = [
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Order home-cooked food',
    icon: ShoppingBag,
    color: 'bg-primary-50 text-primary-600 border-primary-200',
    activeColor: 'bg-primary-500 text-white border-primary-500',
  },
  {
    value: 'kitchen',
    label: 'Home Kitchen',
    description: 'Sell your homemade food',
    icon: ChefHat,
    color: 'bg-green-50 text-green-600 border-green-200',
    activeColor: 'bg-green-500 text-white border-green-500',
  },
  {
    value: 'delivery',
    label: 'Delivery Partner',
    description: 'Deliver orders & earn',
    icon: Truck,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    activeColor: 'bg-blue-500 text-white border-blue-500',
  },
];

export default function SignupPage() {
  const [step, setStep] = useState(1); // 1: role selection, 2: form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer',
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const selectRole = (role) => {
    setFormData({ ...formData, role });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      if (formData.phone && formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      const res = await signup(payload).unwrap();
      dispatch(setCredentials(res.data.user));
      toast.success('Account created! Welcome to Rajabhoj 🎉');
      navigate('/');
    } catch (err) {
      const message = err?.data?.message || err?.data?.errors?.[0]?.message || 'Signup failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/20 via-transparent to-primary-700/20" />
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 -left-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-primary-500/30">
            <ChefHat className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Join the Rajabhoj<br />
            community today.
          </h1>
          <p className="text-lg text-surface-300 max-w-md">
            Whether you cook, deliver, or love to eat — there's a place
            for you in our growing family of food lovers.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Home Kitchens', value: '500+' },
              { label: 'Happy Customers', value: '10K+' },
              { label: 'Cities', value: '5+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-primary-400">{stat.value}</p>
                <p className="text-sm text-surface-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Signup form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">Rajabhoj</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-800">Create your account</h2>
          <p className="text-surface-500 mt-1 mb-8">
            {step === 1 ? 'Choose how you want to use Rajabhoj' : 'Fill in your details to get started'}
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s
                    ? 'gradient-primary text-white shadow-sm'
                    : 'bg-surface-200 text-surface-400'
                }`}>
                  {s}
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                    step > s ? 'bg-primary-500' : 'bg-surface-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div className="space-y-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.value;
                return (
                  <button
                    key={role.value}
                    onClick={() => selectRole(role.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? `${role.activeColor} shadow-md`
                        : `${role.color} hover:shadow-sm`
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20' : 'bg-white'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{role.label}</p>
                      <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-surface-500'}`}>
                        {role.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              <Button
                onClick={() => setStep(2)}
                fullWidth
                size="lg"
                className="mt-6"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Details form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="signup-name"
                label="Full Name"
                name="name"
                placeholder="John Doe"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                autoComplete="name"
              />
              <Input
                id="signup-email"
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
                id="signup-phone"
                label="Phone (optional)"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <Input
                id="signup-password"
                label="Password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="flex-[2]"
                >
                  Create Account
                </Button>
              </div>
            </form>
          )}

          {/* Bottom link */}
          <p className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
