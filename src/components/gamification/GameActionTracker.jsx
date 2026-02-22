import React, { useEffect } from 'react';
import { GameAction } from '@/api/entities';
import { GameProfile } from '@/api/entities';
import { Achievement } from '@/api/entities';
import { UserAchievement } from '@/api/entities';
import { User } from '@/api/entities';

// Game action points mapping
const POINT_VALUES = {
    lead_created: 10,
    lead_qualified: 25,
    call_completed: 15,
    roleplay_finished: 20,
    coaching_submitted: 30,
    document_created: 15,
    proposal_sent: 35,
    sales_room_created: 25,
    achievement_earned: 50
};

class GameActionTracker {
    static async trackAction(actionType, relatedEntity = null, relatedId = null, qualityScore = null) {
        try {
            const user = await User.me();
            if (!user) return;

            const basePoints = POINT_VALUES[actionType] || 5;
            let pointsEarned = basePoints;

            // Apply quality multiplier if available
            if (qualityScore && qualityScore > 80) {
                pointsEarned = Math.round(basePoints * 1.5);
            } else if (qualityScore && qualityScore > 90) {
                pointsEarned = Math.round(basePoints * 2);
            }

            // Create game action record
            await GameAction.create({
                user_email: user.email,
                action_type: actionType,
                points_earned: pointsEarned,
                related_entity: relatedEntity,
                related_id: relatedId,
                quality_score: qualityScore,
                team_points: true,
                streak_contribution: true
            });

            // Update user's game profile
            await this.updateGameProfile(user.email, pointsEarned);

            // Check for achievements
            await this.checkAchievements(user.email, actionType);

        } catch (error) {
            console.error('Error tracking game action:', error);
        }
    }

    static async updateGameProfile(userEmail, points) {
        try {
            let profile = await GameProfile.filter({ user_email: userEmail });
            
            if (!profile || profile.length === 0) {
                // Create new profile
                await GameProfile.create({
                    user_email: userEmail,
                    total_points: points,
                    points_this_month: points,
                    points_this_week: points,
                    current_level: 1,
                    last_activity_date: new Date().toISOString().split('T')[0]
                });
            } else {
                // Update existing profile
                const currentProfile = profile[0];
                const newTotalPoints = currentProfile.total_points + points;
                const newLevel = Math.floor(newTotalPoints / 1000) + 1;
                
                await GameProfile.update(currentProfile.id, {
                    total_points: newTotalPoints,
                    points_this_month: currentProfile.points_this_month + points,
                    points_this_week: currentProfile.points_this_week + points,
                    current_level: newLevel,
                    last_activity_date: new Date().toISOString().split('T')[0],
                    level_progress: (newTotalPoints % 1000) / 10
                });
            }
        } catch (error) {
            console.error('Error updating game profile:', error);
        }
    }

    static async checkAchievements(userEmail, actionType) {
        try {
            const actions = await GameAction.filter({ user_email: userEmail, action_type: actionType });
            const achievements = await Achievement.filter({ is_active: true });

            for (const achievement of achievements) {
                const criteria = achievement.trigger_criteria;
                if (criteria.action_type === actionType) {
                    if (actions.length >= criteria.count_required) {
                        // Check if already earned
                        const existing = await UserAchievement.filter({
                            user_email: userEmail,
                            achievement_id: achievement.achievement_id
                        });

                        if (!existing || existing.length === 0) {
                            await UserAchievement.create({
                                user_email: userEmail,
                                achievement_id: achievement.achievement_id,
                                points_earned: achievement.points_reward
                            });

                            // Track achievement as game action
                            await this.trackAction('achievement_earned', 'achievement', achievement.id);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }
}

export default GameActionTracker;