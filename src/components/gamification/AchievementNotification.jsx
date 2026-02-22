import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Zap, Crown, Target, X } from 'lucide-react';
import { toast } from 'sonner';

const achievementIcons = {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    crown: Crown,
    target: Target
};

export default function AchievementNotification({ achievement, isVisible, onClose, onShare }) {
    const [showConfetti, setShowConfetti] = useState(false);
    
    useEffect(() => {
        if (isVisible) {
            setShowConfetti(true);
            // Auto-hide after 5 seconds if not manually closed
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const IconComponent = achievementIcons[achievement?.badge_icon] || Trophy;

    if (!achievement) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300 shadow-2xl max-w-sm">
                        <div className="p-6 text-white">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <IconComponent className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                                        <p className="text-yellow-100 text-sm">🎉 Congratulations!</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20 h-8 w-8"
                                    onClick={onClose}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <div className="mb-4">
                                <h4 className="font-semibold text-lg mb-1">{achievement.name}</h4>
                                <p className="text-yellow-100 text-sm mb-3">{achievement.description}</p>
                                
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        +{achievement.points_reward} points
                                    </Badge>
                                    <Badge className={`${
                                        achievement.difficulty === 'diamond' ? 'bg-purple-600' :
                                        achievement.difficulty === 'platinum' ? 'bg-slate-600' :
                                        achievement.difficulty === 'gold' ? 'bg-yellow-600' :
                                        achievement.difficulty === 'silver' ? 'bg-slate-500' :
                                        'bg-orange-600'
                                    } text-white capitalize`}>
                                        {achievement.difficulty}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="bg-white text-orange-500 hover:bg-yellow-50 flex-1"
                                    onClick={onShare}
                                >
                                    Share Achievement
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/20"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                        
                        {/* Confetti animation overlay */}
                        {showConfetti && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={`absolute w-2 h-2 ${
                                            ['bg-yellow-300', 'bg-orange-300', 'bg-red-300', 'bg-pink-300'][i % 4]
                                        }`}
                                        initial={{
                                            x: Math.random() * 300,
                                            y: -10,
                                            rotate: 0
                                        }}
                                        animate={{
                                            y: 400,
                                            rotate: 360
                                        }}
                                        transition={{
                                            duration: 2,
                                            delay: Math.random() * 0.5
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}