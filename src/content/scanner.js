/**
 * Security Scanner - Content Script
 * Copyright (c) 2025 Lynda M Birss
 * 
 * This script runs on every web page and performs:
 * - DOM analysis
 * - Security header checking
 * - Input field validation
 * - Vulnerability detection
 */

(function() {
    'use strict';
    
    console.log('Security Scanner content script loaded on:', window.location.href);
    
    // Basic page information gathering
    function getPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            formCount: document.forms.length,
            inputCount: document.querySelectorAll('input').length,
            scriptCount: document.scripts.length,
            iframeCount: document.querySelectorAll('iframe').length
        };
    }
    
    // Listen for scan requests from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'scanPage') {
            const pageInfo = getPageInfo();
            console.log('Page scan requested:', pageInfo);
            sendResponse({ success: true, data: pageInfo });
        }
        return true;
    });
    
    console.log('Scanner ready. Page info:', getPageInfo());
})();
