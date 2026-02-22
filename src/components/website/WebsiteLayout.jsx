
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

const NavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={`text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}>
            {children}
        </Link>
    );
};

const WebsiteFooter = () => {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BrainCircuit className="w-8 h-8 text-blue-500" />
                            <h3 className="font-bold text-white text-xl">effySales Pro</h3>
                        </div>
                        <p className="text-sm text-slate-400">Your AI Sales Buddy to Turn Every Rep Into a Revenue Machine.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to={createPageUrl('WebsiteProducts')} className="hover:text-white">Products</Link></li>
                            <li><Link to={createPageUrl('WebsiteSolutions')} className="hover:text-white">Solutions</Link></li>
                            <li><Link to={createPageUrl('WebsitePricing')} className="hover:text-white">Pricing</Link></li>
                            <li><a href="#" className="hover:text-white">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to={createPageUrl('WebsiteAbout')} className="hover:text-white">About Us</Link></li>
                            <li><a href="#" className="hover:text-white">Careers</a></li>
                            <li><a href="#" className="hover:text-white">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} effySales Pro. All rights reserved.
                </div>
            </div>
        </footer>
    );
};


export default function WebsiteLayout({ children }) {
    return (
        <div className="bg-white text-slate-800 font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <Link to={createPageUrl('WebsiteHome')} className="flex items-center gap-2">
                                <BrainCircuit className="w-8 h-8 text-blue-600" />
                                <span className="text-xl font-bold text-slate-900">effySales Pro</span>
                            </Link>
                        </div>
                        <nav className="hidden md:flex md:space-x-8">
                            <NavLink to={createPageUrl('WebsiteProducts')}>Products</NavLink>
                            <NavLink to={createPageUrl('WebsiteSolutions')}>Solutions</NavLink>
                            <NavLink to={createPageUrl('WebsitePricing')}>Pricing</NavLink>
                            <NavLink to={createPageUrl('CommunityLanding')}>Community</NavLink>
                            <NavLink to={createPageUrl('WebsiteAbout')}>About Us</NavLink>
                        </nav>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" asChild>
                                <Link to={createPageUrl('Welcome')}>Sign In</Link>
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                                <Link to={createPageUrl('Register')}>Sign Up Free</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <main>
                {children}
            </main>
            <WebsiteFooter />
        </div>
    );
}
