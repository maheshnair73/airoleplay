import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function DisclaimerModal({ open, onOpenChange, prospect, onProceed }) {
    if (!prospect) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    
                    <div className="text-center space-y-4 py-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Let's get started with {prospect.name}!
                        </h3>
                        
                        <p className="text-sm text-slate-600 leading-relaxed px-4">
                            At times, the bot may be unresponsive, or have unusual lag times. We are 
                            always working to improve the experience.
                        </p>
                        
                        <div className="flex gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                                className="flex-1 py-3"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={onProceed}
                                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                                I understand, start call
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}