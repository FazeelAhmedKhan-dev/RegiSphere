import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadForm from "./components/UploadForm";
import Pipeline from "./components/Pipeline";
import Report from "./components/Report";
import Landing from "./components/Landing";
import HowItWorks from "./components/HowItWorks";
import WhyItMatters from "./components/WhyItMatters";

export default function App() {
  // Track whether user is on landing page or dashboard
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [showWhyItMatters, setShowWhyItMatters] = useState<boolean>(false);
  const isLandingPage = !isLoggedIn && !showHowItWorks;
  // Track which screen the user is on in dashboard
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'upload' | 'pipeline' | 'report'>('upload');

  const handleGetStarted = () => {
    setIsLoggedIn(true);
    setShowHowItWorks(false);
    setShowWhyItMatters(false);
    setActiveSection('upload'); // Ensure we start at upload section
  };

  const handleBackToLanding = () => {
    setIsLoggedIn(false);
    setShowHowItWorks(false);
    setShowWhyItMatters(false);
  };

  const handleUploadComplete = (uploadSessionId?: string) => {
    if (uploadSessionId) {
      setSessionId(uploadSessionId);
      // Update URL with session ID
      const url = new URL(window.location.href);
      url.searchParams.set('sessionId', uploadSessionId);
      window.history.pushState({}, '', url.toString());
    }
    setActiveSection("pipeline");
  };

  const handlePipelineComplete = () => {
    setActiveSection("report");
  };

  // Interface Agent orchestrated pipeline
  const agents = [
    { id: "1", name: "Interface Agent - Repository Analysis", status: "pending" as const },
    { id: "2", name: "FirecrawlMCP - Compliance Standards", status: "pending" as const },
    { id: "3", name: "OpenDeepResearch - Risk Analysis", status: "pending" as const },
    { id: "4", name: "RepoUnderstanding - Code Assessment", status: "pending" as const },
  ];

  // Landing page with just the main content
  if (isLandingPage && !showHowItWorks) {
    return (
      <Landing 
        onGetStarted={handleGetStarted}
      />
    );
  }

  // Landing page with navigation and How It Works section
  if (isLandingPage && showHowItWorks) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">RegiSphere</h1>
              </div>
              <div className="flex items-center space-x-8">
                <button 
                  onClick={() => setShowHowItWorks(false)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </button>
                <button 
                  onClick={() => setShowHowItWorks(true)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  How It Works
                </button>
                <button 
                  onClick={handleGetStarted}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main>
          <HowItWorks />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation bar - Landing page style */}
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
                 <button onClick={handleBackToLanding} className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</button>
                 <button onClick={() => {setShowHowItWorks(!showHowItWorks); setShowWhyItMatters(false);}} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${showHowItWorks ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-purple-600'}`}>How It Works</button>
                 <button onClick={() => {setShowWhyItMatters(!showWhyItMatters); setShowHowItWorks(false);}} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${showWhyItMatters ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-purple-600'}`}>Why It Matters</button>
               </div>
             </div>
          </div>
        </div>
      </nav>



      {/* Section Navigation - only show when not viewing How It Works */}
      {!showHowItWorks && (
        <div className="bg-gradient-to-r from-gray-50 to-white py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 inline-flex space-x-2">
                <button
                   onClick={() => setActiveSection('upload')}
                   className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                     activeSection === 'upload'
                       ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200'
                       : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                   }`}
                 >
                   Upload Documents
                 </button>
                 <button
                   onClick={() => setActiveSection('pipeline')}
                   className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                     activeSection === 'pipeline'
                       ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200'
                       : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                   }`}
                 >
                   Analysis Pipeline
                 </button>
                 <button
                   onClick={() => setActiveSection('report')}
                   className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                     activeSection === 'report'
                       ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200'
                       : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                   }`}
                 >
                   Compliance Report
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why It Matters Section */}
      {showWhyItMatters ? (
        <WhyItMatters />
      ) : showHowItWorks ? (
        <HowItWorks />
      ) : (
        /* Main content area */
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Upload Section */}
          {activeSection === 'upload' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Upload Documents</h2>
                <p className="text-gray-600">Upload your documents for compliance analysis</p>
              </div>
              <UploadForm onUploadComplete={handleUploadComplete} />
            </div>
          )}

          {/* Pipeline Section */}
          {activeSection === 'pipeline' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Analysis Pipeline</h2>
                <p className="text-gray-600">Track the progress of your compliance analysis</p>
              </div>
              <Pipeline steps={agents} onComplete={handlePipelineComplete} />
            </div>
          )}

          {/* Report Section */}
          {activeSection === 'report' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Compliance Report</h2>
                <p className="text-gray-600">View your detailed compliance analysis results</p>
              </div>
              <Report sessionId={sessionId} />
            </div>
          )}
        </main>
      )}
    </div>
  );
}
