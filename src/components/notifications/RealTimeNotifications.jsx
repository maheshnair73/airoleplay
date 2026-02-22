import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentView } from '@/api/entities';
import { Lead } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Phone, Mail, Clock, X, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import eventBus from '../utils/eventBus';

export default function RealTimeNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [dismissedFollowUps, setDismissedFollowUps] = useState([]);
    const navigate = useNavigate();

    // TEMPORARILY DISABLED ALL POLLING TO PREVENT RATE LIMITING
    useEffect(() => {
        // All API calls inside this component are commented out to prevent rate limit errors.
        // This component is effectively disabled until the rate limit issue is resolved.
    }, []);

    const handleNotificationAction = async (notification) => {
        // Remove notification after action
        dismissNotification(notification.id);

        switch (notification.type) {
            case 'document_viewing': {
                try {
                    const leads = await Lead.filter({ contact_email: notification.data.viewer_email }, '', 1);
                    if (leads.length > 0) {
                        navigate(createPageUrl(`LeadDetail?leadId=${leads[0].id}`));
                        toast.info(`Navigating to ${notification.data.viewer_name}'s profile.`);
                    } else {
                        toast.error(`Lead not found for ${notification.data.viewer_email}.`);
                    }
                } catch (error) {
                    // Silent fail if rate limited
                    if (!error.message.includes('429')) {
                        toast.error('Could not find associated lead.');
                    }
                }
                break;
            }
            case 'followup_due': {
                const lead = notification.data;
                navigate(createPageUrl(`LeadDetail?leadId=${lead.id}`));
                // Use a short delay to ensure the page has loaded before dispatching the event
                setTimeout(() => {
                    eventBus.dispatch('open-crm-assistant', { leadId: lead.id });
                }, 500);
                toast.info(`Opening AI Assistant for ${lead.contact_name}.`);
                break;
            }
        }
    };

    const dismissNotification = (notificationId) => {
        const notification = notifications.find(n => n.id === notificationId);
        
        if (notification && notification.type === 'followup_due') {
            setDismissedFollowUps(prev => [...prev, notification.data.id]);
        }

        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        setNotifications(updatedNotifications);
        if (updatedNotifications.length === 0) {
            setIsVisible(false);
        }
    };

    // Return null to completely hide this component and prevent any rendering or API calls.
    return null;
}