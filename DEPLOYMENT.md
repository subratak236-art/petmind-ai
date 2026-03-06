# PetMind AI - Deployment Guide

Complete guide to deploying your PetMind AI platform to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Supabase)](#database-setup-supabase)
3. [Environment Variables](#environment-variables)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Testing Your Deployment](#testing-your-deployment)

---

## Prerequisites

Before deploying, ensure you have:

- A Supabase account (free tier available)
- A Vercel account (free tier available)
- Git installed locally
- Your code pushed to a GitHub repository

---

## Database Setup (Supabase)

Your database is already configured with Supabase. The migrations have been applied and include:

### Database Schema

- **Users & Authentication**: Managed by Supabase Auth
- **Pets**: User pet profiles with breed, age, health information
- **Products**: Pet marketplace inventory
- **Cart Items**: Shopping cart functionality
- **Orders**: Order history and management
- **Order Items**: Individual items within orders
- **User Roles**: Admin access control
- **Chat Messages**: AI assistant conversation history

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Admin users have elevated permissions
- Cart and orders are user-specific
- Products are publicly readable

### Current Supabase Configuration

Your Supabase project is already set up:
- **Project URL**: `https://vffeiaicdeujgmtabphlp.supabase.co`
- **Database**: PostgreSQL with all migrations applied
- **Authentication**: Email/password enabled
- **Edge Functions**: AI chat assistant deployed
- **Storage**: Ready for file uploads (if needed)

---

## Environment Variables

### Local Development

Your `.env` file is already configured for development. Keep this file secure and never commit it to version control.

### Production Environment Variables

For Vercel deployment, you'll need to configure these environment variables:

```bash
VITE_SUPABASE_URL=https://vffeiaicdeujgmtabphlp.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: The Supabase Anon Key is safe to use in frontend code as it only grants access based on your RLS policies.

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. Make sure your `.gitignore` includes:
   ```
   .env
   .env.local
   node_modules
   dist
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add `VITE_SUPABASE_URL` with your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` with your Supabase anon key
   - Make sure to add them for Production, Preview, and Development

6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Deploy

5. Add environment variables:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Step 3: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel

---

## Post-Deployment Configuration

### 1. Update Supabase Authentication Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Authentication" → "URL Configuration"
4. Add your Vercel deployment URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/**`

### 2. Configure OpenAI API Key for AI Assistant

The AI chat assistant requires an OpenAI API key to function:

1. Get your OpenAI API key:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key or use an existing one
   - Copy the key (starts with `sk-`)

2. Add the key to Supabase Edge Functions:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to "Edge Functions" in the sidebar
   - Click "Manage secrets"
   - Add a new secret:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key

**Important**: The OpenAI API key is stored securely in Supabase and is never exposed to the frontend.

### 3. Create Admin User

After deployment, create your first admin user:

1. Sign up through your deployed app
2. Get the user ID from Supabase Dashboard:
   - Go to "Authentication" → "Users"
   - Copy the user ID

3. Add admin role in Supabase SQL Editor:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id-here', 'admin');
   ```

### 4. Add Sample Products (Optional)

You can add sample products through the Admin Dashboard or via SQL:

```sql
INSERT INTO products (name, description, price, category, pet_type, stock, rating, image_url)
VALUES
  ('Premium Dog Food', 'High-quality nutrition for adult dogs', 49.99, 'food', ARRAY['dog'], 100, 4.8, 'https://images.pexels.com/photos/1207875/pexels-photo-1207875.jpeg'),
  ('Interactive Cat Toy', 'Keep your cat entertained for hours', 15.99, 'toys', ARRAY['cat'], 50, 4.5, 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'),
  ('Pet Wellness Supplements', 'Daily vitamins for optimal health', 29.99, 'health', ARRAY['dog', 'cat'], 75, 4.7, 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg');
```

---

## Testing Your Deployment

### Functional Testing Checklist

- [ ] User can sign up with email/password
- [ ] User can sign in
- [ ] User can create pet profiles
- [ ] AI chat assistant responds to questions
- [ ] AI provides personalized pet care advice
- [ ] Products load in marketplace
- [ ] User can add items to cart
- [ ] User can checkout and create orders
- [ ] User can view order history
- [ ] Admin can access admin dashboard
- [ ] Admin can manage products
- [ ] Admin can view analytics
- [ ] Mobile responsive design works correctly
- [ ] All pages load without errors

### Performance Testing

1. Test page load speeds using [PageSpeed Insights](https://pagespeed.web.dev/)
2. Check mobile responsiveness on actual devices
3. Verify images load properly
4. Test across different browsers (Chrome, Firefox, Safari, Edge)

### Security Testing

- [ ] Verify RLS policies prevent unauthorized data access
- [ ] Test that non-admin users cannot access admin features
- [ ] Confirm environment variables are not exposed in frontend
- [ ] Check that API keys are properly secured

---

## Troubleshooting

### Common Issues

**Issue**: "Failed to connect to Supabase"
- **Solution**: Check that environment variables are correctly set in Vercel
- Verify Supabase project is active and not paused

**Issue**: "Authentication not working"
- **Solution**: Ensure your deployment URL is added to Supabase redirect URLs
- Check that email confirmation is disabled (or configure email provider)

**Issue**: "Build fails on Vercel"
- **Solution**: Check build logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

**Issue**: "Products not loading"
- **Solution**: Check browser console for errors
- Verify RLS policies allow public read access to products table
- Ensure products exist in database

**Issue**: "AI chat not responding"
- **Solution**: Verify OpenAI API key is set in Supabase Edge Function secrets
- Check Edge Function logs in Supabase Dashboard
- Ensure OpenAI API key has sufficient credits
- Verify the edge function is deployed successfully

---

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your repository:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Manual Deployments

Trigger manual deployment:
```bash
vercel --prod
```

---

## Monitoring & Analytics

### Vercel Analytics

1. Enable Vercel Analytics in your project dashboard
2. Monitor page views, performance, and user behavior

### Supabase Monitoring

1. Check database usage in Supabase Dashboard
2. Monitor API requests and response times
3. Review authentication logs

---

## Scaling Considerations

### Database

- **Free Tier**: Up to 500MB database, 2GB bandwidth
- **Pro Tier**: Upgrade for more resources and features
- Monitor database size in Supabase Dashboard

### Frontend

- Vercel automatically handles scaling
- CDN distribution for fast global access
- No additional configuration needed

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] Sample products added
- [ ] Authentication URLs configured
- [ ] Custom domain set up (if applicable)
- [ ] All features tested
- [ ] Mobile optimization verified
- [ ] Security policies reviewed
- [ ] Monitoring enabled
- [ ] Backup strategy in place

---

## Maintenance

### Regular Tasks

- Monitor error logs in Vercel
- Check database usage in Supabase
- Update dependencies regularly
- Review and optimize database queries
- Back up critical data

### Updates

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically deploy the changes.

---

**Congratulations!** Your PetMind AI platform is ready for production deployment.
