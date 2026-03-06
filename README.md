# PetMind AI - Intelligent Pet Care Platform

A comprehensive mobile-first Progressive Web App for pet owners featuring AI-powered health scanning, personalized product recommendations, integrated marketplace with Razorpay payments, and intelligent pet care assistance.

![PetMind AI](https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=1200)

---

## Features

### For Pet Owners

- **Pet Profile Management**: Create detailed profiles for your pets including breed, age, weight, and health information
- **AI Health Scanner**: Use your camera to scan your pet for potential health issues with AI-powered image analysis
- **AI Assistant**: Get instant, personalized advice powered by OpenAI GPT-4o about pet care, nutrition, health, training, grooming, and behavior
- **Smart Marketplace**: Browse products by category (Dog Food, Cat Food, Pet Toys, Health & Grooming) with real product images
- **INR Pricing**: All products priced in Indian Rupees for local market
- **Razorpay Integration**: Secure payment processing with UPI, cards, net banking, and wallets
- **Shopping Cart**: Add products, manage quantities, and checkout seamlessly
- **Order Management**: Track your orders and view purchase history
- **Mobile PWA**: Install as a native app with bottom navigation and standalone mode
- **Privacy & Data Control**: Access privacy policy and request data deletion at any time

### For Administrators

- **Product Management**: Add, edit, and manage marketplace inventory
- **User Management**: View and manage user accounts
- **Order Processing**: Monitor and manage customer orders
- **Analytics Dashboard**: Track sales, revenue, and platform performance

---

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for beautiful icons

### Backend & Database
- **Supabase** for:
  - PostgreSQL database
  - Authentication (email/password + OAuth: Google, Facebook)
  - Row Level Security (RLS)
  - Real-time subscriptions
  - RESTful API
  - Edge Functions for AI chat

### AI & Machine Learning
- **OpenAI GPT-4o** for intelligent pet care assistance
- **Vision AI** for pet health image analysis
- Real-time AI responses via Supabase Edge Functions
- Personalized advice based on pet profiles
- Camera-based health scanning for skin conditions, injuries, and infections

### Payments
- **Razorpay** for secure payment processing in INR
- Support for UPI, Credit/Debit Cards, Net Banking, and Wallets

### Deployment
- **Vercel** for frontend hosting and CDN
- **Supabase Cloud** for database and backend services
- **Progressive Web App** with service worker for offline capabilities

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (free tier available)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd petmind-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**

   The database schema is already set up in Supabase. Check `supabase/migrations/` for all migrations.

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Database Schema

### Tables

- **profiles**: User profiles linked to Supabase Auth
- **pets**: Pet profiles with health and demographic information
- **product_categories**: Product categories (Dog Food, Cat Food, Toys, Health & Grooming)
- **products**: Marketplace product catalog with INR pricing
- **cart_items**: Shopping cart functionality
- **orders**: Order records with Razorpay payment details and shipping information
- **order_items**: Line items for each order with INR pricing
- **user_roles**: Role-based access control (admin/user)
- **chat_messages**: AI assistant conversation history
- **vaccinations**: Pet vaccination tracking
- **weight_records**: Pet weight tracking
- **vet_visits**: Veterinary visit records
- **pet_images**: Pet health scan images with AI analysis results

### Security

All tables implement Row Level Security (RLS) to ensure:
- Users can only access their own data
- Admin users have elevated permissions
- Products are publicly readable
- Sensitive operations require authentication

---

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Project Structure

```
petmind-ai/
├── src/
│   ├── components/          # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── Analytics.tsx
│   │   ├── AuthModal.tsx
│   │   ├── ChatAssistant.tsx      # AI-powered chat interface
│   │   ├── Dashboard.tsx
│   │   ├── HomePage.tsx
│   │   ├── Marketplace.tsx
│   │   ├── Navigation.tsx
│   │   ├── OrderHistory.tsx
│   │   ├── OrderManagement.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductManagement.tsx
│   │   ├── ProductRecommendations.tsx
│   │   ├── ShoppingCart.tsx
│   │   └── UserManagement.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                 # Utilities and configurations
│   │   └── supabase.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── supabase/
│   ├── functions/
│   │   └── ai-chat/         # OpenAI GPT-4o integration
│   │       └── index.ts
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── DEPLOYMENT.md           # Deployment guide
└── package.json            # Dependencies and scripts
```

---

## Deployment

For complete deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

1. Click the button above
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Configure OpenAI API key in Supabase Edge Functions (see [DEPLOYMENT.md](./DEPLOYMENT.md))
4. Deploy!

---

## Features in Detail

### Mobile PWA Experience

