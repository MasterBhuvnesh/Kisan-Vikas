# Expo Template with Supabase Auth and User Management

This Expo template provides a ready-to-use setup for **authentication** and **user management** using **Supabase**. It includes features like dark/light theme support, profile updates, and email templates for user onboarding.

---

## Features

- **Supabase Authentication**:

  - Sign up, login, and password reset functionality.
  - Email confirmation with OTP (One-Time Password).

- **User Management**:

  - Update user profile (full name, date of birth, profile picture).
  - Upload profile pictures (supports images and GIFs).

- **Theme Support**:

  - Light and dark theme support using a theme provider.

- **Icons**:

  - Uses `react-native-heroicons` for beautiful and consistent icons.

- **Email Templates**:
  - Customizable email templates for signup and password reset.

---

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js** and **npm** installed.
- An active **Supabase** project with the following setup: [ easily done using provided schema ]
  - Authentication enabled.
  - A `users` table in your database for user management.
  - Storage bucket for profile pictures.

---

## Setup

### 1. Install Dependencies

Run the following commands to install the required dependencies:

```bash
npm install react-native-heroicons
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install expo-image
npx expo install expo-document-picker
```

### 2. Configure Supabase

1.  **Create a Supabase Project**:

    - Go to [Supabase](https://supabase.com/) and create a new project.
    - Enable **Email Authentication** and configure the email templates.

2.  **Set Up the Supabase for auth & user management Table**:

    - Run the following SQL script in your Supabase SQL editor :

           ```sql

            CREATE TABLE users (
            id UUID REFERENCES auth.users ON DELETE CASCADE,
            username TEXT UNIQUE NOT NULL,
            fullname TEXT,
            email TEXT UNIQUE NOT NULL,
            profile_pic TEXT,
            date_of_birth DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            PRIMARY KEY (id)
            );

      ALTER TABLE users ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can manage their own data" ON users
      FOR ALL
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

      INSERT INTO storage.buckets (id, name, public)
      VALUES ('profile_pics', 'profile_pics', true);

      CREATE POLICY "Allow all uploads to profile_pics" ON storage.objects
      FOR INSERT
      TO public
      WITH CHECK (bucket_id = 'profile_pics');

      CREATE POLICY "Allow all reads from profile_pics" ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'profile_pics');

      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
      username TEXT;
      BEGIN
      username := split_part(NEW.email, '@', 1);

      INSERT INTO public.users (id, email, username)
      VALUES (NEW.id, NEW.email, username);

      RETURN NEW;
      END;

      $$
      LANGUAGE plpgsql SECURITY DEFINER;

        CREATE OR REPLACE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();

        ALTER TABLE users ENABLE ROW LEVEL SECURITY;

        ALTER PUBLICATION supabase_realtime
      ADD TABLE users;
      $$

    ```

    ```

3.  **Update Environment Variables**:

    - Add your Supabase URL and public key to your project's environment variables:

      ```env
      SUPABASE_URL=your-supabase-url
      SUPABASE_KEY=your-supabase-public-key
      ```

### 3. Customize Email Templates

Update the **Signup Email Template** in your Supabase project with the following content:

```html
<h2>Welcome to SecureSync!</h2>

<p>
  Thank you for signing up. To complete your registration and secure your
  account, please confirm your email address using the OTP below:
</p>

<p><strong>Your OTP: {{ .Token }}</strong></p>

<p>Alternatively, you can confirm your email by clicking the link below:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm My Email</a></p>

<p>If you didn’t sign up for SecureSync, you can safely ignore this email.</p>

<p>Stay secure,<br />The SecureSync Team</p>
```

---

## Project Structure

- **`app/(auth)`**:

  - Contains authentication screens (login, signup, OTP verification, password reset).

- **`app/(tabs)`**:

  - Contains the main app screens (home, profile, etc.).

- **`components/`**:

  - Reusable components like `StyledText` and `ThemedView`.

- **`lib/`**:

  - Contains the Supabase client configuration.

- **`constants/`**:
  - Contains theme colors and other constants.

---

## Key Components

### 1. **Supabase Client**

The Supabase client is configured in `lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const storage = Platform.OS === "web" ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
```

### 2. **Theme Provider**

The theme provider is implemented using `useColorScheme` from `react-native`:

```typescript
import { useColorScheme } from "react-native";

export const useTheme = () => {
  const theme = useColorScheme() ?? "light";
  return Colors[theme];
};
```

### 3. **Profile Update**

The profile update screen allows users to:

- Update their full name and date of birth.
- Upload a profile picture (supports images and GIFs).

---

## Running the Project

1. Start the development server:

   ```bash
   npx expo start
   ```

2. Scan the QR code with the Expo Go app or run on an emulator.

## Acknowledgments

- [Supabase](https://supabase.com/) for providing the backend services.
- [Expo](https://expo.dev/) for the development framework.
- [Heroicons](https://heroicons.com/) for the beautiful icons.

$$
$$
