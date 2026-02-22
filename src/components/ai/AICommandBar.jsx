
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Command as CommandIcon, Search } from 'lucide-react';
import { commands } from './commands';

export default function AICommandBar({ open, onOpenChange }) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!open) {
            setSearch('');
            setSelectedIndex(0);
        }
    }, [open]);

    const filteredCommands = useMemo(() => {
        if (!search) return commands;
        return commands.filter(cmd => 
            cmd.name.toLowerCase().includes(search.toLowerCase()) || 
            cmd.description.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const handleSelect = (command) => {
        command.action();
        onOpenChange(false);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    handleSelect(filteredCommands[selectedIndex]);
                }
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, selectedIndex, filteredCommands]);
    
    useEffect(() => {
      setSelectedIndex(0);
    }, [search]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 gap-0">
                <div className="flex items-center border-b px-4">
                    <Search className="h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Type a command or search..."
                        className="w-full border-0 focus-visible:ring-0 shadow-none text-base"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="p-2 max-h-[300px] overflow-y-auto">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <div
                                key={cmd.name}
                                onClick={() => handleSelect(cmd)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${selectedIndex === index ? 'bg-slate-100' : ''}`}
                            >
                                <cmd.icon className="w-5 h-5 text-slate-500" />
                                <div>
                                    <p className="font-medium text-slate-800">{cmd.name}</p>
                                    <p className="text-sm text-slate-500">{cmd.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-slate-500">No results found.</p>
                    )}
                </div>
                <div className="bg-slate-50 border-t px-4 py-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>Navigate with ↑↓ and select with ↵</span>
                    <div className="flex items-center gap-1">
                        Shift + Space
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
