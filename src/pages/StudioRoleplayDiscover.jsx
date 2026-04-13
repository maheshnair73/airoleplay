import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Mic, Users, Video, Plus, Search, ChevronRight, User, Users2, Phone,
  Briefcase, ArrowRight
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const ROLEPLAY_TEMPLATES = [
  {
    id: 1,
    title: 'Cold Sales Call',
    description: 'Win over a skeptical prospect in an unexpected sales call',
    type: 'single',
    difficulty: 'intermediate',
    duration: '15-20 min',
    icon: Phone,
    scenarios: [
      { name: 'Priya Anand - CEO', personality: 'Assertive' },
      { name: 'Michael Chen - Director', personality: 'Reserved' },
      { name: 'Sarah Williams - Manager', personality: 'Analytical' }
    ]
  },
  {
    id: 2,
    title: 'Objection Handling',
    description: 'Handle tough objections and move the deal forward',
    type: 'single',
    difficulty: 'advanced',
    duration: '20-25 min',
    icon: Mic,
    scenarios: [
      { name: 'Budget Concerns', personality: 'Price sensitive' },
      { name: 'Timing Issues', personality: 'Time constrained' },
      { name: 'Competitor Questions', personality: 'Comparison focused' }
    ]
  },
  {
    id: 3,
    title: 'Executive Pitch',
    description: 'Present your solution to executive stakeholders',
    type: 'multi',
    difficulty: 'advanced',
    duration: '25-30 min',
    icon: Briefcase,
    scenarios: [
      { name: 'C-Suite Panel', personality: 'Executive level' },
      { name: 'Board Meeting', personality: 'Decision makers' },
      { name: 'Steering Committee', personality: 'Cross-functional' }
    ]
  },
  {
    id: 4,
    title: 'Product Demo',
    description: 'Showcase your product features effectively',
    type: 'single',
    difficulty: 'intermediate',
    duration: '15-20 min',
    icon: Video,
    scenarios: [
      { name: 'Feature-Focused', personality: 'Technical' },
      { name: 'Value-Focused', personality: 'Business oriented' },
      { name: 'Consultative Demo', personality: 'Discovery focused' }
    ]
  },
  {
    id: 5,
    title: 'Negotiation',
    description: 'Master contract and pricing negotiations',
    type: 'single',
    difficulty: 'advanced',
    duration: '20-25 min',
    icon: Mic,
    scenarios: [
      { name: 'Price Negotiation', personality: 'Cost conscious' },
      { name: 'Terms & Conditions', personality: 'Detail oriented' },
      { name: 'Multi-Year Deal', personality: 'Long-term focused' }
    ]
  },
  {
    id: 6,
    title: 'Discovery Call',
    description: 'Ask powerful discovery questions and uncover needs',
    type: 'single',
    difficulty: 'beginner',
    duration: '15-20 min',
    icon: Phone,
    scenarios: [
      { name: 'Initial Discovery', personality: 'Information seeking' },
      { name: 'Deep Dive', personality: 'Problem exploration' },
      { name: 'Challenger Approach', personality: 'Challenge assumptions' }
    ]
  }
];

