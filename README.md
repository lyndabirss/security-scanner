# 🛡️ Security Scanner

AI-Powered Browser Extension for Web Application Security Testing

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-1.3.0-blue)
![AI](https://img.shields.io/badge/AI-Claude%204-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Problem → Solution

**Problem:** Manual security testing requires specialized expertise and takes hours per page.

**Solution:** One-click browser extension combining fast static analysis with AI-powered contextual intelligence.

**Result:** Critical vulnerabilities identified in <2 seconds with zero security expertise required.

### In Action

<table>
<tr>
<td align="center" valign="top"><b>Clean Site Detection</b></td>
<td align="center" valign="top"><b>Vulnerability Detection</b></td>
</tr>
<tr>
<td valign="top"><img src="docs/screenshots/Scanner_v1.1.1_Low_Premium.png" alt="Security Scanner v1.1.1 - LOW risk with premium pane"></td>
<td valign="top"><img src="docs/screenshots/Scanner_v1.1.1_Critical.png" alt="Security Scanner v1.1.1 - CRITICAL findings"></td>
</tr>
</table>

---

## ✨ Core Features

- 🔴 **Input Validation** - Detects weak form field validation
- 🔐 **Exposed Secrets** - Finds API keys, tokens, and credentials in page source
- 🛡️ **Security Headers** - Premium feature analyzing CSP, X-Frame-Options, HSTS
- 🎯 **Risk Scoring** - Traffic light system for instant priority assessment
- ⚠️ **Smart Severity** - Issues ranked CRITICAL → HIGH → MEDIUM → LOW
- 📤 **JSON Export** - RAG-friendly data export for analysis
- 🤖 **AI/LLM Detection** - Identifies AI providers with privacy context

---

## 🚨 Traffic Light Risk System

Instant visual priority assessment:

| Icon | Level | Action |
|------|-------|--------|
| ⚠️ | **CRITICAL** | Fix immediately - exploitable vulnerabilities |
| 🔴 | **HIGH** | Fix soon - significant security gaps |
| 🟠 | **MEDIUM** | Address - important issues to resolve |
| 🟢 | **LOW** | Minor issues or validation best practices |

---

## 🤖 AI/LLM Detection

Automatically identifies AI providers with privacy assessments:

| Provider | Trust Level | Privacy Status |
|----------|-------------|----------------|
| 🟢 **Anthropic (Claude)** | Trusted | Does not train on user data |
| 🟠 **OpenAI (ChatGPT)** | Known | May use data for training unless opted out |
| 🟠 **Google AI (Gemini)** | Known | Data usage governed by Google privacy policy |
| 🟠 **Cohere, Hugging Face** | Known | Check specific provider policies |

**What it shows:**
- Provider identification
- Data usage policies
- Privacy recommendations
- Trust level indicators

---

## 🚀 Get Started

1. Download or clone this repository
2. Open `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `src/` folder
6. Click the 🛡️ icon in your toolbar to scan

---

## 📊 Current Status

**Version 1.3.0** - Active Development

✅ Core security scanning operational  
✅ All detection modules working (input validation, secrets, headers)  
✅ AI provider detection with privacy assessments  
✅ JSON export for data analysis  
✅ Premium features preview implemented  
✅ UX improvements (sticky header, visual hierarchy)


---

## 📚 Documentation

- **[Design & Architecture](DESIGN.md)** - Technical approach and methodology
- **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Detailed installation guide

---

## 🎯 Project Goals

**Primary:** Demonstrate AI/ML integration in QA workflows  
**Secondary:** Create useful tool for security-conscious developers  
**Learning:** Apply Anthropic Academy course concepts in real project

---

## ⚖️ Ethical Use

**Acceptable:**
- ✅ Testing your own websites
- ✅ Testing with explicit permission
- ✅ Educational and research purposes
- ✅ Read-only analysis of public pages

**Prohibited:**
- ❌ Unauthorized penetration testing
- ❌ Exploitation of vulnerabilities
- ❌ Automated large-scale scanning
- ❌ Circumventing security controls

This tool is for responsible security assessment only.

---

## 📧 Contact

**Lynda M Birss**  
📱 [GitHub Profile](https://github.com/lyndabirss)

For inquiries, please reach out via GitHub.

---

## 🙏 Acknowledgments

- **Anthropic** for Claude API and Academy course
- **OWASP** for security testing methodologies
- **Open source security community** for vulnerability databases

---

*Personal project developed on personal time using personal resources for professional development.*

---

## 📄 License

**MIT License**

Copyright © 2025 Lynda M Birss

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
