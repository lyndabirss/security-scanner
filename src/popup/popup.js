/**
 * Security Scanner - Popup Script
 * Copyright (c) 2025 Lynda M Birss
 * Version: 1.1.1
 * 
 * Security Measures:
 * - Input sanitization: All data from content scripts is sanitized before display
 *   Reason: Security tool displaying untrusted page data must prevent XSS
 * - Message validation: Verify message structure and sender
 *   Reason: Prevent malicious pages from abusing extension functionality
 */

// Get version from manifest
const VERSION = chrome.runtime.getManifest().version;

document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scanButton');
    const resultsDiv = document.getElementById('results');
    const statusCard = document.querySelector('.status');
    
    scanButton.addEventListener('click', performScan);
    
    async function performScan() {
        // Disable button immediately
        scanButton.disabled = true;
        scanButton.textContent = 'Scanning...';
        
        // Show results area
        resultsDiv.classList.remove('hidden');
        resultsDiv.innerHTML = '<p>🔍 Analyzing page inputs and validation...</p>';
        
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Check if we can scan this page type
            const pageCheck = canScanPage(tab.url);
            if (!pageCheck.canScan) {
                resultsDiv.innerHTML = `
                    <div style="text-align: center; color: #ea580c; padding: 20px;">
                        <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
                        <p style="font-weight: bold; font-size: 15px; margin-bottom: 8px;">Cannot Scan This Page</p>
                        <p style="font-size: 13px; color: #666; line-height: 1.5;">
                            ${pageCheck.reason}
                        </p>
                        <p style="font-size: 12px; color: #666; margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 6px;">
                            <strong>Tip:</strong> Navigate to a website (like bbc.co.uk) to scan for vulnerabilities.
                        </p>
                    </div>
                `;
                resetButton();
                return;
            }
            
            // Send scan request to content script
            chrome.tabs.sendMessage(tab.id, { action: 'scanPage' }, (response) => {
                if (chrome.runtime.lastError) {
                    resultsDiv.innerHTML = `
                        <div style="text-align: center; color: #dc2626; padding: 20px;">
                            <div style="font-size: 48px; margin-bottom: 12px;">❌</div>
                            <p style="font-weight: bold; font-size: 15px; margin-bottom: 8px;">Connection Error</p>
                            <p style="font-size: 13px; color: #666; margin-bottom: 12px;">
                                Could not communicate with page.
                            </p>
                            <p style="font-size: 12px; color: #666; background: #fef2f2; padding: 12px; border-radius: 6px; text-align: left;">
                                <strong>Common causes:</strong><br>
                                • Page loaded before extension was installed<br>
                                • Security restrictions on this site<br>
                                • Network connectivity issues
                            </p>
                            <p style="font-size: 11px; color: #666; margin-top: 12px;">
                                <strong>Solution:</strong> Try refreshing the page (Cmd+R or F5)
                            </p>
                        </div>
                    `;
                    resetButton();
                    return;
                }
                
                // Validate response structure
                if (!isValidScanResponse(response)) {
                    console.error('Invalid scan response structure:', response);
                    resultsDiv.innerHTML = `
                        <div style="text-align: center; color: #dc2626;">
                            <p><strong>Invalid Response</strong></p>
                            <p style="font-size: 12px;">Scan data validation failed</p>
                        </div>
                    `;
                    resetButton();
                    return;
                }
                
                if (response && response.success) {
                    displayResults(response.data);
                    // Show action bar after scan completes
                    showActionBar();
                } else {
                    const errorMsg = sanitizeText(response?.error || 'Unknown error');
                    resultsDiv.innerHTML = `
                        <div style="text-align: center; color: #dc2626;">
                            <p><strong>Scan Failed</strong></p>
                            <p style="font-size: 12px;">${errorMsg}</p>
                        </div>
                    `;
                    resetButton();
                }
            });
        } catch (error) {
            const errorMsg = sanitizeText(error.message);
            resultsDiv.innerHTML = `
                <div style="text-align: center; color: #dc2626;">
                    <p><strong>Error:</strong></p>
                    <p style="font-size: 12px;">${errorMsg}</p>
                </div>
            `;
            resetButton();
        }
    }
    
    /**
     * Check if we can scan this type of page
     * Security: Detect restricted pages before attempting scan
     */
    function canScanPage(url) {
        if (!url) {
            return { 
                canScan: false, 
                reason: 'No URL detected. Please navigate to a website first.' 
            };
        }
        
        // Chrome internal pages
        if (url.startsWith('chrome://') || 
            url.startsWith('chrome-extension://') ||
            url.startsWith('about:')) {
            return { 
                canScan: false, 
                reason: 'Extension cannot access browser internal pages (new tabs, settings, chrome:// pages).' 
            };
        }
        
        // Edge internal pages
        if (url.startsWith('edge://')) {
            return { 
                canScan: false, 
                reason: 'Extension cannot access browser internal pages.' 
            };
        }
        
        // Chrome Web Store
        if (url.includes('chrome.google.com/webstore')) {
            return { 
                canScan: false, 
                reason: 'Chrome Web Store pages cannot be scanned for security reasons.' 
            };
        }
        
        // Local files (might work, but warn)
        if (url.startsWith('file://')) {
            return { 
                canScan: true, 
                reason: '' 
            };
        }
        
        // Regular websites - good to scan!
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return { 
                canScan: true, 
                reason: '' 
            };
        }
        
        // Unknown protocol
        return { 
            canScan: false, 
            reason: 'Unknown page type. Only HTTP/HTTPS websites can be scanned.' 
        };
    }
    
    /**
     * Show action bar after scan completes
     */
    function showActionBar() {
        // Hide initial status card to save space
        if (statusCard) {
            statusCard.style.display = 'none';
        }
        
        // Hide initial scan button
        scanButton.style.display = 'none';
        
        // Remove any existing action bar first
        const existingBar = document.querySelector('.action-bar');
        if (existingBar) {
            existingBar.remove();
        }
        
        // Create and show action bar at bottom
        const actionBar = createActionBar();
        resultsDiv.insertAdjacentElement('afterend', actionBar);
        
        // Setup button handlers
        document.getElementById('scanAgainBtn').addEventListener('click', () => {
            // Remove action bar
            actionBar.remove();
            
            // Reset UI
            statusCard.style.display = 'block';
            scanButton.style.display = 'block';
            resultsDiv.innerHTML = '';
            resultsDiv.classList.add('hidden');
            
            // AUTO-TRIGGER NEW SCAN
            performScan();
        });
        
        // Setup custom tooltips
        setupCustomTooltips();
        
        // Future buttons will be wired up here as features are added
        // document.getElementById('exportBtn').addEventListener('click', exportReport);
        // document.getElementById('settingsBtn').addEventListener('click', openSettings);
        // document.getElementById('helpBtn').addEventListener('click', showHelp);
    }
    
    /**
     * Setup custom instant tooltips
     */
    function setupCustomTooltips() {
        const tooltipButtons = document.querySelectorAll('[data-tooltip]');
        
        tooltipButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = button.getAttribute('data-tooltip');
                document.body.appendChild(tooltip);
                
                // Position tooltip above button
                const rect = button.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
                
                // Store reference for removal
                button._tooltip = tooltip;
            });
            
            button.addEventListener('mouseleave', (e) => {
                if (button._tooltip) {
                    button._tooltip.remove();
                    button._tooltip = null;
                }
            });
        });
    }
    
    /**
     * Create action bar with buttons
     */
    function createActionBar() {
        const actionBar = document.createElement('div');
        actionBar.className = 'action-bar';
        actionBar.innerHTML = `
            <button id="scanAgainBtn" class="action-btn primary">
                🔄 Scan Again
            </button>
            <button id="exportBtn" class="action-btn secondary disabled" disabled data-tooltip="Available in v1.1">
                📄 Export
            </button>
            <button id="settingsBtn" class="action-btn secondary disabled" disabled data-tooltip="Available in v1.1">
                ⚙️ Settings
            </button>
            <button id="helpBtn" class="action-btn secondary disabled" disabled data-tooltip="Coming soon">
                ℹ️ Help
            </button>
        `;
        return actionBar;
    }
    
    function resetButton() {
        scanButton.textContent = 'Scan This Page';
        scanButton.disabled = false;
    }
    
    /**
     * Validate scan response structure
     * Security: Ensure response matches expected format before processing
     */
    function isValidScanResponse(response) {
        if (!response || typeof response !== 'object') return false;
        if (!response.success) return true; // Error responses are valid
        if (!response.data || typeof response.data !== 'object') return false;
        
        const data = response.data;
        
        // Validate required fields exist
        if (!data.pageInfo || typeof data.pageInfo !== 'object') return false;
        if (!data.pageType || typeof data.pageType !== 'string') return false;
        if (!Array.isArray(data.inputs)) return false;
        if (!data.vulnerabilities || typeof data.vulnerabilities !== 'object') return false;
        
        return true;
    }
    
    /**
     * Sanitize text content - removes all HTML tags
     * Security: Prevent XSS from malicious page content
     */
    function sanitizeText(text) {
        if (typeof text !== 'string') return '';
        // Remove all HTML tags
        return text.replace(/<[^>]*>/g, '');
    }
    
    /**
     * Sanitize HTML while preserving safe formatting
     * Security: Allow only specific safe HTML elements
     */
    function sanitizeHTML(html) {
        if (typeof html !== 'string') return '';
        
        // Create a temporary div to parse HTML
        const temp = document.createElement('div');
        temp.textContent = html; // This escapes all HTML
        
        return temp.innerHTML;
    }
    
    /**
     * Sanitize and validate vulnerability severity
     * Security: Ensure severity is from expected set
     */
    function sanitizeSeverity(severity) {
        const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        const upper = String(severity).toUpperCase();
        return validSeverities.includes(upper) ? upper : 'UNKNOWN';
    }
    
    /**
     * Sanitize page type
     * Security: Ensure page type is from expected set
     */
    function sanitizePageType(pageType) {
        const validTypes = ['PAYMENT', 'LOGIN', 'ADMIN', 'GENERAL'];
        const upper = String(pageType).toUpperCase();
        return validTypes.includes(upper) ? upper : 'UNKNOWN';
    }
    
    /**
     * Get severity icon (dot)
     */
    function getSeverityIcon(severity) {
        const icons = {
            'CRITICAL': '⚠️',
            'HIGH': '🔴',
            'MEDIUM': '🟠',
            'LOW': '🟢',
            'UNKNOWN': '⚪'
        };
        return icons[severity] || '⚪';
    }
    
    /**
     * Get severity color
     */
    function getSeverityColor(severity) {
        const colors = {
            'CRITICAL': '#dc2626',
            'HIGH': '#dc2626',
            'MEDIUM': '#ea580c',
            'LOW': '#3b82f6',
            'UNKNOWN': '#666'
        };
        return colors[severity] || '#666';
    }
    
    /**
     * Display scan results with sanitization
     * Security: All displayed data is sanitized before rendering
     */
    function displayResults(data) {
        // Sanitize all input data
        const pageType = sanitizePageType(data.pageType);
        const totalIssues = parseInt(data.totalIssues) || 0;
        
        // Sanitize vulnerability counts
        const vulns = {
            critical: parseInt(data.vulnerabilities?.critical) || 0,
            high: parseInt(data.vulnerabilities?.high) || 0,
            medium: parseInt(data.vulnerabilities?.medium) || 0,
            low: parseInt(data.vulnerabilities?.low) || 0
        };
        
        const inputCount = Array.isArray(data.inputs) ? data.inputs.length : 0;
        const formCount = parseInt(data.pageInfo?.formCount) || 0;
        
        // Determine overall risk
        let riskLevel = 'LOW';
        let riskColor = '#22c55e';
        let riskIcon = '🟢';
        
        if (vulns.critical > 0) {
            riskLevel = 'CRITICAL';
            riskColor = '#dc2626';
            riskIcon = '⚠️'; // Warning triangle like scanner output
        } else if (vulns.high > 0) {
            riskLevel = 'HIGH';
            riskColor = '#dc2626';
            riskIcon = '🔴';
        } else if (vulns.medium > 0) {
            riskLevel = 'MEDIUM';
            riskColor = '#ea580c';
            riskIcon = '🟠';
        }
        
        let html = `
            <div style="margin-bottom: 15px; padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 4px solid ${riskColor};">
                <div style="font-size: 24px; text-align: center; margin-bottom: 8px;">${riskIcon}</div>
                <div style="text-align: center;">
                    <strong style="color: ${riskColor}; font-size: 16px;">Risk Level: ${riskLevel}</strong>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                        Page Type: ${pageType}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-around; margin-bottom: 15px; font-size: 13px;">
                <div style="text-align: center;">
                    <div style="font-weight: bold; font-size: 18px; color: #dc2626;">${vulns.critical + vulns.high}</div>
                    <div style="font-size: 11px;">Critical/High</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-weight: bold; font-size: 18px; color: #ea580c;">${vulns.medium}</div>
                    <div style="font-size: 11px;">Medium</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-weight: bold; font-size: 18px; color: #3b82f6;">${vulns.low}</div>
                    <div style="font-size: 11px;">Low</div>
                </div>
            </div>
            
            <div style="font-size: 13px; margin-bottom: 10px;">
                <strong>Page Info:</strong>
                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    • ${inputCount} input field${inputCount !== 1 ? 's' : ''} detected<br>
                    • ${formCount} form${formCount !== 1 ? 's' : ''}<br>
                    • ${totalIssues} validation issue${totalIssues !== 1 ? 's' : ''} found
                </div>
            </div>
        `;
        
        // Show all findings with sanitization - single scroll experience
        if (totalIssues > 0) {
            html += `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <strong style="font-size: 13px;">Issues Found (${totalIssues}):</strong>
                <div style="margin-top: 8px;">
            `;
            
            // Combine all issues into one array for sorting
            const allIssues = [];
            
            // NOTE: Header issues NOT included - they're behind PREMIUM feature
            // Content scripts can't reliably detect HTTP headers
            // Only meta tags are detectable, but those are rare
            
            // Add secret issues
            if (Array.isArray(data.secretIssues)) {
                data.secretIssues.forEach(issue => {
                    allIssues.push({
                        type: 'secret',
                        severity: sanitizeSeverity(issue.severity),
                        issue: sanitizeText(issue.issue || 'Unknown issue'),
                        description: sanitizeText(issue.description || ''),
                        data: issue
                    });
                });
            }
            
            // Add input validation issues
            if (Array.isArray(data.inputs)) {
                data.inputs.forEach(input => {
                    if (Array.isArray(input.validationIssues)) {
                        input.validationIssues.forEach(issue => {
                            allIssues.push({
                                type: 'input',
                                severity: sanitizeSeverity(issue.severity),
                                issue: sanitizeText(issue.issue || 'Unknown issue'),
                                description: sanitizeText(issue.description || ''),
                                fieldName: sanitizeText(input.name || input.id || 'unknown'),
                                fieldType: sanitizeText(input.type || 'unknown'),
                                data: issue
                            });
                        });
                    }
                });
            }
            
            // Sort by severity: CRITICAL > HIGH > MEDIUM > LOW
            const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'UNKNOWN': 4 };
            allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
            
            // Track if we've shown premium indicator
            let premiumShown = false;
            
            // Display ALL issues (removed 5-item limit)
            for (const item of allIssues) {
                
                // Show PREMIUM indicator after CRITICAL/HIGH, before MEDIUM
                if (!premiumShown && (item.severity === 'MEDIUM' || item.severity === 'LOW')) {
                    // Always show premium pane with consistent bullet point list
                    html += `
                        <div style="margin-top: 12px; padding: 12px; background: linear-gradient(135deg, #fde047 0%, #fcd34d 100%); border-radius: 6px; border-left: 4px solid #d97706;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span style="font-size: 20px;">⭐</span>
                                <strong style="color: #78350f; font-size: 12px;">PREMIUM FEATURE - Security Headers Analysis</strong>
                            </div>
                            <div style="margin-left: 12px; margin-bottom: 8px;">
                                <div style="margin-bottom: 4px; font-size: 11px; color: #78350f;">• Content-Security-Policy</div>
                                <div style="margin-bottom: 4px; font-size: 11px; color: #78350f;">• X-Content-Type-Options</div>
                                <div style="margin-bottom: 4px; font-size: 11px; color: #78350f;">• X-Frame-Options</div>
                                <div style="margin-bottom: 4px; font-size: 11px; color: #78350f;">• HSTS and more</div>
                            </div>
                            <div style="color: #78350f; font-size: 10px; font-weight: 600; cursor: not-allowed; opacity: 0.7;" title="Coming in version 2.0">
                                Upgrade to see full analysis and recommendations · Available in v2.0
                            </div>
                        </div>
                    `;
                    premiumShown = true;
                }
                
                const severityColor = getSeverityColor(item.severity);
                
                // Display based on issue type
                if (item.type === 'secret') {
                    // Secrets get yellow background with warning icon
                    html += `
                        <div style="margin-top: 8px; padding: 8px; background: #fff3cd; border-radius: 4px; font-size: 11px; border-left: 3px solid ${severityColor};">
                            <div style="font-weight: bold; color: ${severityColor}; margin-bottom: 4px;">
                                ⚠️ ${item.severity}: ${item.issue}
                            </div>
                            <div style="color: #666;">
                                ${item.description}
                            </div>
                        </div>
                    `;
                } else if (item.type === 'input') {
                    // Input validation issues show field info
                    html += `
                        <div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 4px; font-size: 11px;">
                            <div style="font-weight: bold; color: ${severityColor}; margin-bottom: 4px;">
                                ${item.severity}: ${item.issue}
                            </div>
                            <div style="color: #666;">
                                Field: ${item.fieldName} (${item.fieldType})<br>
                                ${item.description}
                            </div>
                        </div>
                    `;
                } else {
                    // Header and other issues
                    html += `
                        <div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 4px; font-size: 11px;">
                            <div style="font-weight: bold; color: ${severityColor}; margin-bottom: 4px;">
                                ${item.severity}: ${item.issue}
                            </div>
                            <div style="color: #666;">
                                ${item.description}
                            </div>
                        </div>
                    `;
                }
            }
            
            html += `</div></div>`; // Close scrollable container and Issues Found section
        } else {
            html += `<div style="text-align: center; color: #22c55e; margin-top: 12px; padding: 12px; background: #f0fdf4; border-radius: 6px;">
                <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
                <strong>No Issues Found!</strong>
                <div style="font-size: 11px; margin-top: 4px;">All input fields have proper validation</div>
            </div>
            
            <div style="margin-top: 12px; padding: 12px; background: linear-gradient(135deg, #fde047 0%, #fcd34d 100%); border-radius: 6px; border-left: 4px solid #d97706;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">⭐</span>
                    <strong style="color: #78350f; font-size: 12px;">PREMIUM FEATURE - Security Headers Analysis</strong>
                </div>
                <div style="margin-left: 12px; margin-bottom: 8px;">
                    <div style="margin-bottom: 4px; font-size: 11px; color: #78350f;">• Content-Security-Policy</div>
                    <div style="margin-bottom: 4px; font-size: 11px; color: #78350f;">• X-Content-Type-Options</div>
                    <div style="margin-bottom: 4px; font-size: 11px; color: #78350f;">• X-Frame-Options</div>
                    <div style="margin-bottom: 4px; font-size: 11px; color: #78350f;">• HSTS and more</div>
                </div>
                <div style="color: #78350f; font-size: 10px; font-weight: 600; cursor: not-allowed; opacity: 0.7;" title="Coming in version 2.0">
                    Upgrade to see full analysis and recommendations · Available in v2.0
                </div>
            </div>`;
        }
        
        resultsDiv.innerHTML = html;
    }
    
    console.log(`Security Scanner v${VERSION} popup loaded`);
});
