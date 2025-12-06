# Security Scanner - Design Document

**Author:** Lynda M Birss  
**Created:** December 2025  
**Status:** Active Development  
**Project Type:** Personal Portfolio Project

---

## Executive Summary

AI-powered browser extension that provides instant, context-aware security analysis of web applications. Reduces security testing time from hours to seconds while requiring no specialized security expertise.

**Key Innovation:** Tiered analysis system that combines fast static checks with intelligent AI assessment, optimizing for both cost and performance while maintaining high accuracy.

---

## Problem Statement

### Current State
- Manual security testing requires deep expertise and significant time investment
- Automated scanners produce overwhelming lists of findings without context
- Security issues are often discovered late in development cycles
- QA teams lack tools to quickly assess security posture during testing
- Prioritization of security findings requires security expertise

### Pain Points
1. **Time-intensive:** Manual security reviews take hours per page
2. **Expertise barrier:** Understanding security implications requires specialized knowledge
3. **False positives:** Existing tools flag issues without understanding context
4. **Poor prioritization:** Equal weight given to critical and minor issues
5. **Lack of actionable guidance:** Tools identify problems but don't explain business impact

---

## Solution Overview

### Core Concept
A browser extension that analyzes web pages in real-time, combining static rule-based detection with AI-powered contextual analysis to provide prioritized, actionable security findings.

### Key Features
1. **Traffic Light Risk System:** Visual RED/AMBER/GREEN indicators for instant priority assessment
2. **Context-Aware Analysis:** AI understands page type (payment, login, blog) and adjusts severity accordingly
3. **Tiered Detection:** Fast static checks catch obvious issues, AI analyzes complex cases
4. **Actionable Results:** Each finding includes business impact and remediation guidance
5. **Zero Configuration:** One-click scanning, no setup required

### Target Users
- QA Engineers performing security testing
- Developers checking security before deployment
- Security teams doing quick assessments
- Product teams validating security posture

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Extension                        │
├─────────────────────────────────────────────────────────────┤
│  Popup UI           │  Content Script   │  Background Worker │
│  (Display Results)  │  (Scan Page)      │  (API Calls)       │
└─────────────────────┴───────────────────┴────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Page Analysis     │
                    │   - DOM Parsing     │
                    │   - Header Check    │
                    │   - Field Detection │
                    └──────────┬──────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Tier 1: Static     │
                    │  - Pattern matching │
                    │  - Binary checks    │
                    │  - Known signatures │
                    │  Cost: $0           │
                    │  Time: <100ms       │
                    └──────────┬──────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Tier 2: Context    │
                    │  - Page type        │
                    │  - Data sensitivity │
                    │  - Auth detection   │
                    │  Cost: $0           │
                    │  Time: ~50ms        │
                    └──────────┬──────────┘
                              │
                      ┌───────┴────────┐
                      │   Decision     │
                      │   Engine       │
                      └───────┬────────┘
                              │
                    ┌─────────┴─────────────┐
                    │                       │
              High Confidence         Low Confidence
              Clear Severity          Needs Analysis
                    │                       │
                    ▼                       ▼
            ┌──────────────┐      ┌─────────────────┐
            │ Display      │      │ Tier 3: Claude  │
            │ Results      │      │ - Context eval  │
            └──────────────┘      │ - Risk scoring  │
                                  │ - Correlation   │
                                  │ Cost: ~$0.02    │
                                  │ Time: ~2s       │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Merge & Display │
                                  └─────────────────┘
