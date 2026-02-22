import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaderboard } from '@/api/entities';
import { Challenge } from '@/api/entities';
import { UserAchievement } from '@/api/entities';
import { GameAction } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Trophy, Award, Target, TrendingUp, Zap, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GamificationAdmin() {
    const [stats, setStats] = useState({ totalPoints: 0, achievementsEarned: 0, activeChallenges: 0 });
    const [leaderboard, setLeaderboard] = useState([]);
    const [recentAchievements, setRecentAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [leaderboardData, challengesData, achievementsData, gameActions] = await Promise.all([
                    Leaderboard.filter({ leaderboard_type: 'points_weekly', time_period: 'weekly' }),
                    Challenge.filter({ status: 'active' }),
                    UserAchievement.list('-earned_at', 5),
                    GameAction.list()
                ]);

                if (leaderboardData.length > 0) {
                    setLeaderboard(leaderboardData[0].entries || []);
                }

                setRecentAchievements(achievementsData);

                const totalPoints = gameActions.reduce((sum, action) => sum + action.points_earned, 0);
                
                // Get total achievements count by getting all achievements and counting them
                const allAchievements = await UserAchievement.list();
                
                setStats({
                    totalPoints,
                    achievementsEarned: allAchievements.length,
                    activeChallenges: challengesData.length,
                });

            } catch (error) {
                console.error("Failed to load gamification admin data:", error);
                toast.error("Could not load gamification dashboard.");
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, description }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gamification Hub</h1>
                    <p className="text-muted-foreground">Monitor and manage your team's engagement and performance.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link to={createPageUrl('AchievementManagement')}>
                            <Award className="w-4 h-4 mr-2" />
                            Manage Achievements
                        </Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Link to={createPageUrl('ChallengeManagement')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Challenge
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <StatCard title="Total Points Awarded" value={stats.totalPoints.toLocaleString()} icon={Zap} description="Across all users" />
                <StatCard title="Achievements Unlocked" value={stats.achievementsEarned.toLocaleString()} icon={Award} description="Total unique achievements earned" />
                <StatCard title="Active Challenges" value={stats.activeChallenges} icon={Target} description="Currently running competitions" />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Leaderboard */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Weekly Leaderboard</CardTitle>
                        <CardDescription>Top performers this week by points.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {leaderboard.length > 0 ? (
                            <ul className="space-y-4">
                                {leaderboard.slice(0, 5).map((entry, index) => (
                                    <li key={entry.user_email} className="flex items-center">
                                        <span className="text-lg font-bold w-8">{index + 1}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold">{entry.user_name}</p>
                                            <p className="text-sm text-muted-foreground">{entry.user_title}</p>
                                        </div>
                                        <Badge variant="secondary">{entry.value} pts</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No leaderboard data available.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Achievements</CardTitle>
                        <CardDescription>Latest achievements unlocked by the team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {recentAchievements.length > 0 ? (
                            <ul className="space-y-4">
                                {recentAchievements.map((ach) => (
                                    <li key={ach.id} className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <Award className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{ach.achievement_id}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Earned by {ach.user_email}
                                            </p>
                                        </div>
                                        <Badge variant="outline">+{ach.points_earned} pts</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No recent achievements.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* KPI/Analytics Section Placeholder */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Team KPIs & Analytics</CardTitle>
                    <CardDescription>A dedicated analytics dashboard for tracking Key Performance Indicators is coming soon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                        <BarChart2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="font-semibold">Full Analytics Dashboard Coming Soon</p>
                        <p className="text-sm">Track metrics like call-to-deal conversion, coaching completion rates, and more.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}