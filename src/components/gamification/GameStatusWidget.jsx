import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameProfile } from '@/api/entities';
import { User } from '@/api/entities';
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react';

export default function GameStatusWidget() {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchGameProfile = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                
                const profiles = await GameProfile.filter({ user_email: currentUser.email });
                if (profiles && profiles.length > 0) {
                    setProfile(profiles[0]);
                }
            } catch (error) {
                console.error('Error fetching game profile:', error);
            }
        };

        fetchGameProfile();
    }, []);

    if (!profile) return null;

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-800">Level {profile.current_level}</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                        {profile.total_points} pts
                    </Badge>
                </div>

                <Progress value={profile.level_progress} className="mb-3" />

                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span className="font-medium">{profile.streak_days}</span>
                        </div>
                        <span className="text-slate-500">Streak</span>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Target className="w-3 h-3 text-green-500" />
                            <span className="font-medium">{profile.points_this_week}</span>
                        </div>
                        <span className="text-slate-500">This Week</span>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3 text-purple-500" />
                            <span className="font-medium">#{profile.rank_company || 'N/A'}</span>
                        </div>
                        <span className="text-slate-500">Rank</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}