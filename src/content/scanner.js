/**
 * Security Scanner - Content Script
 * Copyright (c) 2025 Lynda M Birss
 * Version: 1.0.0
 * 
 * Security Measures:
 * - Message validation: Verify all incoming messages from popup
 *   Reason: Prevent malicious scripts from triggering scans or exploiting extension
 * - Data sanitization: Clean all extracted page data before sending
 *   Reason: Prevent injection attacks through scan results
 */

(function() {
    'use strict';
    
    // Get version from manifest
    const VERSION = chrome.runtime.getManifest().version;
    
    console.log(`Security Scanner v${VERSION} loaded on: ${window.location.href}`);
    
    /**
     * Get comprehensive page information
     * Security: Sanitize all extracted data
     */
    function getPageInfo() {
        return {
            url: sanitizeURL(window.location.href),
            title: sanitizeText(document.title),
            protocol: window.location.protocol,
            formCount: Math.max(0, document.forms.length),
            inputCount: Math.max(0, document.querySelectorAll('input').length),
            scriptCount: Math.max(0, document.scripts.length),
            iframeCount: Math.max(0, document.querySelectorAll('iframe').length)
        };
    }
    
    /**
     * Sanitize URL - remove potential XSS vectors
     * Security: Ensure URL is safe to display
     */
    function sanitizeURL(url) {
        try {
            const parsed = new URL(url);
            // Only allow http/https/file protocols
            if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) {
                return 'about:blank';
            }
            return url.substring(0, 200); // Limit length
        } catch (e) {
            return 'invalid-url';
        }
    }
    
    /**
     * Sanitize text content
     * Security: Remove potential XSS vectors
     */
    function sanitizeText(text) {
        if (typeof text !== 'string') return '';
        // Limit length and remove control characters
        return text
            .substring(0, 500)
            .replace(/[<>\"']/g, '')
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    }
    
    /**
     * Detect all input fields and their properties
     * Security: Sanitize all extracted attributes
     */
    function detectInputFields() {
        const inputs = document.querySelectorAll('input');
        const inputData = [];
        
        // Limit number of inputs processed to prevent DoS
        const MAX_INPUTS = 100;
        const inputsToProcess = Math.min(inputs.length, MAX_INPUTS);
        
        for (let index = 0; index < inputsToProcess; index++) {
            const input = inputs[index];
            
            const fieldInfo = {
                index: index,
                type: sanitizeText(input.type || 'text'),
                name: sanitizeText(input.name || 'unnamed'),
                id: sanitizeText(input.id || `input-${index}`),
                placeholder: sanitizeText(input.placeholder || ''),
                required: Boolean(input.required),
                pattern: input.pattern ? sanitizeText(input.pattern.substring(0, 100)) : null,
                minLength: validateNumber(input.minLength, 0, 1000),
                maxLength: validateNumber(input.maxLength, 0, 10000),
                min: input.min ? sanitizeText(input.min) : null,
                max: input.max ? sanitizeText(input.max) : null,
                autocomplete: input.autocomplete ? sanitizeText(input.autocomplete) : null,
                validationIssues: []
            };
            
            // Test validation weaknesses
            fieldInfo.validationIssues = testInputValidation(input, fieldInfo);
            
            inputData.push(fieldInfo);
        }
        
        return inputData;
    }
    
    /**
     * Validate and sanitize numeric input
     * Security: Ensure numbers are within expected range
     */
    function validateNumber(value, min, max) {
        const num = parseInt(value);
        if (isNaN(num)) return null;
        if (num < min || num > max) return null;
        return num;
    }
    
    /**
     * Test input field for validation weaknesses
     */
    function testInputValidation(input, fieldInfo) {
        const issues = [];
        
        // Test 1: Number fields that don't restrict input properly
        if (fieldInfo.type === 'number') {
            if (!input.pattern && !input.min && !input.max) {
                issues.push({
                    severity: 'MEDIUM',
                    issue: 'Number field lacks validation constraints',
                    description: 'No pattern, min, or max attributes set'
                });
            }
        }
        
        // Test 2: Email fields without proper validation
        if (fieldInfo.type === 'email') {
            if (!input.pattern) {
                issues.push({
                    severity: 'LOW',
                    issue: 'Email field relies on browser validation only',
                    description: 'No custom pattern for email validation'
                });
            }
        }
        
        // Test 3: Password fields without minimum length
        if (fieldInfo.type === 'password') {
            if (!input.minLength && !input.pattern) {
                issues.push({
                    severity: 'MEDIUM',
                    issue: 'Password field has no minimum length requirement',
                    description: 'Could accept weak passwords'
                });
            }
            if (input.minLength && input.minLength < 8) {
                issues.push({
                    severity: 'MEDIUM',
                    issue: `Weak password minimum length (${input.minLength})`,
                    description: 'Best practice is minimum 8 characters'
                });
            }
        }
        
        // Test 4: Text inputs that might accept scripts
        if (fieldInfo.type === 'text' || fieldInfo.type === '') {
            if (!input.pattern && !input.maxLength) {
                issues.push({
                    severity: 'LOW',
                    issue: 'Text field lacks input constraints',
                    description: 'No pattern or maxLength limits what can be entered'
                });
            }
        }
        
        // Test 5: Sensitive fields without autocomplete=off
        const sensitiveTypes = ['password', 'credit-card', 'card-number', 'cvv'];
        const fieldText = (fieldInfo.type + fieldInfo.name + fieldInfo.id).toLowerCase();
        const isSensitive = sensitiveTypes.some(type => fieldText.includes(type));
        
        if (isSensitive && fieldInfo.autocomplete !== 'off') {
            issues.push({
                severity: 'MEDIUM',
                issue: 'Sensitive field allows autocomplete',
                description: 'autocomplete should be "off" for sensitive data'
            });
        }
        
        return issues;
    }
    
    /**
     * Detect page type based on inputs and content
     * Security: Sanitize all text used in detection
     */
    function detectPageType(inputs) {
        const fieldNames = inputs
            .map(i => sanitizeText((i.name + i.id + i.placeholder).toLowerCase()))
            .join(' ')
            .substring(0, 1000); // Limit total length
        
        const url = window.location.href.toLowerCase();
        
        // Payment page detection
        if (fieldNames.includes('card') || 
            fieldNames.includes('cvv') || 
            fieldNames.includes('payment') ||
            url.includes('checkout') ||
            url.includes('payment')) {
            return 'PAYMENT';
        }
        
        // Login page detection
        if (inputs.some(i => i.type === 'password') &&
            (fieldNames.includes('login') || 
             fieldNames.includes('username') ||
             fieldNames.includes('email'))) {
            return 'LOGIN';
        }
        
        // Admin page detection
        if (url.includes('/admin') || 
            url.includes('/dashboard') ||
            fieldNames.includes('admin')) {
            return 'ADMIN';
        }
        
        return 'GENERAL';
    }
    
    /**
     * Perform comprehensive page scan
     * Security: All data sanitized before returning
     */
    function performScan() {
        console.log('Starting security scan...');
        
        const pageInfo = getPageInfo();
        const inputs = detectInputFields();
        const pageType = detectPageType(inputs);
        
        // Calculate vulnerability counts
        const vulnerabilities = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };
        
        inputs.forEach(input => {
            if (Array.isArray(input.validationIssues)) {
                input.validationIssues.forEach(issue => {
                    const severity = String(issue.severity || '').toLowerCase();
                    if (vulnerabilities[severity] !== undefined) {
                        vulnerabilities[severity]++;
                    }
                });
            }
        });
        
        const scanResults = {
            pageInfo: pageInfo,
            pageType: pageType,
            inputs: inputs,
            vulnerabilities: vulnerabilities,
            totalIssues: vulnerabilities.critical + vulnerabilities.high + 
                        vulnerabilities.medium + vulnerabilities.low,
            scanTime: new Date().toISOString()
        };
        
        console.log('Scan complete:', scanResults);
        return scanResults;
    }
    
    /**
     * Validate incoming message
     * Security: Ensure message is from trusted source with expected format
     */
    function isValidMessage(message, sender) {
        // Verify message structure
        if (!message || typeof message !== 'object') {
            console.warn('Invalid message structure');
            return false;
        }
        
        // Verify sender is from our extension
        if (!sender || !sender.id || sender.id !== chrome.runtime.id) {
            console.warn('Message from untrusted sender');
            return false;
        }
        
        // Verify action is expected
        if (message.action !== 'scanPage') {
            console.warn('Unknown action:', message.action);
            return false;
        }
        
        return true;
    }
    
    // Listen for scan requests from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        // Validate message
        if (!isValidMessage(request, sender)) {
            sendResponse({ 
                success: false, 
                error: 'Invalid message or sender' 
            });
            return true;
        }
        
        if (request.action === 'scanPage') {
            try {
                const results = performScan();
                sendResponse({ success: true, data: results });
            } catch (error) {
                console.error('Scan error:', error);
                sendResponse({ 
                    success: false, 
                    error: 'Scan failed: ' + sanitizeText(error.message)
                });
            }
        }
        
        return true; // Keep channel open for async response
    });
    
    console.log(`Scanner v${VERSION} ready and waiting for scan requests`);
})();
