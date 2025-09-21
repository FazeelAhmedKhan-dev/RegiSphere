import { Bell, Search, Sun, User } from "lucide-react";
import React from "react";

export type ViewType = "upload" | "pipeline" | "report";

type NavBarProps = {
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
    onBackToLanding?: () => void;
};

export const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate, onBackToLanding }) => {
    return (
        <nav className="h-16 bg-white shadow-sm border-b border-gray-200 w-full relative">
            <div className="max-w-7xl mx-auto h-full flex items-center px-6">
                {/* Center: Navigation buttons */}
                <div className="flex items-center gap-4 mx-auto">
                    {/* Home button */}
                    {onBackToLanding && (
                        <button
                            onClick={onBackToLanding}
                            className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Home
                        </button>
                    )}
                    
                    {[
                        { key: "upload", label: "Upload" },
                        { key: "pipeline", label: "Pipeline" },
                        { key: "report", label: "Report" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => onNavigate(key as ViewType)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === key
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-gray-600 hover:text-purple-600"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Right: Search + Icons */}
                <div className="absolute right-6 flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search compliance rules..."
                            className="pl-8 pr-3 py-1.5 text-sm rounded-md border focus:outline-none focus:ring focus:ring-purple-300"
                        />
                    </div>

                    <Sun className="w-5 h-5 text-gray-600 hover:text-purple-600 cursor-pointer" />
                    <Bell className="w-5 h-5 text-gray-600 hover:text-purple-600 cursor-pointer" />
                    <User className="w-6 h-6 rounded-full border text-gray-600 hover:text-purple-600 cursor-pointer" />
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
