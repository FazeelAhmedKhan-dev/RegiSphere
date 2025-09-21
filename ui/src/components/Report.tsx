import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Download, Calendar, ExternalLink } from 'lucide-react';

interface ReportData {
  content: string;
  generated_at: string;
  repository_url: string;
  project_type: string;
}

interface ReportProps {
  sessionId: string | null;
}

export default function Report({ sessionId }: ReportProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchReport = () => {
      try {
        // Get sample report data from localStorage
        const reportData = localStorage.getItem(`report-${sessionId}`);
        
        if (reportData) {
          const data = JSON.parse(reportData);
          setReport(data);
          console.log('Sample report loaded:', data);
        } else {
          throw new Error('No sample report data found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    // Simulate loading delay for realism
    setTimeout(() => {
      fetchReport();
    }, 500);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading compliance report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">Error loading report: {error}</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-yellow-700">No report available</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const downloadReport = () => {
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${sessionId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Compliance Assessment Report
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Generated: {formatDate(report.generated_at)}
              </div>
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                <a 
                  href={report.repository_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {report.repository_url}
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700 font-medium">Analysis Complete</span>
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {report.project_type}
          </span>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div 
            className="prose prose-lg max-w-none"
            style={{
              lineHeight: '1.6',
              fontSize: '14px'
            }}
          >
            <pre 
              className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed"
              style={{ 
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              {report.content}
            </pre>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Start New Analysis
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Export to PDF
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Share Report
          </button>
        </div>
      </div>
    </div>
  );
}