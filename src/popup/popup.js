/**
 * Security Scanner - Popup Script
 * Copyright (c) 2025 Lynda M Birss
 */

document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scanButton');
    const resultsDiv = document.getElementById('results');
    
    scanButton.addEventListener('click', async function() {
        // Show loading state
        scanButton.textContent = 'Scanning...';
        scanButton.disabled = true;
        
        // Show results area
        resultsDiv.classList.remove('hidden');
        resultsDiv.innerHTML = '<p>🔍 Scanning page for vulnerabilities...</p>';
        
        // Simulate scan (replace with actual scanning logic later)
        setTimeout(() => {
            resultsDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 10px;">✅</div>
                    <p><strong>Test Successful!</strong></p>
                    <p style="font-size: 12px; color: #666; margin-top: 8px;">
                        Extension is working correctly.<br>
                        Scanning functionality coming soon!
                    </p>
                </div>
            `;
            
            // Reset button
            scanButton.textContent = 'Scan This Page';
            scanButton.disabled = false;
        }, 1500);
    });
    
    console.log('Security Scanner popup loaded successfully');
});
