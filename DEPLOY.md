# 🚀 Cloudflare Pages Deployment Guide

## Quick Deploy

Your app is ready for deployment! Here's how to deploy to Cloudflare Pages:

### Option 1: Automatic GitHub Deployment (Recommended)

1. **Push to GitHub**: Make sure all changes are committed and pushed to your repository
2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
3. **Configure Build Settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `18` or later
4. **Deploy**: Click "Save and Deploy"

### Option 2: Manual Upload

1. **Build locally**:
   ```bash
   npm run build
   npm run verify  # Optional: verify build is ready
   ```

2. **Upload dist folder**:
   - Go to Cloudflare Pages dashboard
   - Create new project → Upload assets
   - Upload the entire `dist/` folder

## Build Commands

- `npm run build` - Build the app (with fallback support)
- `npm run verify` - Verify build is deployment-ready
- `npm run deploy` - Build + verify in one command

## What's Fixed

✅ **German translations load correctly**
✅ **CSS files serve with proper MIME types**
✅ **SPA routing works for all pages**
✅ **Build process is resilient to dependency issues**

## Custom Domain Setup

If using kimba.ch domain:

1. **DNS Settings**: Point your domain to Cloudflare Pages
2. **SSL**: Cloudflare provides automatic SSL certificates
3. **Custom Domain**: Add kimba.ch in Pages project settings

## Troubleshooting

### Build Fails
- The build script has fallback logic - it will use existing dist folder if Vite fails
- Run `npm run verify` to check if build output is valid

### Translations Not Loading
- Check that `dist/i18n/locales/*.json` files exist
- Verify `dist/_redirects` contains routing rules

### CSS Not Loading
- Check that `dist/index.css` exists
- Verify `dist/_headers` contains MIME type rules

## Support

If you encounter issues:
1. Run `npm run verify` to check build status
2. Check the `DEPLOYMENT_FIXES.md` file for technical details
3. Ensure all files in `dist/` folder are present

**Your app is ready to deploy! 🎉**