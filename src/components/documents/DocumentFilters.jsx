import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, Users } from 'lucide-react';

export function DocumentFilters({ filters, onFilterChange }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Simple Toggle Buttons instead of ToggleGroup */}
            <div className="flex bg-white p-1 rounded-lg border">
                <Button
                    variant={filters.view === 'my_documents' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onFilterChange('view', 'my_documents')}
                    className={`flex items-center gap-2 ${
                        filters.view === 'my_documents' 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'text-slate-600 hover:text-slate-800'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    My Documents
                </Button>
                <Button
                    variant={filters.view === 'shared_with_me' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onFilterChange('view', 'shared_with_me')}
                    className={`flex items-center gap-2 ${
                        filters.view === 'shared_with_me' 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'text-slate-600 hover:text-slate-800'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Shared with Me
                </Button>
            </div>
            
            <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="signed">Signed</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}