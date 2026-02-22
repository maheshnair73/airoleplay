import React, { useState, useEffect } from 'react';
import { DocumentView } from '@/api/entities';
import { User } from '@/api/entities';
import { toast } from 'sonner';
import { Eye, FileText } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function DocumentViewNotification() {
    const [user, setUser] = useState(null);
    const [lastCheck, setLastCheck] = useState(new Date().toISOString());

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user) return;

        const checkForNewViews = async () => {
            try {
                // Get all document views created after last check
                const newViews = await DocumentView.filter({ 
                    created_date: { gt: lastCheck },
                    is_currently_viewing: true
                }, '-created_date');

                // Filter to only views of documents created by current user
                for (const view of newViews) {
                    // Check if this view is for a document created by the current user
                    // This would require joining with Document table, for now we'll use a simple check
                    if (view.viewer_email !== user.email) {
                        toast.info(
                            `${view.viewer_name || view.viewer_email} is viewing your document!`,
                            {
                                description: `Document: ${view.document_name || 'Unknown Document'}`,
                                icon: <Eye className="w-4 h-4" />,
                                action: {
                                    label: 'View Analytics',
                                    onClick: () => window.location.href = createPageUrl(`DocumentAnalytics?id=${view.document_id}`),
                                },
                                duration: 8000, // Show for 8 seconds
                            }
                        );
                    }
                }
                
                setLastCheck(new Date().toISOString());
            } catch (error) {
                console.error("Error checking for document views:", error);
            }
        };

        // Check immediately, then every 30 seconds
        checkForNewViews();
        const interval = setInterval(checkForNewViews, 30000);

        return () => clearInterval(interval);
    }, [user, lastCheck]);

    return null; // This component doesn't render anything visible
}