import React, { useState } from "react";
import { Upload } from "lucide-react";

type UploadFormProps = {
    onUploadComplete: () => void;
};

export default function UploadForm({ onUploadComplete }: UploadFormProps) {
    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState("");
    const [description, setDescription] = useState("");
    const [projectUrl, setProjectUrl] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!projectUrl.trim()) {
            alert("Please provide a project URL or smart contract link.");
            return;
        }

        const payload = {
            projectName: projectName.trim(),
            projectType,
            description: description.trim(),
            projectUrl: projectUrl.trim(),
        };

        try {
            console.log("Uploading:", payload);
            
            // Call FastAPI backend
            const response = await fetch('http://localhost:8000/api/projects/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Upload successful:', result);
            
            // Extract session_id from response
            if (result.session_id) {
                onUploadComplete(result.session_id);
            } else {
                throw new Error('No session ID received from server');
            }
            
        } catch (error) {
            console.error('Error uploading project:', error);
            alert('Failed to upload project. Please try again.');
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-12">
            <div className="text-center">
                <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold mt-4">Upload Your Project</h2>
                <p className="text-gray-500 mt-1">
                    Start compliance analysis by providing your GitHub repository or smart contract URL.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-xl shadow"
            >
                {/* Project name & type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Project Name</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="My DeFi Project"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Project Type</label>
                        <select
                            value={projectType}
                            onChange={(e) => setProjectType(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                        >
                            <option value="">Select project type</option>
                            <option>Smart Contract</option>
                            <option>Backend Service</option>
                            <option>Frontend App</option>
                        </select>
                    </div>
                </div>

                {/* Project URL */}
                <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Project URL</label>
                    <input
                        type="url"
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        placeholder="https://github.com/username/repo or smart contract link"
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                    />
                </div>

                {/* Description */}
                <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of your project's functionality..."
                        rows={4}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                    />
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800"
                >
                    Upload & Start Analysis
                </button>
            </form>
        </main>
    );
}