```

### Component Details

#### 1. Scanner Core
**Responsibilities:**
- Parse DOM structure
- Extract all input fields and forms
- Retrieve HTTP headers
- Identify page resources (scripts, iframes)
- Detect client-side code patterns

**Technology:**
- Vanilla JavaScript for performance
- Browser APIs (DOM, fetch, chrome.*)
- No external dependencies for core scanning

#### 2. Vulnerability Checker (Tier 1)
**Static Detection Rules:**

```javascript
{
  securityHeaders: {
    'Content-Security-Policy': { 
      severity: 'CRITICAL', 
      confidence: 'HIGH' 
    },
    'X-Frame-Options': { 
      severity: 'MEDIUM', 
      confidence: 'HIGH' 
    },
    'Strict-Transport-Security': { 
      severity: 'MEDIUM', 
      confidence: 'HIGH' 
    }
  },
  informationExposure: {
    apiKeysInHTML: { 
      severity: 'CRITICAL', 
      confidence: 'HIGH' 
    },
    debugMode: { 
      severity: 'HIGH', 
      confidence: 'HIGH' 
    },
    versionNumbers: { 
      severity: 'LOW', 
      confidence: 'MEDIUM' 
    }
  },
  inputValidation: {
    htmlInEmailField: { 
      severity: 'HIGH', 
      confidence: 'MEDIUM' 
    },
    scriptInTextField: { 
      severity: 'HIGH', 
      confidence: 'MEDIUM' 
    }
  }
}
```

**Detection Logic:**
- Binary checks: header present yes/no → HIGH confidence
- Pattern matching: regex for API keys, tokens → HIGH confidence
- Type validation: field accepts wrong data type → MEDIUM confidence

#### 3. Context Analyzer (Tier 2)
**Page Classification:**

```javascript
classifyPage(page) {
  // Financial context
  if (hasPaymentFields || url.includes('checkout')) {
    return { type: 'PAYMENT', sensitivity: 'HIGH' };
  }
  
  // Authentication context
  if (hasPasswordField || url.includes('login')) {
    return { type: 'AUTH', sensitivity: 'HIGH' };
  }
  
  // Administrative context
  if (url.includes('admin') || hasAdminIndicators) {
    return { type: 'ADMIN', sensitivity: 'HIGH' };
  }
  
  // General content
  return { type: 'GENERAL', sensitivity: 'LOW' };
}
```

**Context Application:**
- Adjusts severity based on page type
- Missing CSP: CRITICAL on payment page, MEDIUM on blog
- Informs Claude API prompt with relevant context

#### 4. AI Analyzer (Tier 3)
**When to Invoke:**
- Finding has MEDIUM or LOW confidence
- Multiple related findings need correlation
- High-sensitivity page with any findings
- User requests deep analysis mode

**Model Selection: Claude Sonnet 4**

**Rationale:**
- **Nuanced reasoning:** Understands context-dependent severity (e.g., missing CSP on payment page vs blog)
- **Speed:** ~2 second response time suitable for interactive tool
- **Cost-effective:** With prompt caching, ~$0.02 per scan vs $0.09 without optimization
- **Structured outputs:** Reliable JSON parsing for consistent results
- **Appropriate capability:** Balance between Haiku (too simple) and Opus (overkill for this task)

**Model Comparison:**
```
Haiku:  Fast & cheap, but lacks nuanced security context awareness
Sonnet: ⭐ Optimal - intelligent + fast + cost-effective
Opus:   Most capable, but unnecessary expense for this use case
```

**Claude API Integration:**

**System Prompt (Cached):**
```
You are a security analyst specializing in web application vulnerabilities.

VULNERABILITY DATABASE:
[18,000+ tokens of detailed rules, patterns, examples]

RISK ASSESSMENT FRAMEWORK:
Severity: CRITICAL | HIGH | MEDIUM | LOW
Consider:
- Exploitability
- Business impact
- Data sensitivity
- Existing mitigations

OUTPUT FORMAT:
Return valid JSON only, no markdown:
{
  "overallRisk": "HIGH|MEDIUM|LOW",
  "sections": [...],
  "findings": [...]
}
```

**User Prompt (Variable):**
```
Context: ${pageType} page, ${sensitivityLevel} data sensitivity

Static findings (high confidence):
${clearFindings}

Analyze these ambiguous findings:
${ambiguousFindings}

