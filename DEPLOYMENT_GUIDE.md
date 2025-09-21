# 🚀 SportEdge Pro - Independent Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your repository:** `akieia60/multi-sport-betting-intelligence`
5. **Configure build settings:**
   - Framework Preset: `Other`
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `cd client && npm install`
6. **Add Environment Variables** (in Vercel dashboard):
   ```
   ODDS_API_KEY=7fa35226647391339bdbfe29f1b4a8e9
   SPORTSDATA_API_KEY=570011f5d46340659e6e9cd0e6cf150e
   TWITTER_API_KEY=kSAYOzlWK9OhjFnB0r3NY9HpI
   TWITTER_API_SECRET=WupWUDAYNrcVVTkCQ3FhdQMTmRrBpFomW37wvLiNj170b8jRIB
   TWITTER_ACCESS_TOKEN=65807284-KXsdmjNxcvS1JcxIV1aTEqAV3AP0Ju9QMhbEPp1IK
   TWITTER_ACCESS_TOKEN_SECRET=p6nPlGn1NuD2DigBd2IK7ZJ5jaqcFKjqChEDlVHVYXGwi
   ```
7. **Deploy** - You'll get a URL like `sportedge-pro.vercel.app`

### Option 2: Netlify

1. **Go to [netlify.com](https://netlify.com)**
2. **Sign in with GitHub**
3. **Click "New site from Git"**
4. **Choose your repository:** `akieia60/multi-sport-betting-intelligence`
5. **Build settings:**
   - Build command: `cd client && npm run build`
   - Publish directory: `client/dist`
6. **Add environment variables** in Netlify dashboard
7. **Deploy**

### Option 3: Railway (Fix the current deployment)

1. **Go to your Railway dashboard**
2. **Go to your project settings**
3. **In the "Deploy" section, set:**
   - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - Root Directory: `/` (leave empty)
4. **Redeploy**

### Option 4: Render

1. **Go to [render.com](https://render.com)**
2. **Connect GitHub**
3. **Create new Web Service**
4. **Select your repository**
5. **Settings:**
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --host 0.0.0.0 --port $PORT`
6. **Add environment variables**
7. **Deploy**

## What's Already Configured

Your repository is deployment-ready with:

✅ **Procfile** - Railway/Heroku deployment config
✅ **railway.toml** - Railway-specific settings  
✅ **requirements.txt** - Python dependencies
✅ **app.py** - Main Flask application
✅ **client/dist/** - Built React frontend
✅ **.env** - All API keys configured

## Custom Domain Setup

Once deployed, you can add a custom domain:

1. **Buy a domain** (GoDaddy, Namecheap, etc.)
2. **In your deployment platform:**
   - Vercel: Project Settings → Domains
   - Netlify: Site Settings → Domain Management
   - Railway: Project Settings → Domains
3. **Add your domain** (e.g., `sportedgepro.com`)
4. **Update DNS records** as instructed by the platform

## Professional URLs You Could Use

- `sportedgepro.com`
- `bettingintelligence.com` 
- `nflanalytics.pro`
- `edgefinder.io`
- `sharpbets.co`

## Testing Your Deployment

After deployment, test these URLs:

1. **Main site:** `https://your-url.com` - Should show SportEdge Pro
2. **API health:** `https://your-url.com/api/health` - Should return JSON
3. **API status:** `https://your-url.com/api/status` - Should show platform info

## Troubleshooting

**If the site shows 404:**
- Check that `client/dist/index.html` exists in your repo
- Verify build command ran successfully
- Check deployment logs

**If API doesn't work:**
- Verify environment variables are set
- Check that `app.py` is in the root directory
- Ensure `requirements.txt` includes all dependencies

**If Twitter integration fails:**
- Double-check all 4 Twitter API credentials
- Verify Twitter app has read/write permissions

## Your Repository Structure

```
multi-sport-betting-intelligence/
├── app.py                 # Main Flask app (serves React + API)
├── Procfile              # Deployment config
├── railway.toml          # Railway config
├── requirements.txt      # Python dependencies
├── .env                  # API keys (already configured)
├── client/
│   ├── dist/            # Built React app (ready to serve)
│   │   ├── index.html
│   │   └── assets/
│   └── src/             # React source code
├── twitter_engine.py     # Twitter automation
├── data_engine.py        # Sports data integration
└── newsletter_engine.py  # Newsletter generation
```

## Next Steps

1. **Choose a platform** (Vercel recommended)
2. **Deploy from GitHub**
3. **Test the deployment**
4. **Optional: Add custom domain**
5. **Start promoting your platform**

Your SportEdge Pro platform is ready to go live with your own professional URL!
