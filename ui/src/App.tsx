import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header, { NavBar } from "./components/Header";
import UploadForm from "./components/UploadForm";
import Pipeline from "./components/Pipeline";
import Report from "./components/Report";

export default function App() {
  // Track which screen the user is on
  const [view, setView] = useState<"upload" | "pipeline" | "report">("upload");
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (persistent) */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Project header (title + tagline) */}
        <Header />

        {/* Navigation bar */}
        <NavBar currentView={view} onNavigate={setView} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {view === "upload" && (
            <UploadForm onUploadComplete={handleUploadComplete} />
          )}

          {view === "pipeline" && (
            <Pipeline steps={agents} onComplete={handlePipelineComplete} />
          )}

          {view === "report" && (
            <Report sessionId={sessionId} />
          )}
        </main>
      </div>
    </div>
  );
}
