/**
 * Security Scanner - Background Service Worker
 * Copyright (c) 2025 Lynda M Birss
 * 
 * Handles background tasks including:
 * - Extension lifecycle events
 * - API calls to Claude (future)
 * - Data caching and persistence
 */

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Security Scanner installed successfully');
    } else if (details.reason === 'update') {
        console.log('Security Scanner updated to version', chrome.runtime.getManifest().version);
    }
});

// Extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Security Scanner service worker started');
});

// Message handling (for communication with popup and content scripts)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);
    
    // Handle different message types
    if (request.action === 'scan') {
        // Future: Handle scan requests
        sendResponse({ success: true, message: 'Scan initiated' });
    }
    
    return true; // Keep channel open for async response
});

console.log('Service worker loaded');