Assess:
1. Context-appropriate severity
2. Correlation between findings
3. Overall page risk
4. Remediation priority
```

**Optimization Strategies:**
- Prompt caching: System prompt cached for 5 minutes (97% cost reduction)
- Batching: All findings sent in single API call
- Structured output: JSON format for reliable parsing
- Token limit: Max 2000 tokens output to control cost

**Cost Model:**
- Cached system prompt: ~18,000 tokens × $0.003/1K = $0.054 (once per 5 min)
- Variable input: ~500 tokens × $0.003/1K = $0.0015
- Output: ~1500 tokens × $0.015/1K = $0.0225
- **Total per scan: ~$0.024 (with caching)**

---

## Risk Assessment Framework

### Traffic Light System

**Overall Page Risk:**
- 🔴 **RED (HIGH):** 1+ critical findings OR 3+ high findings on sensitive page
- 🟠 **AMBER (MEDIUM):** 1+ high findings OR 5+ medium findings
- 🟢 **GREEN (LOW):** Only low/info findings OR all checks passed

**Section Risk:**
- Highest individual finding within section determines section color
- Aggregates to overall via weighted scoring

**Finding Severity:**
- **CRITICAL:** Immediate exploitation possible, sensitive data at risk
- **HIGH:** Significant vulnerability, requires prompt remediation
- **MEDIUM:** Security weakness, should be addressed
- **LOW:** Best practice deviation, nice to fix

### Contextual Adjustment

**Page Type Impact:**
| Finding | Payment Page | Login Page | Blog Page |
|---------|-------------|------------|-----------|
| Missing CSP | CRITICAL | HIGH | MEDIUM |
| Debug Mode | CRITICAL | HIGH | MEDIUM |
| Weak X-Frame | HIGH | MEDIUM | LOW |

**Data Sensitivity Impact:**
- HIGH sensitivity: Upgrade severity by one level
- LOW sensitivity: Severity as assessed

---

## Data Flow

### Scanning Sequence

1. **User Trigger:** Click extension icon
2. **Page Analysis:** Content script scans active tab
3. **Static Detection:** Apply rule database (Tier 1)
4. **Context Detection:** Classify page type (Tier 2)
5. **Decision Point:** Assess if AI needed (Tier 3)
6. **If AI needed:**
   - Prepare batch prompt with context
   - Call Claude API (cached prompt)
   - Parse structured JSON response
7. **Merge Results:** Combine static + AI findings
8. **Calculate Risks:** Apply traffic light scoring
9. **Display:** Show hierarchical results in popup
10. **Export Option:** Generate HTML report

### Information Flow

```
DOM Content → Static Rules → Findings (70%)
                    ↓
              Page Context
                    ↓
         ┌──────────┴──────────┐
         │                     │
    HIGH Confidence      LOW Confidence
         │                     │
         ↓                     ↓
    Direct Display    → Claude API → AI Analysis
                                         ↓
                              Merged Complete Results
                                         ↓
                              Traffic Light Scoring
                                         ↓
                                    User Display
```

---

## Development Phases

### v1.0 - MVP (Current Focus)
**Timeline:** December 2025  
**Goal:** Working extension with core functionality

**Features:**
- Static vulnerability detection
- Claude API integration for analysis
- Traffic light risk indicators
- Basic HTML report export
- 4-page test suite

**Success Criteria:**
- ✅ Scans page in <3 seconds
- ✅ Detects 10+ vulnerability types
- ✅ 95%+ accuracy on test suite
- ✅ Cost <$0.05 per scan
- ✅ Professional UI/UX

**Technologies:**
- Browser Extension (Chrome/Firefox)
- Vanilla JavaScript
- Claude API (Sonnet 4)
- Local storage for settings

### v2.0 - Enhanced (Post-Course)
**Timeline:** Q1 2026  
**Goal:** Real-time vulnerability database integration

**Planned Features:**
- OWASP Top 10 integration
- CVE database lookups
- Mozilla Observatory API
- Trend analysis (emerging threats)
- Enhanced reporting

**Architecture Changes:**
- Plugin system for external sources
- Background updates (24hr cache)
- Offline fallback mode

**Academy Learnings Applied:**
- Advanced prompt engineering
- Structured outputs
- Multi-turn conversations
- Tool use patterns

### v3.0 - Future (Aspirational)
**Features:**
- Automated remediation suggestions
- Code generation for fixes
- CI/CD integration
- Team collaboration features
- Historical tracking

---

## Testing Strategy

### Test-Driven Approach

**Phase 1: Controlled Test Suite**

Create HTML test pages with known vulnerabilities:

1. **Payment Page (HIGH Risk)**
   - Missing Content-Security-Policy
   - Debug mode enabled
   - Email field accepts HTML
   - Expected: 🔴 HIGH, 3 critical findings

2. **Login Page (MEDIUM Risk)**
   - Weak X-Frame-Options
   - No minimum password length
   - Missing rate limiting indicators
   - Expected: 🟠 MEDIUM, 3 medium findings

3. **Blog Page (LOW Risk)**
   - Missing CSP (but lower severity context)
   - All other checks pass
   - Expected: 🟠 MEDIUM, 1 medium finding

4. **Secure Page (GREEN)**
   - All security headers present
   - Proper validation
   - No exposed data
   - Expected: 🟢 LOW, 0 critical/high findings

**Validation Criteria:**
- Detected risk matches expected risk
- All known vulnerabilities identified
- No false positives
- Context correctly applied
- Consistent results across scans

**Phase 2: Real-World Validation**

Once test suite passes:
- Scan 30+ production websites
- Compare against known security assessments
- Measure detection accuracy
- Benchmark performance
- Identify edge cases

**Success Metrics:**
- Detection rate: >95% for known issues
- False positive rate: <5%
- Scan time: <3s average
- Cost: <$0.05 per complex scan

---

## Cost Optimization

### Efficiency Strategies

**1. Prompt Caching**
- System prompt cached for 5 minutes
- 18,000 tokens shared across scans
- First scan: $0.054, subsequent: $0.0015
- **Savings: 97% for repeated scans**

**2. Tiered Analysis**
- 70% of findings resolved statically (free)
- Only ambiguous cases sent to AI
- Average: 3-5 findings need AI per page
- **Savings: 70% vs analyzing everything**

**3. Batched Processing**
- Single API call per scan
- All findings analyzed together
- Reduced overhead
- **Savings: 80% vs per-finding calls**

**4. Structured Outputs**
- JSON format, no markdown
- Predictable response length
- Easy parsing, no retry logic
- **Savings: 20-30% fewer tokens**

### Cost Projections

**Development Phase (MVP):**
- Anthropic free tier: $5 credit
- ~200 scans with optimization
- Sufficient for POC and demos

**Personal Use:**
- 10 scans/day × $0.02 = $0.20/day
- Monthly: ~$6
- Easily within personal budget

**Productionization Options:**
1. **BYOK Model:** Users provide API key
2. **Freemium:** 10 free scans/day, paid for more
3. **Enterprise:** Bulk API credits

---

## Security & Privacy

### User Data Handling

**What is collected:**
- Page URL (for context)
- DOM structure (locally analyzed)
- HTTP headers (publicly accessible)
- Scan results (stored locally only)

**What is NOT collected:**
- User credentials
- Form data contents
- Personal information
- Cookies or session tokens

**Data sent to Claude API:**
- Anonymized findings only
- No PII or sensitive data
- Page type classification
- Vulnerability descriptions

**Storage:**
- Local browser storage only
- Optional cloud export by user
- No analytics or tracking

### Ethical Use

**Acceptable Use:**
- ✅ Testing pages you own or have permission to test
- ✅ Testing publicly accessible pages (read-only analysis)
- ✅ Educational and research purposes
- ✅ Security assessments with authorization

**Prohibited Use:**
- ❌ Unauthorized penetration testing
- ❌ Exploitation of discovered vulnerabilities
- ❌ Automated scanning of large numbers of sites
- ❌ Circumventing security controls

---

## Success Metrics

### Technical Metrics
- **Accuracy:** >95% detection rate
- **Performance:** <3s scan time
- **Cost Efficiency:** <$0.05 per scan
- **Reliability:** <1% error rate

### User Experience Metrics
- **Clarity:** Results understandable without security expertise
- **Actionability:** Clear next steps for each finding
- **Efficiency:** Faster than manual review
- **Confidence:** Trust in risk assessments

### Business Value Metrics
- **Time Savings:** 95% reduction vs manual security review
- **Coverage:** 10+ vulnerability categories
- **Accessibility:** Usable by non-security specialists
- **Integration:** Works in existing QA workflows

---

## Future Extensibility

### Plugin Architecture

**Design for v2 enhancements:**

```javascript
class VulnerabilityChecker {
  constructor() {
    this.sources = [];
  }
  
