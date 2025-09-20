import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header, { NavBar } from "./components/Header";
import UploadForm from "./components/UploadForm";
import Pipeline from "./components/Pipeline";
import Report from "./components/Report";
import Landing from "./components/Landing";

export default function App() {
  // Track whether user is on landing page or dashboard
  const [isLandingPage, setIsLandingPage] = useState<boolean>(true);
  // Track which screen the user is on in dashboard
  const [view, setView] = useState<"upload" | "pipeline" | "report">("upload");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'upload' | 'pipeline' | 'report'>('upload');

  const handleGetStarted = () => {
    setIsLandingPage(false);
  };

  const handleBackToLanding = () => {
    setIsLandingPage(true);
  };

  const handleUploadComplete = (uploadSessionId?: string) => {
    if (uploadSessionId) {
      setSessionId(uploadSessionId);
      // Update URL with session ID
      const url = new URL(window.location.href);
      url.searchParams.set('sessionId', uploadSessionId);
      window.history.pushState({}, '', url.toString());
    }
    setView("pipeline");
  };

  const handlePipelineComplete = () => {
    setView("report");
  };

  // Interface Agent orchestrated pipeline
  const agents = [
    { id: "1", name: "Interface Agent - Repository Analysis", status: "pending" as const },
    { id: "2", name: "FirecrawlMCP - Compliance Standards", status: "pending" as const },
    { id: "3", name: "OpenDeepResearch - Risk Analysis", status: "pending" as const },
    { id: "4", name: "RepoUnderstanding - Code Assessment", status: "pending" as const },
  ];

  // Render landing page or dashboard based on state
  if (isLandingPage) {
    return <Landing onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation bar */}
      <NavBar currentView={view} onNavigate={setView} onBackToLanding={handleBackToLanding} />

      {/* Section Navigation */}
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

      {/* Main content area */}
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
    </div>
  );
}
