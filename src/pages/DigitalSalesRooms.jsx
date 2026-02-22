
import React, { useState, useEffect } from 'react';
import { DigitalSalesRoom } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, ArrowLeft, BarChart2, TrendingUp, RefreshCw, Presentation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { calculateEngagementScore } from '@/api/functions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DigitalSalesRooms() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(null);
    const navigate = useNavigate();

    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const data = await DigitalSalesRoom.list('-updated_date');
            setRooms(data);
        } catch (error) {
            console.error("Failed to load sales rooms:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleRecalculateAnalytics = async (roomId) => {
        setIsCalculating(roomId);
        try {
            await calculateEngagementScore({ roomId });
            await fetchRooms();
            toast.success("Engagement score has been updated!");
        } catch (error) {
            toast.error("Failed to recalculate score.");
            console.error("Error recalculating score:", error);
        } finally {
            setIsCalculating(null);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Digital Sales Rooms</h1>
                        <p className="text-slate-500">Your centralized deal spaces.</p>
                    </div>
                </div>
                <Link to={createPageUrl('CreateDigitalSalesRoom')}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Room
                    </Button>
                </Link>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Presentation className="w-6 h-6 text-blue-600" />
                        Your Digital Sales Rooms
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">Room Name</th>
                                    <th className="px-6 py-3 text-left font-medium">Company</th>
                                    <th className="px-6 py-3 text-left font-medium">Participants</th>
                                    <th className="px-6 py-3 text-left font-medium">Status</th>
                                    <th className="px-6 py-3 text-left font-medium">Engagement</th>
                                    <th className="px-6 py-3 text-left font-medium">Created</th>
                                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rooms.length > 0 ? (
                                    rooms.map(room => (
                                        <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-800">{room.room_name}</td>
                                            <td className="px-6 py-4">{room.company_name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {room.participants?.slice(0, 3).map((p, index) => (
                                                        <Avatar key={p.email || index} className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
                                                            <AvatarImage src={p.avatar_url} />
                                                            <AvatarFallback>{p.name?.charAt(0) || '?'}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                    {room.participants?.length > 3 && (
                                                        <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200">
                                                            <AvatarFallback>+{room.participants.length - 3}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={room.status === 'active' ? 'default' : 'secondary'} className={room.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                                                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                                    <span className="font-semibold">{room.analytics?.predicted_intent_percent || 0}%</span>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleRecalculateAnalytics(room.id); }}
                                                                    disabled={isCalculating === room.id}
                                                                    className="text-slate-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
                                                                >
                                                                    <RefreshCw className={`w-3 h-3 ${isCalculating === room.id ? 'animate-spin' : ''}`} />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Recalculate Score</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{format(new Date(room.created_date), 'MMM d, yyyy')}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link to={createPageUrl(`SalesRoomAnalytics?roomId=${room.id}`)} className="flex items-center gap-1">
                                                            <BarChart2 className="w-4 h-4" /> Analytics
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                                            No sales rooms found. Start by creating one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
