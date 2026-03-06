# PetMind AI - Quick Start Guide

Get your PetMind AI platform running in production in under 10 minutes.

---

## Step 1: Deploy to Vercel (2 minutes)

### Option A: One-Click Deploy

1. Click this button: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables (see Step 2)
4. Click Deploy

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

---

## Step 2: Configure Environment Variables (1 minute)

In Vercel Dashboard, add these environment variables:

```
VITE_SUPABASE_URL=https://vffeiaicdeujgmtabphlp.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_from_.env_file
```

Make sure to add them for:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## Step 3: Update Supabase Settings (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add your Vercel URL:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Step 4: Create Admin User (2 minutes)

1. Visit your deployed app
2. Sign up with your email
3. Copy your user ID from Supabase Dashboard:
   - **Authentication** → **Users** → Copy User ID
4. Run this SQL in **SQL Editor**:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('paste-your-user-id-here', 'admin');
```

---

## Step 5: Test Your Deployment (3 minutes)

Visit your app and verify:

- ✅ You can sign in
- ✅ You can create a pet profile
- ✅ Products load in marketplace
- ✅ You can access admin dashboard
- ✅ Mobile view works correctly

---

## Troubleshooting

### Can't connect to database
**Fix**: Check environment variables in Vercel are correct

### Authentication fails
**Fix**: Verify redirect URLs in Supabase match your deployment URL

### Products not showing
**Fix**: Add sample products via Admin Dashboard or SQL Editor

---

## Next Steps

- [ ] Add your own product inventory
- [ ] Customize branding and colors
- [ ] Set up a custom domain
- [ ] Configure email notifications
- [ ] Add more admin users

---

## Need Help?

- Read the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Supabase Documentation](https://supabase.com/docs)

---

**That's it! Your PetMind AI platform is live!** 🎉
