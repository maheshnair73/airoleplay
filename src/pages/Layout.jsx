
import React, { useState, useEffect, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@/api/entities';
import { localAuth } from '@/lib/localAuth';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { Menu, LogOut, Search, BrainCircuit, Bell, Settings, MoreHorizontal, User as UserIcon, Shield, Bot, Building, BarChart3, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { navSections, adminNavConfig, effyAíCallsNavConfig, superAdminNavConfig, aiRoleplayStudioNav } from '@/components/navigation/navConfig';
import AuthWrapper from '@/components/auth/AuthWrapper';
import AICommandBar from '@/components/ai/AICommandBar';
import RealTimeNotifications from '@/components/notifications/RealTimeNotifications';
import eventBus from '@/components/utils/eventBus';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import WebsiteLayout from '@/components/website/WebsiteLayout';

const publicPages = ['PublicRoleplaySession', 'ProductContribution', 'InsightContribution', 'SalesRoomPublic', 'DocumentPublicView', 'Welcome', 'CommunityOnboarding'];
const websitePages = [
    'WebsiteHome', 
    'WebsiteProducts', 
    'WebsiteSolutions', 
    'WebsitePricing', 
    'WebsiteAbout',
    'AISalesRoleplay',
    'CustomAIScorecards', 
    'DigitalSalesRoomsProduct',
    'EffyLeadsProspecting',
    'EffyDocProposalsProduct',
    'UnifiedSalesAnalytics',
    'CommunityLanding'
];

const PublicLayout = ({ children }) => {
    return (
        <div className="bg-slate-50 min-h-screen">
            <main>
                {children}
            </main>
            <Toaster richColors position="top-right" />
        </div>
    );
};

const PrivateLayout = ({ children, currentPageName }) => {
    const [user, setUser] = useState(null);
    const [demoRole, setDemoRole] = useState(null);
    const [isCommandBarOpen, setCommandBarOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState(new Set(['AIRoleplay']));
    const [activeModule, setActiveModule] = useState(() => localStorage.getItem('activeModule') || 'main');
    const location = useLocation();

    useEffect(() => {
        const loadUser = (sessionUser) => {
            if (sessionUser) {
                const u = { ...sessionUser, role: sessionUser.role || 'sales_agent' };
                setUser(u);
                setDemoRole(u.role);
            }
        };

        localAuth.getSession().then(({ data: { session } }) => {
            if (session?.user) loadUser(session.user);
        });

        const { data: { subscription } } = localAuth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) loadUser(session.user);
            if (event === 'SIGNED_OUT') { setUser(null); setDemoRole(null); }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                setCommandBarOpen(true);
            }
        };

        const openCommandBar = () => setCommandBarOpen(true);
        eventBus.on('open-command-bar', openCommandBar);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            eventBus.off('open-command-bar', openCommandBar);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await User.signOut();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    };

    const handleRoleSwitch = (newRole) => {
        setDemoRole(newRole);
    };

    const resetToDefaultRole = () => {
        setDemoRole(user?.role);
    };

    const switchModule = (moduleName) => {
        setActiveModule(moduleName);
        localStorage.setItem('activeModule', moduleName);
    };

    const effectiveRole = demoRole || user?.role;

    const toggleSubmenu = (menuPage) => {
        setExpandedMenus(prev => {
            const newSet = new Set(prev);
            if (newSet.has(menuPage)) {
                newSet.delete(menuPage);
            } else {
                newSet.add(menuPage);
            }
            return newSet;
        });
    };

    const NavItem = ({ item, isSubmenuItem = false }) => {
        if (item.roles && !item.roles.includes(effectiveRole)) {
            return null;
        }

        const itemPath = item.path || createPageUrl(item.page);
        const isActive = location.pathname === itemPath;
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isExpanded = expandedMenus.has(item.page);

        return (
            <div>
                <div className={`flex items-center ${hasSubmenu ? 'justify-between' : ''} px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                } ${isSubmenuItem ? 'ml-6 pl-6' : ''}`}>
                    <Link
                        to={itemPath}
                        className="flex items-center flex-1"
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.title}</span>
                    </Link>
                    {hasSubmenu && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSubmenu(item.page);
                            }}
                            className="p-1 hover:bg-slate-600 rounded flex-shrink-0"
                            type="button"
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    )}
                </div>
                {hasSubmenu && isExpanded && (
                    <div className="mt-1 space-y-1">
                        {item.submenu.map(subItem => (
                            <NavItem key={subItem.page} item={subItem} isSubmenuItem={true} />
                        ))}
                    </div>
                )}
            </div>
        );
    };
    
    const UserNav = () => (
        <div className="flex flex-col h-full">
             <div className="h-16 flex items-center px-4 border-b border-slate-700">
                 <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 flex-1">
                    <BrainCircuit className="w-8 h-8 text-blue-500" />
                    <span className="text-xl font-bold text-white">effySales Pro</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeModule === 'roleplay' ? (
                    aiRoleplayStudioNav.map((section, index) => {
                        const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(effectiveRole));
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={index}>
                                {section.title && <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{section.title}</h3>}
                                <nav className="space-y-1">
                                    {section.items.map(item => <NavItem key={item.page} item={item} />)}
                                </nav>
                            </div>
                        );
                    })
                ) : (
                    navSections.filter(s => !s.items.some(i => i.page === 'AIAssistant')).map((section, index) => {
                        const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(effectiveRole));
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={index}>
                                {section.title && <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{section.title}</h3>}
                                <nav className="space-y-1">
                                    {section.items.map(item => <NavItem key={item.page} item={item} />)}
                                </nav>
                            </div>
                        );
                    })
                )}
                


                {['admin', 'company_admin', 'sales_manager'].includes(effectiveRole) && (
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company Admin</h3>
                        <nav className="space-y-1">
                            {adminNavConfig.map(item => <NavItem key={item.page} item={item} />)}
                        </nav>
                    </div>
                )}

                {['saas_admin', 'super_admin'].includes(effectiveRole) && (
                     <div>
                        <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform Admin</h3>
                        <nav className="space-y-1">
                            {superAdminNavConfig.map(item => <NavItem key={item.page} item={item} />)}
                        </nav>
                    </div>
                )}

                {['saas_admin', 'super_admin'].includes(effectiveRole) && (
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company Admin</h3>
                        <nav className="space-y-1">
                            {adminNavConfig.map(item => <NavItem key={item.page} item={item} />)}
                        </nav>
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-slate-700">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-slate-300 hover:text-white hover:bg-slate-700">
                            <span>{activeModule === 'roleplay' ? 'Studio' : 'Main'}</span>
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Switch Module</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => switchModule('main')} className={activeModule === 'main' ? 'bg-blue-600' : ''}>
                            Main Platform
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => switchModule('roleplay')} className={activeModule === 'roleplay' ? 'bg-blue-600' : ''}>
                            AI Roleplay Studio
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="p-4 border-t border-slate-700">
                 <NavItem item={{ page: 'AIAssistant', title: 'Chat with Effy', icon: Bot, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] }} />
            </div>

            <div className="p-4 border-t border-slate-700">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-700">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user?.avatar_url} />
                                <AvatarFallback>{user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
                                <p className="text-xs text-slate-400 capitalize truncate">{effectiveRole}</p>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-slate-400" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" side="top">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                           <Link to={createPageUrl('ProfileSettings')} className="cursor-pointer">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>My Profile</span>
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link to={createPageUrl('ProfileSettings')} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>AI Agent Settings</span>
                           </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setCommandBarOpen(true)} className="cursor-pointer">
                            <Search className="mr-2 h-4 w-4" />
                            <span>Search...</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRoleSwitch('sales_agent')} className="cursor-pointer">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Sales Agent</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleSwitch('admin')} className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleSwitch('company_admin')} className="cursor-pointer">
                            <Building className="mr-2 h-4 w-4" />
                            <span>Company Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleSwitch('super_admin')} className="cursor-pointer">
                            <Globe className="mr-2 h-4 w-4" />
                            <span>Super Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    return (
        <AuthWrapper>
            <div className="flex h-screen bg-slate-50">
                <div className="flex flex-shrink-0">
                    <div className="flex flex-col w-64 border-r border-slate-700 bg-slate-800">
                        <UserNav />
                    </div>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    <main className="flex-1 overflow-y-auto relative">
                        <Suspense fallback={<div>Loading page...</div>}>
                           {children}
                        </Suspense>
                    </main>
                </div>
                 <AICommandBar open={isCommandBarOpen} onOpenChange={setCommandBarOpen} />
            </div>
            <Toaster richColors position="top-right" />
        </AuthWrapper>
    );
};

export default function Layout({ children, currentPageName }) {
    if (publicPages.includes(currentPageName)) {
        return <PublicLayout>{children}</PublicLayout>;
    }

    if (websitePages.includes(currentPageName)) {
        return <WebsiteLayout>{children}</WebsiteLayout>;
    }
    
    return <PrivateLayout currentPageName={currentPageName}>{children}</PrivateLayout>;
}
