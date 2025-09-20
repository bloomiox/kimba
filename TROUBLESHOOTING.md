# 🔧 Deployment Troubleshooting Guide

## Current Issues Observed

### 1. MIME Type Errors ❌
**Error**: `Refused to apply style from 'https://kimba.ch/index.css' because its MIME type ('text/html') is not a supported stylesheet MIME type`

**Cause**: Cloudflare Pages is serving HTML instead of CSS files

**Status**: ✅ **FIXED** - Updated `_redirects` and `_headers` files

### 2. Module Script Errors ❌
**Error**: `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

**Cause**: JavaScript files being served as HTML due to redirect issues

**Status**: ✅ **FIXED** - Explicit asset handling in `_redirects`

## Solutions Applied

### ✅ Updated `_redirects` File
```
# Explicit asset handling
/assets/index-BNlN1JX4.css  /assets/index-BNlN1JX4.css  200
/assets/index-BzIFnxEf.js   /assets/index-BzIFnxEf.js   200  
/assets/index-DclWOD0H.js   /assets/index-DclWOD0H.js   200
/index.css                  /index.css                  200
/i18n/locales/de.json       /i18n/locales/de.json       200
/i18n/locales/en.json       /i18n/locales/en.json       200
/i18n/locales/fr.json       /i18n/locales/fr.json       200
/i18n/locales/it.json       /i18n/locales/it.json       200

# Generic asset patterns
/assets/*                   /assets/:splat              200
/i18n/*                     /i18n/:splat               200

# SPA fallback for all other routes
/*                          /index.html                 200
```

### ✅ Enhanced `_headers` File
```
# JSON files
/i18n/locales/*.json
  Content-Type: application/json
  Cache-Control: public, max-age=300

# CSS files
/*.css
  Content-Type: text/css
  Cache-Control: public, max-age=31536000

/index.css
  Content-Type: text/css
  Cache-Control: public, max-age=300

# JavaScript files
/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

/assets/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

# HTML files
/*.html
  Content-Type: text/html
  Cache-Control: public, max-age=0, must-revalidate
```

## Testing Commands

### Local Verification
```bash
npm run verify      # Verify build output
npm run test-urls   # Test file accessibility
npm run deploy      # Build + verify
```

### Expected Results
- ✅ All asset files present in dist/
- ✅ Proper _redirects configuration
- ✅ Correct _headers MIME types
- ✅ Translation files accessible

## Deployment Steps

1. **Commit Changes**: Ensure all fixes are committed to repository
2. **Redeploy**: Trigger new deployment on Cloudflare Pages
3. **Clear Cache**: Clear browser cache and Cloudflare cache
4. **Test**: Verify assets load correctly

## Cache Clearing

If issues persist after deployment:

1. **Browser Cache**: Hard refresh (Ctrl+F5 / Cmd+Shift+R)
2. **Cloudflare Cache**: 
   - Go to Cloudflare Dashboard
   - Caching → Configuration
   - Purge Everything

## Verification Checklist

After deployment, check:
- [ ] `https://kimba.ch/index.css` returns CSS (not HTML)
- [ ] `https://kimba.ch/assets/index-DclWOD0H.js` returns JavaScript
- [ ] `https://kimba.ch/i18n/locales/de.json` returns JSON
- [ ] No MIME type errors in browser console
- [ ] German translations load correctly

## If Issues Persist

1. **Check Cloudflare Pages Build Log**: Look for deployment errors
2. **Verify File Upload**: Ensure all files in dist/ were uploaded
3. **Test Individual URLs**: Use browser dev tools to check responses
4. **Contact Support**: If Cloudflare Pages isn't respecting _redirects/_headers

## Success Indicators

✅ **Working Deployment Should Show**:
- CSS files load with `Content-Type: text/css`
- JS files load with `Content-Type: application/javascript`
- JSON files load with `Content-Type: application/json`
- German translations work without errors
- No MIME type warnings in console

**Status**: Ready for redeployment with fixes applied! 🚀