import React from 'react';
import { DollarSign, AlertTriangle, Handshake } from 'lucide-react';

export default function WhyItMatters() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why It Matters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Save Money */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Save Money</h3>
            <p className="text-gray-600 leading-relaxed">
              Avoid costly compliance violations and reduce legal consultation fees by catching issues early.
            </p>
          </div>

          {/* Avoid Fines */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Avoid Fines</h3>
            <p className="text-gray-600 leading-relaxed">
              Prevent regulatory penalties and sanctions that could damage your business reputation and finances.
            </p>
          </div>

          {/* Build Trust */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Handshake className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Build Trust</h3>
            <p className="text-gray-600 leading-relaxed">
              Demonstrate compliance readiness to investors, customers, and partners with confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}