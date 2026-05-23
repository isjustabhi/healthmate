import Link from 'next/link';
import { Activity, Brain, ClipboardList, HeartPulse, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Health<span className="text-brand-green">Mate</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How It Works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-outline text-sm">Login</Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            HealthMate — Your AI{' '}
            <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
              Health Assistant
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Track your wellness, check symptoms with AI-powered insights, and get personalized
            health recommendations — all in one beautiful dashboard.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="btn-primary w-full sm:w-auto">Get Started Free</Link>
            <Link href="/login" className="btn-secondary w-full sm:w-auto">Sign In</Link>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Everything you need for better health</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Powered by Google Gemini AI and built for the ML Empowerment Build Challenge.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { icon: ClipboardList, title: 'Symptom Checker', desc: 'Describe symptoms and get AI wellness recommendations with severity assessment.', color: 'bg-blue-100 text-brand-blue' },
              { icon: Activity, title: 'Health Tracking', desc: 'Log weight, sleep, exercise, and mood. Visualize trends over 30 days.', color: 'bg-green-100 text-brand-green' },
              { icon: Brain, title: 'AI Insights', desc: 'Personalized wellness insights based on your health metrics and patterns.', color: 'bg-purple-100 text-purple-600' },
            ].map((f) => (
              <div key={f.title} className="card text-center transition hover:shadow-md">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">How it works</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Create your account', desc: 'Sign up in seconds and secure your personal health dashboard.' },
              { step: '2', title: 'Track & check symptoms', desc: 'Log daily metrics and use the AI symptom checker anytime.' },
              { step: '3', title: 'Get AI insights', desc: 'Receive personalized recommendations and wellness trends.' },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-lg font-bold text-white">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-brand-blue to-brand-green p-12 text-center text-white">
          <Shield className="mx-auto mb-4 h-12 w-12" />
          <h2 className="text-2xl font-bold sm:text-3xl">Start your wellness journey today</h2>
          <p className="mt-4 opacity-90">Join HealthMate and take control of your health with AI-powered tools.</p>
          <Link href="/signup" className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-brand-blue hover:bg-gray-100">
            Sign Up Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">HealthMate</p>
          <p className="mt-2">AI for Health — ML Empowerment Build Challenge</p>
          <p className="mt-4">© {new Date().getFullYear()} HealthMate. Not a substitute for professional medical advice.</p>
        </div>
      </footer>
    </div>
  );
}
