import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameProfile } from '@/api/entities';
import { Challenge } from '@/api/entities';
import { Leaderboard } from '@/api/entities';
import { User } from '@/api/entities';
import { 
    Trophy, 
    Target, 
    Zap, 
    Award, 
    TrendingUp, 
    Clock, 
    Users,
    Star,
    Crown,
    Flame
} from 'lucide-react';
import { toast } from 'sonner';

export default function GameDashboard() {
    const [gameProfile, setGameProfile] = useState(null);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadGameData = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);

                // Load user's game profile
                const profiles = await GameProfile.filter({ user_email: currentUser.email });
                if (profiles.length > 0) {
                    setGameProfile(profiles[0]);
                } else {
                    // Create initial game profile
                    const newProfile = await GameProfile.create({
                        user_email: currentUser.email,
                        current_level: 1,
                        total_points: 0
                    });
                    setGameProfile(newProfile);
                }

                // Load active challenges
                const challenges = await Challenge.filter({ status: 'active' }, '-created_date', 1);
                if (challenges.length > 0) {
                    setActiveChallenge(challenges[0]);
                }

                // Load weekly leaderboard
                const leaderboards = await Leaderboard.filter({ 
                    leaderboard_type: 'points_weekly',
                    time_period: 'weekly'
                });
                if (leaderboards.length > 0) {
                    setLeaderboard(leaderboards[0].entries || []);
                }

            } catch (error) {
                console.error('Error loading game data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGameData();
    }, []);

    if (isLoading) {
        return <div className="text-center py-8">Loading your game stats...</div>;
    }

    const levelProgress = gameProfile ? (gameProfile.level_progress || 0) : 0;
    const userRank = leaderboard.findIndex(entry => entry.user_email === user?.email) + 1;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Stats Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Crown className="w-5 h-5 text-blue-600" />
                            Level {gameProfile?.current_level || 1}
                        </CardTitle>
                        <Badge className="bg-blue-600 text-white">
                            {gameProfile?.total_points || 0} pts
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Progress to Level {(gameProfile?.current_level || 1) + 1}</span>
                                <span>{levelProgress}%</span>
                            </div>
                            <Progress value={levelProgress} className="h-3" />
                        </div>
                        
                        {gameProfile?.streak_days > 0 && (
                            <div className="flex items-center gap-2 text-orange-600">
                                <Flame className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {gameProfile.streak_days} day streak!
                                </span>
                            </div>
                        )}

                        {gameProfile?.title && (
                            <Badge variant="outline" className="text-xs">
                                {gameProfile.title}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Active Challenge Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Active Challenge
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activeChallenge ? (
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">{activeChallenge.challenge_name}</h4>
                            <p className="text-xs text-slate-600">{activeChallenge.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">
                                    Ends {new Date(activeChallenge.end_date).toLocaleDateString()}
                                </span>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                    Join Challenge
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500">
                            <Target className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">No active challenges</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Leaderboard Card */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Weekly Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {userRank > 0 && (
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">#{userRank}</Badge>
                                    <span className="text-sm font-medium">You</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">
                                    {gameProfile?.points_this_week || 0} pts
                                </span>
                            </div>
                        )}
                        
                        {leaderboard.slice(0, 3).map((entry, index) => (
                            <div key={entry.user_email} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        index === 0 ? 'bg-yellow-500 text-white' :
                                        index === 1 ? 'bg-slate-400 text-white' :
                                        'bg-orange-500 text-white'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <span className="font-medium">{entry.user_name}</span>
                                </div>
                                <span className="font-semibold">{entry.value} pts</span>
                            </div>
                        ))}
                        
                        {leaderboard.length > 3 && (
                            <Button variant="outline" size="sm" className="w-full mt-2">
                                View Full Leaderboard
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}