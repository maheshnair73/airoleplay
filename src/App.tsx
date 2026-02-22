import { Users, Target, BarChart3, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 rounded-2xl p-4 shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            AI Sales Role Play Platform
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Practice and perfect your sales skills with AI-powered role-play scenarios
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="Realistic Scenarios"
            description="Engage with AI personas that simulate real customer interactions and objections"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-green-600" />}
            title="Targeted Practice"
            description="Focus on specific skills and scenarios to improve your sales technique"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-orange-600" />}
            title="Track Progress"
            description="Monitor your performance and identify areas for improvement"
          />
        </div>

        <div className="mt-16 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all transform hover:scale-105">
            Start Practicing Now
          </button>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default App;
