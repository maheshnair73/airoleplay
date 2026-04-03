import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Zap, Star } from 'lucide-react';

export default function ChallengeHub() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Challenge Hub</h1>
      <p className="text-muted-foreground mb-8">
        Gamified challenges and competitions coming soon!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Challenges</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Target className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Zap className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Leaderboard Rank</p>
                <p className="text-3xl font-bold">-</p>
              </div>
              <Star className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