The entire platform is built as a Progressive Web App:
- **Standalone Mode**: Launches like a native app when installed
- **Bottom Navigation**: Mobile-first navigation with Home, Pets, Shop, AI Assistant, and Profile tabs
- **Camera Integration**: Direct camera access for pet health scanning
- **Service Worker**: Offline capabilities and faster loading
- **App Icons**: Custom PWA icons for home screen installation
- **Responsive Design**: Adapts seamlessly from mobile to desktop
- **Touch-Optimized**: Large, touch-friendly buttons and controls

### AI-Powered Chat Assistant

The intelligent pet care assistant uses OpenAI GPT-4o to provide:
- Personalized advice based on your pet's profile (age, breed, weight, health)
- Expert guidance on nutrition, health, training, grooming, and exercise
- Context-aware recommendations that remember conversation history
- Product suggestions tailored to your pet's specific needs
- Professional, compassionate responses from a virtual pet care expert

### Smart Product Recommendations

Products are intelligently recommended based on:
- Pet type (dog, cat, bird, etc.)
- Pet age and life stage
- Health conditions
- AI chat interactions
- Previous purchases
- Browsing behavior

### Security Features

- Multi-provider authentication via Supabase Auth (email/password, Google, Facebook)
- Row Level Security (RLS) on all database tables with optimized policies
- Role-based access control (RBAC)
- Secure API calls with authentication tokens
- Environment variables for sensitive data
- Optimized database indexes for performance
- Consolidated RLS policies for better security evaluation

---

## Creating an Admin User

After deployment, create your first admin user:

1. Sign up through the application
2. Get your user ID from Supabase Dashboard
3. Run this SQL in Supabase SQL Editor:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id-here', 'admin');
   ```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Support

For issues and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review Supabase documentation
- Check Vercel deployment logs

---

## Roadmap

Completed features:
- [x] Social login (Google, Facebook)
- [x] AI health image scanning
- [x] Pet health tracking (vaccinations, weight, vet visits)
- [x] Progressive Web App with mobile navigation
- [x] INR currency and Razorpay payments
- [x] Product categories and marketplace
- [x] Privacy policy and data deletion

Future features planned:
- [ ] Veterinarian appointment booking
- [ ] Community features and forums
- [ ] Multi-language support
- [ ] Pet insurance integration
- [ ] Subscription-based products
- [ ] Push notifications for health reminders

## New Features in This Release

### Pet Health Scanner with Camera
- Open camera directly from the app
- Upload existing photos from gallery
- AI analyzes images for:
  - Skin conditions and rashes
  - Eye infections and discharge
  - Coat problems and parasites
  - Physical injuries and wounds
  - Hair loss and fungal infections
- Receive specific health recommendations
- Professional disclaimer for veterinary consultation

### Marketplace with Product Categories
- **Dog Food**: Royal Canin, Pedigree, and more
- **Cat Food**: Whiskas and premium cat nutrition
- **Pet Toys**: Chew toys, feather teasers, interactive toys
- **Health & Grooming**: Shampoos, flea sprays, grooming essentials
- Large category cards with real product images
- Product listings with detailed descriptions
- Stock availability tracking

### Razorpay Payment Integration
- Secure checkout with Razorpay gateway
- Multiple payment methods:
  - UPI (Google Pay, PhonePe, Paytm)
  - Credit/Debit Cards
  - Net Banking
  - Digital Wallets
- INR currency throughout
- Order confirmation and tracking
- Payment history

### Mobile App Experience
- Install as PWA on Android and iOS
- Bottom navigation bar (Home, Pets, Shop, AI, Profile)
- Full-screen standalone mode
- No browser UI when launched
- App-like transitions and interactions
- Optimized for touch and gestures

### Privacy & Compliance
- **Privacy Policy Page** (`/privacy`)
  - Clear data collection disclosure
  - Usage transparency
  - No third-party data sharing
  - Contact information
- **Data Deletion Page** (`/delete-data`)
  - Self-service account deletion
  - 7-day deletion timeline
  - Email alternative for deletion requests
  - Clear instructions

## Important Supabase Configuration Notes

### Auth Connection Strategy
The Supabase Auth server is currently configured with a fixed connection limit (10 connections). For optimal performance as your application scales, it's recommended to switch to a percentage-based connection allocation strategy in the Supabase dashboard under **Database > Settings > Connection Pooling**.

### Leaked Password Protection
For enhanced security, enable leaked password protection in your Supabase dashboard under **Authentication > Settings**. This feature prevents users from using compromised passwords by checking against the HaveIBeenPwned.org database.

---

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Images from [Pexels](https://www.pexels.com/)
- Database and Auth by [Supabase](https://supabase.com/)
- Hosting by [Vercel](https://vercel.com/)

---

**Built with love for pets and their owners** 🐾
