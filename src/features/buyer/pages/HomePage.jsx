import { Link } from 'react-router-dom';
import { MapPin, ChefHat, Clock, Star, ArrowRight } from 'lucide-react';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import useAuth from '../../../hooks/useAuth.js';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero min-h-[85vh] flex items-center">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6 animate-fade-in">
                <MapPin className="w-4 h-4" />
                Hyperlocal Home-Cooked Food
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold text-surface-900 leading-tight mb-6 animate-slide-up">
                Craving{' '}
                <span className="text-gradient">homemade</span>
                <br />
                food?
              </h1>

              <p className="text-xl text-surface-600 mb-8 leading-relaxed max-w-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Discover nearby home kitchens on the map. Fresh, authentic,
                home-cooked meals delivered to your doorstep.
              </p>

              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {isAuthenticated ? (
                  <Link to="/explore">
                    <Button size="xl">
                      Explore Kitchens
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button size="xl">
                        Get Started
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="xl" variant="outline">
                        Log in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-800 mb-3">
              Why choose <span className="text-gradient">Rajabhoj</span>?
            </h2>
            <p className="text-surface-500 max-w-md mx-auto">
              We connect you directly with home kitchens in your neighborhood.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Map-First Discovery',
                description:
                  'Browse kitchens on an interactive map. See who\'s cooking near you in real-time.',
                color: 'bg-primary-50 text-primary-500',
              },
              {
                icon: ChefHat,
                title: 'Authentic Home Food',
                description:
                  'Every kitchen is a verified home cook. Real recipes, real flavors, real love.',
                color: 'bg-green-50 text-green-500',
              },
              {
                icon: Clock,
                title: 'Fresh & Limited',
                description:
                  'Meals are made in limited quantities daily. What you see is what\'s available — no stale food.',
                color: 'bg-blue-50 text-blue-500',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group p-8 rounded-2xl border border-surface-100 hover:border-surface-200 hover:shadow-card transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-surface-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to taste the difference?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of food lovers discovering authentic home-cooked meals every day.
          </p>
          {!isAuthenticated && (
            <Link to="/signup">
              <Button
                size="xl"
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-surface-50"
              >
                Join Rajabhoj Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Rajabhoj</span>
            </div>
            <p className="text-sm text-surface-500">
              © {new Date().getFullYear()} Rajabhoj. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </PageShell>
  );
}
