# Billy - Bill Management System

A modern, full-stack bill management application built with Next.js 15, TypeScript, and Supabase. Track your bills, manage creditors, and never miss a payment with automatic recurring bill generation.

![Billy Dashboard](public/logo.png)

## 🌟 Features

- **📋 Bill Management** - Add, edit, and track all your bills in one place
- **🔄 Recurring Bills** - Set bills to automatically recur weekly, monthly, or yearly
- **👥 Creditor Management** - Organize bills by service providers and creditors
- **📅 Calendar View** - Visualize upcoming, overdue, and paid bills
- **🔐 Secure Login Credentials** - Safely store account usernames and passwords for each bill
- **📊 Dashboard** - Get an overview of your financial obligations at a glance
- **🔒 Secure Authentication** - Email/password and OAuth (Google, GitHub) login options
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Authentication, Row Level Security)
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- A Supabase account ([supabase.com](https://supabase.com))

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/billy.git
   cd billy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings → API to get your credentials

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Set up the database**
   
   Run the following SQL in your Supabase SQL Editor:

   ```sql
   -- Create creditors table
   CREATE TABLE creditors (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     name text NOT NULL,
     website text,
     phone text,
     account_number text,
     notes text,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   -- Create bills table
   CREATE TABLE bills (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     creditor_id uuid REFERENCES creditors(id) ON DELETE CASCADE,
     name text NOT NULL,
     amount numeric(10, 2) NOT NULL,
     due_date date NOT NULL,
     is_paid boolean DEFAULT false,
     paid_date date,
     is_recurring boolean DEFAULT false,
     recurrence_frequency text CHECK (recurrence_frequency IN ('weekly', 'monthly', 'yearly')),
     recurrence_day integer,
     login_username text,
     login_password text,
     notes text,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   -- Enable Row Level Security
   ALTER TABLE creditors ENABLE ROW LEVEL SECURITY;
   ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

   -- Creditors RLS Policies
   CREATE POLICY "Users can view their own creditors"
   ON creditors FOR SELECT TO authenticated
   USING (true);

   CREATE POLICY "Users can insert their own creditors"
   ON creditors FOR INSERT TO authenticated
   WITH CHECK (user_id = (auth.uid())::uuid);

   CREATE POLICY "Users can update their own creditors"
   ON creditors FOR UPDATE TO authenticated
   USING (user_id = (auth.uid())::uuid);

   CREATE POLICY "Users can delete their own creditors"
   ON creditors FOR DELETE TO authenticated
   USING (user_id = (auth.uid())::uuid);

   -- Bills RLS Policies
   CREATE POLICY "Users can view their own bills"
   ON bills FOR SELECT TO authenticated
   USING (true);

   CREATE POLICY "Users can insert their own bills"
   ON bills FOR INSERT TO authenticated
   WITH CHECK (user_id = (auth.uid())::uuid);

   CREATE POLICY "Users can update their own bills"
   ON bills FOR UPDATE TO authenticated
   USING (user_id = (auth.uid())::uuid);

   CREATE POLICY "Users can delete their own bills"
   ON bills FOR DELETE TO authenticated
   USING (user_id = (auth.uid())::uuid);

   -- Create indexes
   CREATE INDEX bills_user_id_idx ON bills(user_id);
   CREATE INDEX bills_creditor_id_idx ON bills(creditor_id);
   CREATE INDEX bills_due_date_idx ON bills(due_date);
   CREATE INDEX creditors_user_id_idx ON creditors(user_id);
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Getting Started
1. **Sign Up** - Create an account using email/password or OAuth
2. **Add Creditors** - Navigate to the Creditors page and add your service providers
3. **Add Bills** - Create bills and assign them to creditors
4. **Set Recurring Bills** - Toggle "Recurring Bill" when adding bills that repeat
5. **Track Payments** - Mark bills as paid and view your payment history

### Recurring Bills
- Bills marked as recurring will automatically generate future instances
- The system creates bills for the next 3 months
- New instances are generated when you visit the Bills page

## 🗂️ Project Structure

```
billy/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── bills/             # Bills management
│   │   ├── calendar/          # Calendar view
│   │   ├── creditors/         # Creditors management
│   │   ├── dashboard/         # Dashboard
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Bill-dialog.tsx   # Bill creation/editing
│   │   ├── Creditor-dialog.tsx
│   │   └── Navbar.tsx
│   └── lib/
│       ├── supabase/         # Supabase clients
│       ├── types.ts          # TypeScript types
│       └── utils/            # Utility functions
│           └── recurring-bills.ts
├── public/                    # Static assets
├── .env.local                # Environment variables
└── package.json
```

## 🔒 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Authentication** - Secure login with Supabase Auth
- **Password Storage** - Bill login credentials encrypted at rest
- **Environment Variables** - Sensitive keys stored securely

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production
Make sure to add these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Ashley Brooks**
- GitHub: [@ashleyCodie](https://github.com/ashleyCodie

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## 📧 Support

For support, email a.brooks9385@gmail.com or open an issue in the GitHub repository.

---

**Built with ❤️ using Next.js and Supabase**