  registerSource(source) {
    // v1: StaticRulesSource
    // v2: OWASPSource, CVESource, MozillaSource
    this.sources.push(source);
  }
  
  async check(findings) {
    // All sources contribute to analysis
  }
}
```

**Planned External Sources:**
- OWASP Top 10 (static JSON, updated annually)
- NVD/CVE (API, daily updates)
- Mozilla Observatory (API, real-time)
- CWE Database (static, periodic updates)

**Benefits:**
- Add sources without core rewrite
- Graceful degradation if source unavailable
- Version-controlled source data
- A/B test source effectiveness

---

## Intellectual Property

**Copyright © 2025 Lynda M Birss**

**License:** MIT License

**Ownership Statement:**
This project was developed entirely:
- On personal time
- Using personal resources
- On personal hardware
- For personal portfolio purposes
- Not affiliated with any employer

**Attribution Required:**
Any use, modification, or distribution must include:
- Copyright notice
- License text
- Attribution to original author

**Commercial Use:**
Permitted under MIT License with attribution

---

## Conclusion

This security scanner addresses a real gap in the QA tooling ecosystem: accessible, context-aware security testing that doesn't require specialized expertise. The tiered analysis architecture demonstrates both technical sophistication and practical cost optimization.

The project showcases:
- **QA Methodology:** Test-driven development with controlled test suite
- **AI Integration:** Intelligent use of LLMs where they add value
- **System Design:** Extensible architecture for future growth
- **Cost Awareness:** Production-ready optimization strategies
- **Professional Approach:** Comprehensive documentation and planning

**Next Steps:**
1. Implement MVP core functionality
2. Validate against test suite
3. Real-world production testing
4. Apply Anthropic Academy learnings
5. Plan v2 enhancements

---

**Document Version:** 1.1  
**Last Updated:** December 6, 2025  
**Status:** Living document - updated as project evolves