
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, DollarSign, ExternalLink, Mic, Users, ShieldCheck, Zap, Server, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const costDrivers = [
  {
    title: "OpenAI (GPT Models)",
    description: "Premium AI for complex analysis and reasoning. High quality but expensive at ~$0.03 per 1K tokens.",
    icon: BrainCircuit,
    pricingUrl: "https://openai.com/pricing",
    dashboardUrl: "https://platform.openai.com/usage",
    color: "from-blue-500 to-sky-500",
    costLevel: "High",
  },
  {
    title: "Open Source Alternatives",
    description: "Cost-effective models like Llama 3, Mistral for routine tasks. 10-50x cheaper than OpenAI.",
    icon: Server,
    pricingUrl: "https://groq.com/pricing",
    dashboardUrl: "https://console.groq.com",
    color: "from-green-500 to-emerald-500",
    costLevel: "Low",
  },
  {
    title: "Voice Features (Optional)",
    description: "Text-to-speech and speech-to-text. Can be disabled to reduce costs by 60-80%.",
    icon: Mic,
    pricingUrl: "https://elevenlabs.io/pricing",
    dashboardUrl: "https://elevenlabs.io/subscription",
    color: "from-purple-500 to-violet-500",
    costLevel: "Very High",
  }
];

const costComparison = [
  {
    scenario: "Text-Only AI (No Voice)",
    features: "Email drafting, deal analysis, summaries",
    openaiCost: "~$8-25/user/month",
    opensourceCost: "~$1-3/user/month",
    savings: "70-85% savings"
  },
  {
    scenario: "Hybrid Approach",
    features: "Open source for routine, OpenAI for complex",
    openaiCost: "~$8-25/user/month", 
    opensourceCost: "~$3-8/user/month",
    savings: "50-70% savings"
  },
  {
    scenario: "Voice + Premium AI",
    features: "Full voice chat, premium reasoning",
    openaiCost: "~$35-105/user/month",
    opensourceCost: "Not applicable",
    savings: "Consider if truly needed"
  }
];

export default function CostMonitoring() {
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <DollarSign className="w-10 h-10 text-white" />
            </div>
          <h1 className="text-4xl font-bold text-slate-800">AI Cost Monitoring & Optimization</h1>
          <p className="mt-4 text-lg text-slate-600">
            Understand costs and explore more cost-effective alternatives for your AI features.
          </p>
        </div>

        {/* Cost Optimization Alert */}
        <Card className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Zap className="w-5 h-5" />
              Cost Optimization Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              <strong>Voice features account for 60-80% of AI costs.</strong> If voice chat is not essential for your users, 
              consider disabling it to dramatically reduce expenses while keeping core business features.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                Configure AI Settings
              </Button>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                View Open Source Options
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {costDrivers.map((driver) => (
            <Card key={driver.title} className="shadow-xl border-0 transform hover:-translate-y-1 transition-transform duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${driver.color}`}>
                    <driver.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-800">{driver.title}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      driver.costLevel === 'Very High' ? 'bg-red-100 text-red-700' :
                      driver.costLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {driver.costLevel} Cost
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">{driver.description}</p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <a href={driver.pricingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> View Pricing
                    </a>
                  </Button>
                  <Button asChild className="flex-1 bg-slate-800 hover:bg-slate-900">
                    <a href={driver.dashboardUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> Dashboard
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cost Comparison Table */}
        <Card className="mb-8 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Cost Comparison by Approach
            </CardTitle>
            <CardDescription>
              Compare different AI strategies and their estimated monthly costs per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Approach</th>
                    <th className="text-left p-4 font-semibold">Features Included</th>
                    <th className="text-left p-4 font-semibold">Premium AI Cost</th>
                    <th className="text-left p-4 font-semibold">Optimized Cost</th>
                    <th className="text-left p-4 font-semibold">Potential Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {costComparison.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-medium">{item.scenario}</td>
                      <td className="p-4 text-slate-600">{item.features}</td>
                      <td className="p-4 text-red-600 font-medium">{item.openaiCost}</td>
                      <td className="p-4 text-green-600 font-medium">{item.opensourceCost}</td>
                      <td className="p-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          {item.savings}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>
              Steps to optimize your AI costs while maintaining core functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">1. Evaluate Voice Feature Usage</h4>
              <p className="text-green-700 text-sm mb-3">
                Check if users actively use voice chat or if it's just a novelty. Voice features typically cost 3-5x more than text-only AI.
              </p>
              <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                Review Voice Analytics
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">2. Consider Open Source Models</h4>
              <p className="text-blue-700 text-sm mb-3">
                For routine tasks like email drafting and summaries, open source models can provide 70-85% cost savings with similar quality.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                  Explore Groq
                </Button>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                  Try Llama 3
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">3. Implement Usage Limits</h4>
              <p className="text-amber-700 text-sm mb-3">
                Set monthly AI credit limits per user tier to control costs and encourage efficient usage.
              </p>
              <Link to={createPageUrl('ModuleManagement')}>
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700">
                  Configure Limits
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
