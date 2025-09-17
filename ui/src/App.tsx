import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header, { NavBar } from "./components/Header";
import UploadForm from "./components/UploadForm";
import Pipeline from "./components/Pipeline";

export default function App() {
  // Track which screen the user is on
  const [view, setView] = useState<"upload" | "pipeline" | "report">("upload");

  // Demo pipeline agents
  const agents = [
    { id: "1", name: "Repo Understanding Agent", status: "pending" as const },
    { id: "2", name: "Compliance Rules Checker", status: "pending" as const },
    { id: "3", name: "Risk Analyzer", status: "pending" as const },
    { id: "4", name: "Report Generator", status: "pending" as const },
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
            <UploadForm onUploadComplete={() => setView("pipeline")} />
          )}

          {view === "pipeline" && (
            <Pipeline steps={agents} onComplete={() => setView("report")} />
          )}

          {view === "report" && (
            <div className="p-8 text-center text-lg">
              ✅ Final compliance report goes here
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
