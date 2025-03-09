// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">Story.ai</span>
        </div>
        <div className="flex gap-4">
          <Link href="/signin">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-slate-800">
              Sign In
            </Button>
          </Link>
          <Link href="/get-started">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto py-20 px-4 md:px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-sm font-medium mb-2">
            Discover the all new Story.ai
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Rewrite Your Story, <br />One Thought at a Time
          </h1>
          <p className="text-lg text-slate-300 max-w-xl">
            AI-powered therapy, journaling, and mindfulness to help you reshape your narrative and take charge of your mental well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Your Journey Today
            </Button>
            <Button size="lg" variant="outline" className="text-white border-slate-700">
              How it Works
            </Button>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="relative z-10 bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700">
            <img 
              src="/api/placeholder/600/400" 
              alt="Person evolving emotionally" 
              className="w-full h-auto rounded-xl"
            />
          </div>
          {/* Floating icons similar to Ganttify design */}
          <div className="absolute -top-8 -left-8 p-4 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div className="absolute top-1/2 -right-6 p-4 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
          </div>
          <div className="absolute -bottom-6 left-1/4 p-4 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          </div>
        </div>
      </section>

      {/* Why Story.ai? */}
      <section className="container mx-auto py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Story.ai?</h2>
          <p className="text-slate-300 text-lg">
            Traditional therapy can be expensive, inaccessible, or intimidating. Mental health tools often feel generic and lack personalized support.
          </p>
          <p className="text-slate-300 text-lg mt-4">
            Story.ai brings AI-driven therapy and structured self-help techniques to guide you through personal growth—anytime, anywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="p-3 rounded-lg bg-blue-900/30 text-blue-400">🧠</span>
                <h3 className="font-semibold text-xl">AI-Powered Therapy</h3>
              </div>
              <p className="text-slate-300">Advanced AI that adapts to your needs and provides personalized therapeutic insights.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="p-3 rounded-lg bg-green-900/30 text-green-400">📖</span>
                <h3 className="font-semibold text-xl">Guided Journaling</h3>
              </div>
              <p className="text-slate-300">Structured prompts that help you explore your thoughts and emotions effectively.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="p-3 rounded-lg bg-purple-900/30 text-purple-400">🌱</span>
                <h3 className="font-semibold text-xl">Mindfulness & Stress Relief</h3>
              </div>
              <p className="text-slate-300">Techniques and exercises to center yourself and reduce anxiety in the moment.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="p-3 rounded-lg bg-amber-900/30 text-amber-400">📊</span>
                <h3 className="font-semibold text-xl">Progress Tracking</h3>
              </div>
              <p className="text-slate-300">Visualize your growth and see how far you've come with detailed analytics.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="p-3 rounded-lg bg-pink-900/30 text-pink-400">💡</span>
                <h3 className="font-semibold text-xl">Personalized Insights</h3>
              </div>
              <p className="text-slate-300">Learn about your emotional patterns and receive tailored recommendations.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="p-3 rounded-lg bg-indigo-900/30 text-indigo-400">⏱️</span>
                <h3 className="font-semibold text-xl">Accessible Anytime</h3>
              </div>
              <p className="text-slate-300">Get support whenever you need it, without scheduling appointments or waiting lists.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Overview */}
      <section className="container mx-auto py-20 px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-16">Your AI-Powered Companion for Mental Wellness</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700 p-4">
            <img 
              src="/api/placeholder/500/400" 
              alt="App interface preview" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-blue-900/30 text-blue-400">🏠</span>
                <h3 className="font-semibold text-xl">Therapy Sessions</h3>
              </div>
              <p className="text-slate-300 pl-11">AI-driven therapy tailored to your journey, adapting to your needs and progress.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-green-900/30 text-green-400">✍️</span>
                <h3 className="font-semibold text-xl">Journaling & Expressive Writing</h3>
              </div>
              <p className="text-slate-300 pl-11">Guided prompts for self-reflection that help you process emotions and experiences.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-purple-900/30 text-purple-400">🧘</span>
                <h3 className="font-semibold text-xl">Mindfulness & Stress-Busters</h3>
              </div>
              <p className="text-slate-300 pl-11">Meditative exercises and quick techniques to find calmness in any situation.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-amber-900/30 text-amber-400">⏳</span>
                <h3 className="font-semibold text-xl">Routine Builder</h3>
              </div>
              <p className="text-slate-300 pl-11">Set up daily habits and reminders for consistent personal growth and well-being.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-pink-900/30 text-pink-400">📊</span>
                <h3 className="font-semibold text-xl">Progress Reports</h3>
              </div>
              <p className="text-slate-300 pl-11">Visualize your mental health improvements and track how far you've come.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Story.ai Adapts to You */}
      <section className="container mx-auto py-20 px-4 md:px-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-6">How Story.ai Adapts to You</h2>
          <p className="text-slate-300 text-lg">
            Our AI learns from every interaction to provide a more personalized experience over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-900/30 text-blue-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3 className="font-semibold text-xl mb-2">Personalized Learning</h3>
                <p className="text-slate-300">Every session builds on the last, ensuring a unique journey for each user.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-900/30 text-green-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </div>
                <h3 className="font-semibold text-xl mb-2">Smart AI Insights</h3>
                <p className="text-slate-300">Understand your emotional patterns and get personalized recommendations.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-purple-900/30 text-purple-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-4V4H6v16h12V10z"></path><path d="M14 4v6h4"></path></svg>
                </div>
                <h3 className="font-semibold text-xl mb-2">Seamless Integration</h3>
                <p className="text-slate-300">Access your progress, notes, and exercises from anywhere.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timeline / Progress UI (inspired by Ganttify) */}
      <section className="container mx-auto py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Track Your Journey</h2>
          <p className="text-slate-300 text-lg">
            Visualize your progress and see how your daily practices connect to your long-term wellness goals.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700 p-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-slate-400 text-sm">{day}</div>
                ))}
              </div>
              
              <div className="bg-slate-700/30 h-12 rounded-lg mb-4 relative">
                <div className="absolute top-0 left-0 h-full w-1/2 bg-blue-600/30 rounded-lg"></div>
                <div className="absolute top-0 left-[15%] h-full w-[35%] bg-blue-600 rounded-lg flex items-center justify-center text-sm">
                  Morning Journaling
                </div>
              </div>
              
              <div className="bg-slate-700/30 h-12 rounded-lg mb-4 relative">
                <div className="absolute top-0 left-[30%] h-full w-[40%] bg-green-600 rounded-lg flex items-center justify-center text-sm">
                  Mindfulness Session
                </div>
              </div>
              
              <div className="bg-slate-700/30 h-12 rounded-lg mb-4 relative">
                <div className="absolute top-0 left-[10%] h-full w-[25%] bg-purple-600 rounded-lg flex items-center justify-center text-sm">
                  Therapy Check-in
                </div>
                <div className="absolute top-0 left-[60%] h-full w-[25%] bg-purple-600 rounded-lg flex items-center justify-center text-sm">
                  Evening Reflection
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-12 border border-blue-800/50">
          <h2 className="text-3xl font-bold mb-4">Begin Your Wellness Journey Today</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are transforming their mental health with Story.ai's personalized approach to therapy and mindfulness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-white border-slate-600 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto py-12 px-4 md:px-6 border-t border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Story.ai</span>
          </div>
          <div className="text-slate-400 text-sm">
            © 2025 Story.ai. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-white">Terms</a>
            <a href="#" className="text-slate-400 hover:text-white">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}