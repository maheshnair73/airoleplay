import React from 'react';
import { User } from '@/api/entities';
import { ExternalLink } from 'lucide-react';

export const handleExternalSalesRooms = async () => {
    try {
        // Get current user info
        const user = await User.me();
        
        // Construct URL with user context (if your other app supports it)
        const baseUrl = "https://your-sales-rooms-app.base44.com";
        const params = new URLSearchParams({
            email: user.email,
            name: user.full_name,
            source: 'salesai-pro'
        });
        
        // Open in new tab with context
        window.open(`${baseUrl}?${params.toString()}`, '_blank');
    } catch (error) {
        // Fallback if user not logged in
        window.open("https://your-sales-rooms-app.base44.com", '_blank');
    }
};

export default function ExternalNavLink({ item }) {
    const handleClick = (e) => {
        e.preventDefault();
        if (item.page === 'DigitalSalesRooms') {
            handleExternalSalesRooms();
        } else {
            window.open(item.url, '_blank');
        }
    };

    return (
        <button 
            onClick={handleClick}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-slate-300 hover:bg-slate-700/50 hover:text-white"
        >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.name}</span>
            <ExternalLink className="h-3 w-3 ml-auto text-slate-400" />
        </button>
    );
}