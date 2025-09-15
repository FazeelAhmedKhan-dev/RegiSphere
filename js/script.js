// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeTabSwitching();
    initializeFileUpload();
    initializeNavigation();
    initializeDemoFunctionality();
});

// Tab Switching Functionality
function initializeTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// File Upload Functionality
function initializeFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadArea || !fileInput) return;
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#2563eb';
        uploadArea.style.backgroundColor = '#f8fafc';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#d1d5db';
        uploadArea.style.backgroundColor = 'white';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#d1d5db';
        uploadArea.style.backgroundColor = 'white';
        
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    });
    
    // Click to upload functionality
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFileUpload(files);
    });
}

// Handle File Upload
function handleFileUpload(files) {
    if (files.length === 0) return;
    
    // Show loading state
    showLoadingState();
    
    // Simulate file processing
    setTimeout(() => {
        showAnalysisResults();
    }, 3000);
    
    // Log file information
    console.log('Files uploaded:', files);
    for (let file of files) {
        console.log(`File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    }
}

// Repository Analysis
function analyzeRepo() {
    const repoUrl = document.getElementById('repo-url').value;
    
    if (!repoUrl) {
        alert('Please enter a repository URL');
        return;
    }
    
    if (!isValidGitHubUrl(repoUrl)) {
        alert('Please enter a valid GitHub repository URL');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Simulate repository analysis
    setTimeout(() => {
        showAnalysisResults();
    }, 4000);
    
    console.log('Analyzing repository:', repoUrl);
}

// Validate GitHub URL
function isValidGitHubUrl(url) {
    const githubPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    return githubPattern.test(url);
}

// Show Loading State
function showLoadingState() {
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) return;
    
    resultsSection.style.display = 'block';
    resultsSection.innerHTML = `
        <div class="container">
            <div class="loading-container" style="text-align: center; padding: 4rem 0;">
                <div class="loading-spinner" style="width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 2rem;"></div>
                <h2 style="color: #374151; margin-bottom: 1rem;">Analyzing Your Project</h2>
                <p style="color: #6b7280;">This may take a few moments while we scan for compliance issues...</p>
                <div class="progress-steps" style="margin-top: 2rem;">
                    <div class="progress-step active" style="display: inline-block; padding: 0.5rem 1rem; margin: 0 0.5rem; background: #2563eb; color: white; border-radius: 20px; font-size: 0.875rem;">Scanning Files</div>
                    <div class="progress-step" style="display: inline-block; padding: 0.5rem 1rem; margin: 0 0.5rem; background: #e5e7eb; color: #6b7280; border-radius: 20px; font-size: 0.875rem;">Checking Regulations</div>
                    <div class="progress-step" style="display: inline-block; padding: 0.5rem 1rem; margin: 0 0.5rem; background: #e5e7eb; color: #6b7280; border-radius: 20px; font-size: 0.875rem;">Generating Report</div>
                </div>
            </div>
        </div>
    `;
    
    // Add CSS animation for spinner
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Simulate progress
    setTimeout(() => {
        const steps = document.querySelectorAll('.progress-step');
        if (steps[1]) {
            steps[1].style.background = '#2563eb';
            steps[1].style.color = 'white';
        }
    }, 1500);
    
    setTimeout(() => {
        const steps = document.querySelectorAll('.progress-step');
        if (steps[2]) {
            steps[2].style.background = '#2563eb';
            steps[2].style.color = 'white';
        }
    }, 2500);
}

// Show Analysis Results
function showAnalysisResults() {
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) return;
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // The results are already in the HTML, just need to show the section
    resultsSection.style.display = 'block';
    
    // Reset the content to show the actual results
    location.reload(); // Simple way to reset to original content
    setTimeout(() => {
        const newResultsSection = document.getElementById('results-section');
        if (newResultsSection) {
            newResultsSection.style.display = 'block';
            newResultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// Download Report Functionality
function downloadReport(format) {
    const reportData = {
        overallScore: 72,
        passedChecks: 8,
        warnings: 3,
        criticalIssues: 2,
        categories: [
            {
                name: 'Data Privacy & Protection',
                status: 'Compliant',
                checks: [
                    { name: 'GDPR data encryption requirements met', status: 'passed' },
                    { name: 'User consent mechanisms implemented', status: 'passed' },
                    { name: 'Data retention policies defined', status: 'passed' }
                ]
            },
            {
                name: 'Security Standards',
                status: 'Warning',
                checks: [
                    { name: 'SSL/TLS encryption enabled', status: 'passed' },
                    { name: 'Password complexity requirements need improvement', status: 'warning' },
                    { name: 'Multi-factor authentication not implemented', status: 'warning' }
                ]
            },
            {
                name: 'Financial Regulations',
                status: 'Non-Compliant',
                checks: [
                    { name: 'PCI DSS compliance requirements not met', status: 'failed' },
                    { name: 'Anti-money laundering (AML) checks missing', status: 'failed' },
                    { name: 'Transaction logging incomplete', status: 'warning' }
                ]
            }
        ]
    };
    
    if (format === 'pdf') {
        // Simulate PDF download
        console.log('Downloading PDF report...', reportData);
        alert('PDF report download started! (This is a demo - actual PDF generation would be implemented on the backend)');
    } else if (format === 'csv') {
        // Generate and download CSV
        const csvContent = generateCSV(reportData);
        downloadCSV(csvContent, 'compliance-report.csv');
    }
}

// Generate CSV Content
function generateCSV(data) {
    let csv = 'Category,Check,Status\n';
    
    data.categories.forEach(category => {
        category.checks.forEach(check => {
            csv += `"${category.name}","${check.name}","${check.status}"\n`;
        });
    });
    
    return csv;
}

// Download CSV File
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Navigation Functionality
function initializeNavigation() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
}

// Demo Functionality
function initializeDemoFunctionality() {
    // Add click handlers for demo buttons
    const demoButtons = document.querySelectorAll('a[href="dashboard.html"]');
    
    demoButtons.forEach(button => {
        if (button.textContent.includes('Try Demo')) {
            button.addEventListener('click', (e) => {
                // If we're already on the dashboard page, show demo results
                if (window.location.pathname.includes('dashboard.html')) {
                    e.preventDefault();
                    showDemoResults();
                }
            });
        }
    });
}

// Show Demo Results
function showDemoResults() {
    // Simulate a demo file upload
    showLoadingState();
    
    setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 3000);
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidFileType(file) {
    const allowedTypes = [
        'application/javascript',
        'text/javascript',
        'text/x-python',
        'text/x-java-source',
        'text/x-c',
        'text/x-c++src',
        'application/typescript',
        'text/x-php',
        'text/x-ruby',
        'text/x-go',
        'text/x-rust',
        'text/x-swift',
        'text/x-kotlin'
    ];
    
    const allowedExtensions = [
        '.js', '.py', '.java', '.cpp', '.c', '.ts', '.jsx', '.tsx',
        '.php', '.rb', '.go', '.rs', '.swift', '.kt'
    ];
    
    return allowedTypes.includes(file.type) || 
           allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
});

// Console welcome message
console.log('%cWelcome to RegiSphere! 🚀', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('%cAI Compliance Copilot - Keeping your startup compliant!', 'color: #6b7280; font-size: 14px;');