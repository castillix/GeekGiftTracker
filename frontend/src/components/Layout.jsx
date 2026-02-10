import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Gift, LayoutDashboard, PlusCircle, CheckCircle } from 'lucide-react';

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar / Navigation */}
            <nav className="fixed top-0 left-0 h-full w-64 bg-slate-900 text-white shadow-xl flex flex-col z-20">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-indigo-500 p-2 rounded-lg">
                        <Gift className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Geek Gifts</span>
                </div>

                <div className="flex-1 p-4 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group">
                        <LayoutDashboard className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link to="/completed" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group">
                        <CheckCircle className="w-5 h-5 group-hover:text-green-400 transition-colors" />
                        <span className="font-medium">Completed</span>
                    </Link>
                    <Link to="/new" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group">
                        <PlusCircle className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                        <span className="font-medium">New Request</span>
                    </Link>
                </div>

                <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                    &copy; {new Date().getFullYear()} Free Geek
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="ml-64 p-8 min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
