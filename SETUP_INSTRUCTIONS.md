# Security Scanner - Setup Instructions

## Files Created

You now have the skeleton files to load your extension in Chrome!

### Download and Place These Files:

**Popup files** (put in `src/popup/`):
- popup.html
- popup.css  
- popup.js

**Background file** (put in `src/background/`):
- service-worker.js

**Content script** (put in `src/content/`):
- scanner.js

**Icon** (temporary placeholder):
- icon.svg

---

## Quick Setup Steps

### 1. Organize Files

```
security-scanner/
└── src/
    ├── manifest.json ✅ (already there)
    ├── popup/
    │   ├── popup.html ← Add this
    │   ├── popup.css ← Add this
    │   └── popup.js ← Add this
    ├── background/
    │   └── service-worker.js ← Add this
    ├── content/
    │   └── scanner.js ← Add this
    └── icons/
        └── (placeholder icons - see below)
```

### 2. Create Placeholder Icons

**Quick Method - Use Emoji:**

For now, create simple PNG placeholders using Preview (Mac) or any image editor:

1. Open Preview
2. File → New from Clipboard (or create blank 128x128 image)
3. Add text: 🛡️ (shield emoji)
4. Export as PNG at these sizes:
   - icon16.png (16×16)
   - icon32.png (32×32)
   - icon48.png (48×48)
   - icon128.png (128×128)
5. Save all in `src/icons/`

**Alternative - Online Generator:**
- Go to https://favicon.io/
- Generate icon with shield emoji
- Download all sizes
- Place in `src/icons/`

**Or - Use icon.svg temporarily:**
- Convert icon.svg to PNG at different sizes
- Many free online SVG → PNG converters available

---

## 3. Load Extension in Chrome

### Step-by-Step:

1. **Open Chrome**

2. **Go to Extensions page:**
   - Type in address bar: `chrome://extensions/`
   - Or Menu → More Tools → Extensions

3. **Enable Developer Mode:**
   - Toggle switch in top right corner

4. **Load Your Extension:**
   - Click "Load unpacked" button
   - Navigate to your `security-scanner/src/` folder
   - Click "Select"

5. **Success!**
   - You should see "Security Scanner" appear in your extensions list
   - The extension icon should appear in your Chrome toolbar

---

## 4. Test It!

### Basic Test:

1. **Click the extension icon** in Chrome toolbar (🛡️)
2. **Popup should open** showing:
   - ✅ Extension Loaded Successfully!
   - "Scan This Page" button
3. **Click "Scan This Page"**
4. **Should show:**
   - Scanning message
   - Then success message
   - "Extension is working correctly"

### Console Test:

1. **Open popup**, then right-click it → Inspect
2. **Check Console** - should see:
   - "Security Scanner popup loaded successfully"
3. **Go to any webpage**
4. **Open DevTools** (F12) → Console
5. **Should see:**
   - "Security Scanner content script loaded on: [URL]"
   - "Scanner ready. Page info: {object with page details}"

---

## 5. What's Working Now

✅ Extension loads without errors  
✅ Popup opens and displays  
✅ Button is clickable and interactive  
✅ Content script runs on every page  
✅ Service worker handles background tasks  
✅ Basic page information gathering works  

---

## 6. Common Issues & Fixes

### "Manifest file is missing or unreadable"
- Check manifest.json is in `src/` folder
- Verify JSON is valid (no syntax errors)

### "Could not load icon"
- Make sure icon files exist in `src/icons/`
- Check filenames match exactly (icon16.png, etc.)
- For now, you can comment out icon lines in manifest.json if needed

### Extension icon doesn't appear in toolbar
- Click the puzzle piece icon in Chrome toolbar
- Find "Security Scanner" and pin it

### Popup doesn't open
- Check popup.html is in correct location: `src/popup/popup.html`
- Right-click extension icon → Inspect popup → Check for errors

---

## Next Steps

Once the skeleton is loaded and working:

1. **Commit to GitHub:**
   ```bash
   git add src/
   git commit -m "Add extension skeleton - loadable MVP
   
   - Create manifest.json with permissions and structure
   - Add basic popup UI with scan button
   - Implement service worker and content script
   - Extension loads successfully in Chrome"
   
   git push
   ```

2. **Build Out Real Functionality:**
   - Implement actual DOM scanning
   - Add static vulnerability rules
   - Create risk assessment logic
   - Eventually: Claude API integration

---

## 🎉 Success Criteria

Your extension is working if:
- ✅ Loads in chrome://extensions without errors
- ✅ Icon appears in toolbar
- ✅ Popup opens when clicked
- ✅ Scan button shows test message
- ✅ Console logs appear on web pages

**Once you see all this, you have a working Chrome extension!**

From here, we build out the real scanner step by step.

---

**Need help?** Ask Claude! 🚀
