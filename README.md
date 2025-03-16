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

    - Execute the SQL script provided in `supabase/schema.sql` within your Supabase SQL editor.

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

## Web Deployment via EAS Hosting

To deploy the application on the web using EAS hosting, execute the following steps:

1. Prepare the project for web deployment:
   ```
   npx expo export --platform web
   ```
2. Deploy the project to the production environment:

   ```
   eas deploy --environment production
   ```

   This step generates a deployment URL.

3. Execute the production deployment to obtain the production URL:
   ```
   eas deploy --prod
   ```
