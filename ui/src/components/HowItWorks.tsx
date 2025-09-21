import React from 'react';
import { FileText, Puzzle, Search, Scale, ClipboardList } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: FileText,
      title: "Collect Rules",
      description: "We gather the latest compliance regulations from multiple jurisdictions and regulatory bodies."
    },
    {
      icon: Puzzle,
      title: "Simplify Rules",
      description: "Our AI breaks down complex legal language into actionable, understandable requirements."
    },
    {
      icon: Search,
      title: "Scan Project",
      description: "Advanced algorithms analyze your codebase, contracts, and business processes thoroughly."
    },
    {
      icon: Scale,
      title: "Compare",
      description: "We match your current practices against regulatory requirements to identify gaps."
    },
    {
      icon: ClipboardList,
      title: "Report",
      description: "Get a comprehensive compliance report with actionable recommendations and risk assessments."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center">
                {/* Blue circular icon */}
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                
                {/* Step title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                
                {/* Step description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;