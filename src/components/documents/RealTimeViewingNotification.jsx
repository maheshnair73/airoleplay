import React from 'react';
import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RealTimeViewingNotification({ currentViewers, onClose }) {
    if (!currentViewers || currentViewers.length === 0) {
        return null;
    }

    const firstViewer = currentViewers[0];
    const otherViewersCount = currentViewers.length - 1;

    return (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 z-[100] shadow-lg flex items-center justify-between text-sm font-medium">
            <div className="flex items-center justify-center flex-grow pl-10">
                 <Eye className="w-5 h-5 mr-3 animate-pulse" />
                 <span>
                    {firstViewer.viewer_name || 'Someone'} is viewing "{firstViewer.document_details?.document_name || 'a document'}" right now!
                    {otherViewersCount > 0 && ` (+ ${otherViewersCount} more)`}
                </span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1 h-auto absolute right-4"
                onClick={onClose}
                aria-label="Close notification"
            >
                <X className="w-5 h-5" />
            </Button>
        </div>
    );
}