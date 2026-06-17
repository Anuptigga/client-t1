import { ChefHat } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-50">
      <div className="relative">
        {/* Animated pulsing ring */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary-200 animate-pulse-soft" />

        {/* Logo */}
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg animate-pulse-soft">
          <ChefHat className="w-10 h-10 text-white" />
        </div>
      </div>

      <h2 className="mt-6 text-xl font-bold text-gradient">Rajabhoj</h2>
      <p className="mt-2 text-sm text-surface-400">Loading deliciousness...</p>

      {/* Loading bar */}
      <div className="mt-6 w-48 h-1 bg-surface-200 rounded-full overflow-hidden">
        <div className="h-full w-1/2 gradient-primary rounded-full animate-[slide-loading_1.5s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes slide-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
