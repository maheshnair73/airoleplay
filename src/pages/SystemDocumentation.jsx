import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen, Brain, TrendingUp, Zap, Code, Shield, Layers, Workflow, Presentation
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import TrainingGuideContent from '../../TRAINING_SYSTEM_GUIDE.md?raw';
import TrainingSummaryContent from '../../TRAINING_SYSTEM_SUMMARY.md?raw';
import IntegrationPlatformContent from '../../INTEGRATION_PLATFORM_GUIDE.md?raw';
import IntegrationSetupContent from '../../INTEGRATION_SETUP.md?raw';
import AITriggersContent from '../../AI_TRIGGERS_EXPLAINED.md?raw';
import OAuthFlowContent from '../../OAUTH_FLOW.md?raw';
import EvaluationFrameworksContent from '../../EVALUATION_FRAMEWORKS.md?raw';
import ProductDemoContent from '../../PRODUCT_DEMO_FEATURE.md?raw';
import AccessingIntegrationsContent from '../../ACCESSING_INTEGRATIONS.md?raw';

const DOCS = {
  training_guide: {
    title: 'Training System Complete Guide',
    icon: Brain,
    category: 'Training',
    content: TrainingGuideContent
  },
  training_summary: {
    title: 'Training System Summary',
    icon: TrendingUp,
    category: 'Training',
    content: TrainingSummaryContent
  },
  integration_platform: {
    title: 'Integration Platform Guide',
    icon: Zap,
    category: 'Integrations',
    content: IntegrationPlatformContent
  },
  integration_setup: {
    title: 'Integration Setup Instructions',
    icon: Code,
    category: 'Integrations',
    content: IntegrationSetupContent
  },
  ai_triggers: {
    title: 'AI Triggers Explained',
    icon: Brain,
    category: 'Integrations',
    content: AITriggersContent
  },
  oauth_flow: {
    title: 'OAuth Flow Documentation',
    icon: Shield,
    category: 'Integrations',
    content: OAuthFlowContent
  },
  evaluation_frameworks: {
    title: 'Evaluation Frameworks',
    icon: Layers,
    category: 'AI Analysis',
    content: EvaluationFrameworksContent
  },
  product_demo: {
    title: 'Product Demo Feature',
    icon: Presentation,
    category: 'Features',
    content: ProductDemoContent
  },
  accessing_integrations: {
    title: 'Accessing Integrations',
    icon: Workflow,
    category: 'Integrations',
    content: AccessingIntegrationsContent
  }
};

export default function SystemDocumentation() {
  const [selectedDoc, setSelectedDoc] = useState('training_guide');

  const categories = [...new Set(Object.values(DOCS).map(doc => doc.category))];
  const currentDoc = DOCS[selectedDoc];
  const Icon = currentDoc.icon;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
      <div className="w-80 border-r border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Documentation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            System guides and documentation
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-6">
            {categories.map(category => {
              const categoryDocs = Object.entries(DOCS).filter(
                ([_, doc]) => doc.category === category
              );

              return (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {categoryDocs.map(([key, doc]) => {
                      const DocIcon = doc.icon;
                      const isActive = selectedDoc === key;

                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedDoc(key)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <DocIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-sm flex-1 line-clamp-2">{doc.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-600">
            <p className="font-medium text-slate-900 mb-1">Need help?</p>
            <p>Contact your system administrator</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-slate-900">{currentDoc.title}</h2>
              </div>
              <Badge className="bg-blue-100 text-blue-800">{currentDoc.category}</Badge>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-slate-900 mb-4 mt-8 first:mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-slate-900 mb-3 mt-6" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-slate-900 mb-2 mt-4" {...props} />,
                      p: ({ node, ...props }) => <p className="text-slate-700 mb-4 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-700" {...props} />,
                      li: ({ node, ...props }) => <li className="text-slate-700 leading-relaxed" {...props} />,
                      code: ({ node, inline, ...props}) =>
                        inline ? (
                          <code className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                        ) : (
                          <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />
                        ),
                      pre: ({ node, ...props }) => <pre className="mb-4" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 my-4" {...props} />
                      ),
                    }}
                  >
                    {currentDoc.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