export default function StudioRoleplayDiscover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedPartnerType, setSelectedPartnerType] = useState('ai');
  const [showQuickStart, setShowQuickStart] = useState(false);

  const filteredRoleplays = ROLEPLAY_TEMPLATES.filter(roleplay => {
    const matchesSearch = roleplay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleplay.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || roleplay.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleStartRoleplay = () => {
    if (selectedTemplate && selectedPartnerType === 'ai') {
      window.location.href = createPageUrl('AIRoleplay');
    } else if (selectedTemplate && selectedPartnerType === 'human') {
      window.location.href = createPageUrl('HumanRoleplay');
    } else if (selectedTemplate && selectedPartnerType === 'multi') {
      window.location.href = createPageUrl('MultiPartyRoleplay');
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Studio Roleplay</h1>
        <p className="text-muted-foreground mt-2 text-base">Choose your practice scenario and roleplay partner</p>
      </div>

      {/* Quick Start Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Start Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="p-4 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Mic className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Cold Call</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Practice opening & discovery</p>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Cold Call Practice</DialogTitle>
                  <DialogDescription>Choose your roleplay partner type</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <RadioGroup value={selectedPartnerType} onValueChange={setSelectedPartnerType}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="ai" id="ai-partner" />
                      <Label htmlFor="ai-partner" className="flex-1 cursor-pointer">
                        <div className="font-semibold">AI Partner</div>
                        <div className="text-sm text-muted-foreground">Instant practice with AI prospect</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="human" id="human-partner" />
                      <Label htmlFor="human-partner" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Human Partner</div>
                        <div className="text-sm text-muted-foreground">Practice with colleague or manager</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="multi" id="multi-partner" />
                      <Label htmlFor="multi-partner" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Multi-Stakeholder</div>
                        <div className="text-sm text-muted-foreground">Practice with multiple prospects</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <Button onClick={handleStartRoleplay} className="w-full">
                    Start Practice
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="p-4 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Product Demo</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Showcase your solution</p>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Product Demo</DialogTitle>
                  <DialogDescription>Choose your roleplay partner type</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <RadioGroup value={selectedPartnerType} onValueChange={setSelectedPartnerType}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="ai" id="demo-ai" />
                      <Label htmlFor="demo-ai" className="flex-1 cursor-pointer">
                        <div className="font-semibold">AI Prospect</div>
                        <div className="text-sm text-muted-foreground">AI-powered buyer persona</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="human" id="demo-human" />
                      <Label htmlFor="demo-human" className="flex-1 cursor-pointer">
                        <div className="font-semibold">With Team Member</div>
                        <div className="text-sm text-muted-foreground">Get real-time feedback</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <Button onClick={handleStartRoleplay} className="w-full">
                    Start Demo Practice
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="p-4 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Users2 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Executive Pitch</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Present to decision makers</p>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Executive Pitch</DialogTitle>
                  <DialogDescription>Choose your roleplay partner type</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <RadioGroup value={selectedPartnerType} onValueChange={setSelectedPartnerType}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="multi" id="exec-multi" />
                      <Label htmlFor="exec-multi" className="flex-1 cursor-pointer">
                        <div className="font-semibold">C-Suite Panel</div>
                        <div className="text-sm text-muted-foreground">AI-powered executive panel</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="human" id="exec-human" />
                      <Label htmlFor="exec-human" className="flex-1 cursor-pointer">
                        <div className="font-semibold">With Manager</div>
                        <div className="text-sm text-muted-foreground">Get executive feedback</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <Button onClick={handleStartRoleplay} className="w-full">
                    Start Pitch Practice
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search roleplays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
            <Button
              key={level}
              variant={selectedDifficulty === level ? 'default' : 'outline'}
              onClick={() => setSelectedDifficulty(level)}
              size="sm"
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Roleplay Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoleplays.map(roleplay => {
          const Icon = roleplay.icon;
          return (
            <Dialog key={roleplay.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-8 h-8 text-primary" />
                      <Badge variant="outline">{roleplay.difficulty}</Badge>
                    </div>
                    <CardTitle>{roleplay.title}</CardTitle>
                    <CardDescription>{roleplay.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{roleplay.duration}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{roleplay.title}</DialogTitle>
                  <DialogDescription>{roleplay.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Choose Your Scenario</h4>
                    <RadioGroup value={selectedScenario || ''} onValueChange={setSelectedScenario}>
                      {roleplay.scenarios.map((scenario, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted">
                          <RadioGroupItem value={scenario.name} id={`scenario-${idx}`} />
                          <Label htmlFor={`scenario-${idx}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{scenario.name}</div>
                            <div className="text-sm text-muted-foreground">{scenario.personality}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Choose Your Partner</h4>
                    <RadioGroup value={selectedPartnerType} onValueChange={setSelectedPartnerType}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="ai" id="partner-ai" />
                        <Label htmlFor="partner-ai" className="flex-1 cursor-pointer">
                          <div className="font-medium flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            AI Partner
                          </div>
                          <div className="text-sm text-muted-foreground">Practice instantly</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="human" id="partner-human" />
                        <Label htmlFor="partner-human" className="flex-1 cursor-pointer">
                          <div className="font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Human Partner
                          </div>
                          <div className="text-sm text-muted-foreground">Schedule with colleague</div>
                        </Label>
                      </div>
                      {roleplay.type === 'multi' && (
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="multi" id="partner-multi" />
                          <Label htmlFor="partner-multi" className="flex-1 cursor-pointer">
                            <div className="font-medium flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Multi-Stakeholder
                            </div>
                            <div className="text-sm text-muted-foreground">Practice with panel</div>
                          </Label>
                        </div>
                      )}
                    </RadioGroup>
                  </div>

                  <Button onClick={handleStartRoleplay} className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Roleplay
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}

const Zap = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const Play = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);
