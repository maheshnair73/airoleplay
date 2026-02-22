
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaderboard as LeaderboardEntity } from '@/api/entities';
import { GameProfile } from '@/api/entities';
import { User } from '@/api/entities';
import { Trophy, Medal, Award, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

export default function Leaderboard() {
    const [currentUser, setCurrentUser] = useState(null);
    const [leaderboards, setLeaderboards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState('points_weekly');
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            
            // Create sample leaderboard data for demo
            // This function is defined inside the effect to have access to selectedBoard and selectedPeriod
            const createSampleLeaderboard = () => {
                return {
                    id: 'sample-' + selectedBoard + '-' + selectedPeriod, // Make ID unique based on selection
                    leaderboard_type: selectedBoard,
                    time_period: selectedPeriod,
                    entries: [
                        {
                            rank: 1,
                            user_email: "sarah.chen@company.com",
                            user_name: "Sarah Chen",
                            user_title: "Senior Sales Rep",
                            team: "Enterprise Sales",
                            value: 1250,
                            badge: "Top Performer",
                            trend: "up",
                            previous_rank: 3
                        },
                        {
                            rank: 2,
                            user_email: "mike.rodriguez@company.com", 
                            user_name: "Mike Rodriguez",
                            user_title: "Sales Rep",
                            team: "SMB Sales",
                            value: 1180,
                            badge: "Rising Star",
                            trend: "up",
                            previous_rank: 5
                        },
                        {
                            rank: 3,
                            user_email: "jennifer.smith@company.com",
                            user_name: "Jennifer Smith",
                            user_title: "Account Executive",
                            team: "Enterprise Sales",
                            value: 1150,
                            badge: "",
                            trend: "down",
                            previous_rank: 1
                        },
                        {
                            rank: 4,
                            user_email: "david.kim@company.com",
                            user_name: "David Kim",
                            user_title: "Sales Rep",
                            team: "Mid-Market",
                            value: 1100,
                            badge: "",
                            trend: "up",
                            previous_rank: 6
                        },
                        {
                            rank: 5,
                            user_email: "alex.johnson@company.com",
                            user_name: "Alex Johnson",
                            user_title: "Senior Sales Rep",
                            team: "SMB Sales", 
                            value: 1050,
                            badge: "Consistent",
                            trend: "same",
                            previous_rank: 5
                        }
                    ],
                    total_participants: 25,
                    last_updated: new Date().toISOString()
                };
            };

            try {
                // First try to get all leaderboards and then filter
                const allBoards = await LeaderboardEntity.list('-last_updated');
                console.log('All leaderboards:', allBoards); // Debug log
                
                // Filter the boards based on selection
                const filteredBoards = allBoards.filter(board => 
                    board.leaderboard_type === selectedBoard && 
                    board.time_period === selectedPeriod
                );
                
                console.log('Filtered boards:', filteredBoards); // Debug log
                setLeaderboards(filteredBoards);
                
                // If no data found, create some sample data for demo
                if (filteredBoards.length === 0) {
                    console.log('No leaderboard data found, showing sample data');
                    setLeaderboards([createSampleLeaderboard()]);
                }
            } catch (error) {
                console.error('Failed to load leaderboard data:', error);
                // Show sample data on error
                setLeaderboards([createSampleLeaderboard()]);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [selectedBoard, selectedPeriod]);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
            } catch (error) {
                console.error('Failed to get current user:', error);
            }
        };
        getCurrentUser();
    }, []);

    const getRankIcon = (rank) => {
        switch(rank) {
            case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 2: return <Medal className="w-6 h-6 text-gray-400" />;
            case 3: return <Award className="w-6 h-6 text-amber-600" />;
            default: return <div className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold text-sm">{rank}</div>;
        }
    };

    const getTrendIcon = (trend) => {
        switch(trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
            case 'same': return <Minus className="w-4 h-4 text-slate-400" />; 
            default: return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    const getMetricLabel = () => {
        switch(selectedBoard) {
            case 'points_weekly': 
            case 'points_monthly': 
            case 'points_all_time': return 'Points';
            case 'deals_closed': return 'Deals';
            case 'calls_made': return 'Calls';
            case 'roleplay_score': return 'Score';
            default: return 'Value';
        }
    };

    const currentLeaderboard = leaderboards.length > 0 ? leaderboards[0] : null;
    const entries = currentLeaderboard?.entries || [];
    const currentUserRank = entries.find(entry => entry.user_email === currentUser?.email);

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Leaderboard</h1>
                    <p className="text-slate-600 mt-1">See how you stack up against your teammates</p>
                </div>
                
                <div className="flex gap-4">
                    <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="points_weekly">Points - Weekly</SelectItem>
                            <SelectItem value="points_monthly">Points - Monthly</SelectItem>
                            <SelectItem value="points_all_time">Points - All Time</SelectItem>
                            <SelectItem value="deals_closed">Deals Closed</SelectItem>
                            <SelectItem value="calls_made">Calls Made</SelectItem>
                            <SelectItem value="roleplay_score">Roleplay Performance</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="all_time">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Current User Position Card */}
            {currentUserRank && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {getRankIcon(currentUserRank.rank)}
                                    <div>
                                        <h3 className="font-semibold text-lg">Your Position</h3>
                                        <p className="text-slate-600">Rank #{currentUserRank.rank} of {entries.length}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                    {currentUserRank.value.toLocaleString()} {getMetricLabel()}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    {getTrendIcon(currentUserRank.trend)}
                                    <span>vs last period</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {selectedBoard.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-slate-500">Loading leaderboard...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No leaderboard data available yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.map((entry, index) => (
                                <div 
                                    key={entry.user_email} 
                                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                                        entry.user_email === currentUser?.email 
                                            ? 'bg-blue-50 border-blue-200' 
                                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {getRankIcon(entry.rank)}
                                        <div>
                                            <h4 className="font-semibold">{entry.user_name}</h4>
                                            <p className="text-sm text-slate-500">{entry.user_title}</p>
                                            {entry.team && (
                                                <Badge variant="outline" className="mt-1 text-xs">
                                                    {entry.team}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="text-right flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            {getTrendIcon(entry.trend)}
                                            {entry.previous_rank && entry.trend !== 'same' && ( 
                                                <span className="text-xs text-slate-500">
                                                    #{entry.previous_rank}
                                                </span>
                                            )}
                                        </div>
                                        <div className="font-bold text-lg">
                                            {entry.value.toLocaleString()}
                                            <span className="text-sm text-slate-500 ml-1">
                                                {getMetricLabel()}
                                            </span>
                                        </div>
                                        {entry.badge && (
                                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                                                {entry.badge}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
