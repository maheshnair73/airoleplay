
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Removed Tabs, TabsContent, TabsList, TabsTrigger as they are replaced by sidebar navigation
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Added new icons as per outline, kept existing ones
import { User, Camera, Bot, Mic, Save, Play, Loader2, UserCircle, Cog, Shield, Bell, Calendar } from 'lucide-react';
import { User as UserEntity } from '@/api/entities';
import { toast } from 'sonner';

// New imports from outline
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';


// --- Helper component: ProfileForm ---
const ProfileForm = ({ profileData, setProfileData, onSave, isSaving }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                        id="display_name"
                        value={profileData.display_name}
                        onChange={(e) => setProfileData({...profileData, display_name: e.target.value})}
                        placeholder="Your preferred name"
                    />
                </div>
                <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                        id="phone_number"
                        value={profileData.phone_number}
                        onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                        placeholder="Your phone number"
                    />
                </div>
                <div>
                    <Label htmlFor="effyvoice_agent_id">Dialer Agent ID</Label>
                    <Input
                        id="effyvoice_agent_id"
                        value={profileData.effyvoice_agent_id}
                        onChange={(e) => setProfileData({...profileData, effyvoice_agent_id: e.target.value})}
                        placeholder="Your dialer agent ID"
                    />
                </div>
                <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={profileData.country} onValueChange={(value) => setProfileData({...profileData, country: value})}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={() => onSave(profileData)} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
            </div>
        </CardContent>
    </Card>
);

