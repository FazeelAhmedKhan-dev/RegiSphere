// Sample report generator for demo purposes
export interface SampleReportData {
  content: string;
  generated_at: string;
  repository_url: string;
  project_type: string;
}

export function generateSampleReport(
  repositoryUrl: string,
  projectType: string = "Smart Contract",
  projectName: string = "Sample Project"
): SampleReportData {
  const currentDate = new Date().toISOString();
  
  const sampleContent = `# Compliance Assessment Report

## Executive Summary

This report provides a comprehensive compliance analysis of the ${projectName} project. Our automated analysis has identified several key areas for attention and provides actionable recommendations to ensure regulatory compliance.

**Overall Compliance Score: 78/100** ⭐⭐⭐⭐

## Project Information

- **Repository:** ${repositoryUrl}
- **Project Type:** ${projectType}
- **Analysis Date:** ${new Date().toLocaleDateString()}
- **Analysis Duration:** 2.3 minutes

## Key Findings

### ✅ Compliant Areas

1. **Data Privacy & Protection**
   - GDPR compliance mechanisms detected
   - User consent management implemented
   - Data encryption standards met
   - Score: 95/100

2. **Security Standards**
   - Input validation properly implemented
   - Authentication mechanisms secure
   - Access control measures in place
   - Score: 88/100

3. **Code Quality & Documentation**
   - Code follows industry best practices
   - Comprehensive documentation available
   - Version control properly maintained
   - Score: 92/100

### ⚠️ Areas Requiring Attention

1. **Financial Regulations (Medium Priority)**
   - Anti-money laundering (AML) checks need enhancement
   - Know Your Customer (KYC) procedures require documentation
   - Transaction monitoring could be improved
   - **Recommendation:** Implement enhanced AML/KYC procedures
   - Score: 65/100

2. **Audit Trail & Logging (Low Priority)**
   - Some user actions lack comprehensive logging
   - Audit trail retention period needs clarification
   - **Recommendation:** Enhance logging mechanisms for critical operations
   - Score: 70/100

### ❌ Critical Issues

1. **Regulatory Reporting (High Priority)**
   - Missing automated compliance reporting features
   - Regulatory filing mechanisms not implemented
   - **Action Required:** Implement automated regulatory reporting within 30 days
   - Score: 45/100

## Detailed Analysis

### Smart Contract Security
- **Reentrancy Protection:** ✅ Implemented
- **Integer Overflow Protection:** ✅ SafeMath usage detected
- **Access Control:** ✅ Role-based permissions in place
- **Emergency Pause:** ⚠️ Partially implemented
- **Upgrade Mechanism:** ✅ Proxy pattern detected

### Compliance Framework Alignment
- **SOX Compliance:** 72% aligned
- **GDPR Compliance:** 89% aligned
- **PCI DSS:** 81% aligned
- **ISO 27001:** 76% aligned

### Risk Assessment
- **High Risk:** 2 issues identified
- **Medium Risk:** 5 issues identified
- **Low Risk:** 8 issues identified
- **Total Issues:** 15

## Recommendations

### Immediate Actions (Next 7 days)
1. Implement missing regulatory reporting mechanisms
2. Enhance AML/KYC documentation
3. Review and update privacy policy

### Short-term Actions (Next 30 days)
1. Conduct third-party security audit
2. Implement comprehensive audit logging
3. Establish compliance monitoring dashboard

### Long-term Actions (Next 90 days)
1. Develop automated compliance testing suite
2. Establish regular compliance review process
3. Create compliance training program for team

## Compliance Checklist

- [x] Data protection measures implemented
- [x] Security standards met
- [x] Code quality standards followed
- [ ] Regulatory reporting mechanisms
- [ ] Enhanced AML/KYC procedures
- [x] Documentation standards met
- [ ] Comprehensive audit logging
- [x] Access control measures

## Next Steps

1. **Priority 1:** Address critical regulatory reporting gaps
2. **Priority 2:** Enhance financial compliance procedures
3. **Priority 3:** Improve audit trail mechanisms
4. **Priority 4:** Schedule follow-up assessment in 60 days

## Contact Information

For questions about this report or compliance assistance:
- Email: compliance@regisphere.com
- Phone: +1 (555) 123-4567
- Support Portal: https://support.regisphere.com

---

*This report was generated automatically by RegiSphere's AI-powered compliance analysis engine. For critical compliance decisions, please consult with qualified legal and compliance professionals.*

**Report ID:** RPT-${Date.now()}
**Generated:** ${new Date().toLocaleString()}
**Version:** 1.0`;

  return {
    content: sampleContent,
    generated_at: currentDate,
    repository_url: repositoryUrl,
    project_type: projectType
  };
}

export const samplePipelineSteps = [
  {
    id: "1",
    name: "Repository Analysis",
    status: "done" as const,
    message: "Successfully cloned and analyzed repository structure"
  },
  {
    id: "2", 
    name: "Code Security Scan",
    status: "done" as const,
    message: "Completed security vulnerability assessment"
  },
  {
    id: "3",
    name: "Compliance Framework Check",
    status: "done" as const,
    message: "Evaluated against GDPR, SOX, and industry standards"
  },
  {
    id: "4",
    name: "Risk Assessment",
    status: "done" as const,
    message: "Identified and categorized compliance risks"
  },
  {
    id: "5",
    name: "Report Generation",
    status: "done" as const,
    message: "Generated comprehensive compliance report"
  }
];