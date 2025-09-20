import React from "react";

export type ViewType = "upload" | "pipeline" | "report";

type NavBarProps = {
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
    onBackToLanding?: () => void;
};

export const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate, onBackToLanding }) => {
    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-purple-600">RegiSphere</h1>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <button 
                                onClick={onBackToLanding} 
                                className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Home
                            </button>
                            <button className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Why It Matters
                            </button>
                            <button className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                How It Works
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

/* ---------- HEADER ---------- */
const Header: React.FC = () => {
    return (
        <header className="bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-700 text-white shadow w-full">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
                <h1 className="text-2xl font-bold tracking-wide mr-4">
                    RegiSphere
                </h1>
                <p className="text-purple-100 text-large">
                    AI-powered compliance automation for modern development teams.
                </p>
            </div>
        </header>
    );
};


export default Header;
