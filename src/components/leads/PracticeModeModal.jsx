
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Mic, Bot, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PracticeOption = ({ icon: Icon, title, description, onClick, highlight = false }) => (
    <Card 
        className={`w-full text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${highlight ? 'border-purple-500 ring-2 ring-purple-300' : 'border-slate-200'}`}
        onClick={onClick}
    >
        <CardContent className="p-6">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${highlight ? 'bg-purple-100' : 'bg-slate-100'}`}>
                <Icon className={`w-8 h-8 ${highlight ? 'text-purple-600' : 'text-slate-600'}`} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
        </CardContent>
    </Card>
);

export default function PracticeModeModal({ open, onOpenChange, lead }) {
    const navigate = useNavigate();

    if (!lead) return null;

    const handleNavigation = (page) => {
        navigate(createPageUrl(`${page}?leadId=${lead.id}`));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl p-0 border-0 bg-transparent shadow-none">
                <div className="bg-white rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative">
                        {/* The close button is now provided by DialogContent automatically */}
                        <h2 className="text-3xl font-bold">Choose Practice Mode</h2>
                        <div className="flex items-center gap-3 mt-4 opacity-90">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-semibold">
                                {lead.contact_name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-lg font-medium">{lead.contact_name}</p>
                                <p className="text-sm">{lead.contact_title} at {lead.company_name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-semibold text-slate-800">How would you like to practice?</h3>
                            <p className="text-slate-500 mt-2">Choose the practice mode that fits your learning style and available time.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <PracticeOption
                                icon={Mic}
                                title="Pitch Practice"
                                description="Record your pitch and submit it for AI or manager review."
                                onClick={() => handleNavigation('CoachingHub')}
                            />
                             <PracticeOption
                                icon={Bot}
                                title="AI Roleplay"
                                description="Have an interactive conversation with an AI prospect."
                                onClick={() => handleNavigation('AIRoleplay')}
                                highlight
                            />
                             <PracticeOption
                                icon={Users}
                                title="Human Roleplay"
                                description="Practice with a colleague in a simulated call environment."
                                onClick={() => handleNavigation('HumanRoleplay')}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