// --- Helper component: AIAgentSettings (extracted from original 'ai-agent' tab) ---
const AIAgentSettings = ({ aiAgentSettings, setAiAgentSettings, onSave, isSaving, voices }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handlePlayVoice = () => {
        if (!('speechSynthesis' in window) || isSpeaking) return;

        window.speechSynthesis.cancel();
        
        setIsSpeaking(true);

        const utterance = new SpeechSynthesisUtterance("Hello, I am your AI assistant. This is a preview of my voice.");

        const selectedVoice = voices.find(v => v.name === aiAgentSettings.voice_settings.voice_name);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            console.warn(`Voice '${aiAgentSettings.voice_settings.voice_name}' not found. Using default.`);
        }

        utterance.rate = aiAgentSettings.voice_settings.rate;
        utterance.pitch = aiAgentSettings.voice_settings.pitch;
        utterance.volume = aiAgentSettings.voice_settings.volume;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            toast.error("Could not play voice preview. Make sure a valid voice is selected.");
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    AI Assistant Customization
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label htmlFor="agent_name">Agent Name</Label>
                    <Input
                        id="agent_name"
                        value={aiAgentSettings.agent_name}
                        onChange={(e) => setAiAgentSettings({...aiAgentSettings, agent_name: e.target.value})}
                        placeholder="Your AI agent's name"
                    />
                </div>

                <div>
                    <Label>Agent Picture</Label>
                    <div className="flex items-center gap-4 mt-2">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={aiAgentSettings.agent_avatar} alt="Agent Avatar" />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                                {aiAgentSettings.agent_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Input
                                value={aiAgentSettings.agent_avatar}
                                onChange={(e) => setAiAgentSettings({...aiAgentSettings, agent_avatar: e.target.value})}
                                placeholder="Avatar image URL"
                            />
                            <p className="text-sm text-slate-500 mt-1">Enter an image URL for your AI agent's avatar</p>
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="flex items-center gap-2 mb-3">
                        <Mic className="w-4 h-4" />
                        Voice Settings
                    </Label>
                    <div className="space-y-4">
                        <div className="flex items-end gap-2">
                            <div className="flex-grow">
                                <Label htmlFor="voice_name">Voice</Label>
                                <Select 
                                    value={aiAgentSettings.voice_settings.voice_name} 
                                    onValueChange={(value) => setAiAgentSettings({
                                        ...aiAgentSettings, 
                                        voice_settings: {...aiAgentSettings.voice_settings, voice_name: value}
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voices.length > 0 ? (
                                            voices.map(voice => (
                                                <SelectItem key={voice.name} value={voice.name}>
                                                    {`${voice.name} (${voice.lang}) ${voice.default ? '(Default)' : ''}`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            // Fallback options if voices aren't loaded or supported
                                            <>
                                                <SelectItem value="Microsoft Zira Desktop - English (United States)">Zira (Female)</SelectItem>
                                                <SelectItem value="Microsoft David Desktop - English (United States)">David (Male)</SelectItem>
                                                <SelectItem value="Google UK English Female">Google UK Female</SelectItem>
                                                <SelectItem value="Google UK English Male">Google UK Male</SelectItem>
                                                <SelectItem value="loading" disabled>Loading voices...</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePlayVoice}
                                disabled={isSpeaking}
                                aria-label="Listen to selected voice"
                            >
                                {isSpeaking ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="rate">Speech Rate: {aiAgentSettings.voice_settings.rate}</Label>
                                <input
                                    type="range"
                                    id="rate"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={aiAgentSettings.voice_settings.rate}
                                    onChange={(e) => setAiAgentSettings({
                                        ...aiAgentSettings,
                                        voice_settings: {...aiAgentSettings.voice_settings, rate: parseFloat(e.target.value)}
                                    })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Label htmlFor="pitch">Pitch: {aiAgentSettings.voice_settings.pitch}</Label>
                                <input
                                    type="range"
                                    id="pitch"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={aiAgentSettings.voice_settings.pitch}
                                    onChange={(e) => setAiAgentSettings({
                                        ...aiAgentSettings,
                                        voice_settings: {...aiAgentSettings.voice_settings, pitch: parseFloat(e.target.value)}
                                    })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Label htmlFor="volume">Volume: {aiAgentSettings.voice_settings.volume}</Label>
                                <input
                                    type="range"
                                    id="volume"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={aiAgentSettings.voice_settings.volume}
                                    onChange={(e) => setAiAgentSettings({
                                        ...aiAgentSettings,
                                        voice_settings: {...aiAgentSettings.voice_settings, volume: parseFloat(e.target.value)}
                                    })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => onSave({ ai_agent_settings: aiAgentSettings })} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save AI Agent Settings'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Helper component: UserSettings (from outline) ---
const UserSettings = ({ user, onUpdate, onPasswordChange }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Cog className="w-5 h-5" />
                User Settings
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">General user preferences such as theme, language, etc. (Not yet implemented).</p>
            {/* Add actual settings here later */}
        </CardContent>
    </Card>
);

// --- Helper component: SecuritySettings (from outline) ---
const SecuritySettings = ({ onPasswordChange }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Manage your account security.</p>
            <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input type="password" id="current-password" placeholder="••••••••" className="max-w-xs" />
            </div>
            <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input type="password" id="new-password" placeholder="••••••••" className="max-w-xs" />
            </div>
            <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input type="password" id="confirm-password" placeholder="••••••••" className="max-w-xs" />
            </div>
            <div className="flex justify-end">
                <Button onClick={() => onPasswordChange('new-password')} disabled={false}> {/* Add actual password logic later */}
                    <Save className="w-4 h-4 mr-2" />
                    Change Password
                </Button>
            </div>
        </CardContent>
    </Card>
);

// --- Helper component: NotificationSettings (from outline) ---
const NotificationSettings = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Configure your notification preferences (Not yet implemented).</p>
            {/* Add actual notification settings here later */}
        </CardContent>
    </Card>
);

// --- Main ProfileSettings component ---
export default function ProfileSettings() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // New state for sidebar navigation

    // States for ProfileForm
    const [profileData, setProfileData] = useState({
        display_name: '',
        phone_number: '',
        effyvoice_agent_id: '',
        country: 'india'
    });
    
    // States for AIAgentSettings
    const [aiAgentSettings, setAiAgentSettings] = useState({
        agent_name: 'Effy',
        agent_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80',
        voice_settings: {
            voice_name: 'Microsoft Zira Desktop - English (United States)',
            rate: 0.9,
            pitch: 1.1,
            volume: 0.9
        }
    });

    const [voices, setVoices] = useState([]); // New state to store available speech synthesis voices

    useEffect(() => {
        const fetchUserAndVoices = async () => {
            try {
                const currentUser = await UserEntity.me();
                setUser(currentUser);
                
                setProfileData({
                    display_name: currentUser.display_name || currentUser.full_name || '',
                    phone_number: currentUser.phone_number || '', // Changed default from '9699859996' to empty
                    effyvoice_agent_id: currentUser.effyvoice_agent_id || '',
                    country: currentUser.country || 'india'
                });

                if (currentUser.ai_agent_settings) {
                    setAiAgentSettings({
                        agent_name: currentUser.ai_agent_settings.agent_name || 'Effy',
                        agent_avatar: currentUser.ai_agent_settings.agent_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80',
                        voice_settings: {
                            voice_name: currentUser.ai_agent_settings.voice_settings?.voice_name || 'Microsoft Zira Desktop - English (United States)',
                            rate: currentUser.ai_agent_settings.voice_settings?.rate || 0.9,
                            pitch: currentUser.ai_agent_settings.voice_settings?.pitch || 1.1,
                            volume: currentUser.ai_agent_settings.voice_settings?.volume || 0.9
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                toast.error('Failed to load profile settings');
            } finally {
                setIsLoading(false);
            }

            // Load speech synthesis voices
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const getSpeechVoices = () => {
                    const availableVoices = window.speechSynthesis.getVoices();
                    setVoices(availableVoices);
                    if (availableVoices.length === 0) {
                        // If no voices initially, retry after a short delay (browser might be loading them)
                        setTimeout(() => {
                            const newVoices = window.speechSynthesis.getVoices();
                            if (newVoices.length > 0) {
                                setVoices(newVoices);
                            }
                        }, 500);
                    }
                };
                
                getSpeechVoices();
                window.speechSynthesis.onvoiceschanged = getSpeechVoices;
            }
        };

        fetchUserAndVoices();
        
        // Cleanup for onvoiceschanged listener
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const handleUpdate = async (data) => {
        setIsSaving(true);
        try {
            await UserEntity.updateMyUserData(data);
            toast.success('Settings updated successfully');
            // Re-fetch user data to reflect changes immediately
            const updatedUser = await UserEntity.me();
            setUser(updatedUser);
            // Re-set profile/aiAgent data based on updatedUser to ensure UI consistency
            setProfileData({
                display_name: updatedUser.display_name || updatedUser.full_name || '',
                phone_number: updatedUser.phone_number || '',
                effyvoice_agent_id: updatedUser.effyvoice_agent_id || '',
                country: updatedUser.country || 'india'
            });
            if (updatedUser.ai_agent_settings) {
                setAiAgentSettings({
                    agent_name: updatedUser.ai_agent_settings.agent_name || 'Effy',
                    agent_avatar: updatedUser.ai_agent_settings.agent_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80',
                    voice_settings: {
                        voice_name: updatedUser.ai_agent_settings.voice_settings?.voice_name || 'Microsoft Zira Desktop - English (United States)',
                        rate: updatedUser.ai_agent_settings.voice_settings?.rate || 0.9,
                        pitch: updatedUser.ai_agent_settings.voice_settings?.pitch || 1.1,
                        volume: updatedUser.ai_agent_settings.voice_settings?.volume || 0.9
                    }
                });
            }

        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = (newPassword) => {
        // This is a placeholder; actual password change logic would be here.
        toast.info("Password change functionality is not yet implemented.");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <User className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-500">Loading profile...</p>
                </div>
            </div>
        );
    }
    
    // Define navItems after isLoading check, so `user` is guaranteed for props if needed
    const navItems = [
        { id: 'profile', label: 'My Profile', icon: UserCircle, component: <ProfileForm profileData={profileData} setProfileData={setProfileData} onSave={handleUpdate} isSaving={isSaving} /> },
        { id: 'ai-agent', label: 'AI Assistant', icon: Bot, component: <AIAgentSettings aiAgentSettings={aiAgentSettings} setAiAgentSettings={setAiAgentSettings} onSave={handleUpdate} isSaving={isSaving} voices={voices} /> }, // Added AI Agent settings
        { id: 'settings', label: 'User Settings', icon: Cog, component: <UserSettings user={user} onUpdate={handleUpdate} onPasswordChange={handlePasswordChange} /> },
        { id: 'security', label: 'Security', icon: Shield, component: <SecuritySettings onPasswordChange={handlePasswordChange} /> },
        { id: 'notifications', label: 'Notifications', icon: Bell, component: <NotificationSettings /> },
        { id: 'calendar', label: 'Calendar', icon: Calendar, href: createPageUrl('CalendarSettings') },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-600 mt-1">Manage your account and AI assistant preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <aside className="w-full md:w-1/4">
                    <nav className="space-y-1">
                        {navItems.map(item => (
                            item.href ? (
                                <Link
                                    key={item.id}
                                    to={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
                                >
                                    <item.icon className="mr-3 h-5 w-5 text-slate-500 group-hover:text-slate-600" />
                                    {item.label}
                                </Link>
                            ) : (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                        activeTab === item.id
                                            ? 'bg-slate-100 text-slate-900'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <item.icon className="mr-3 h-5 w-5 text-slate-500 group-hover:text-slate-600" />
                                    {item.label}
                                </button>
                            )
                        ))}
                    </nav>
                </aside>
                <main className="w-full md:w-3/4">
                    <div className="bg-white p-8 rounded-lg shadow-sm">
                        {navItems.find(item => item.id === activeTab)?.component}
                    </div>
                </main>
            </div>
        </div>
    );
}
