# 🌱 Kissan Vikas – Health Awareness & Farmer Connection App

Kissan Vikas is a dual-purpose mobile application developed as part of a Community Engagement Project (CEP) with the goal of empowering rural communities. It bridges the gap in health education—especially around **leprosy awareness**—and fosters **peer-to-peer knowledge exchange among farmers**.

> 📍 Inspired by and created after field visits to the Anandwan community (Warora, Maharashtra), a model for self-sustained rehabilitation and inclusive development.

---

## 🚀 Tech Stack

### 🔧 Frontend

- **React Native (Expo)** – Cross-platform mobile app development.
- **Figma** – UI/UX design and prototyping.

### 🛠 Backend & Database

- **Supabase** – Open-source Firebase alternative for real-time database, authentication, and storage.
- **Clerk + Supabase Edge Functions** – Secure user authentication with role-based access.

### 📚 Content & Language Support

- **Gemini (Google)** – AI-powered content generation and verification.
- **Multilingual Support** – English, Hindi, and planned regional language expansion.

### 📨 Notifications

- **Firebase Cloud Messaging (FCM)** – Push notifications for app updates and interactions.

### ⚙️ DevOps & Project Management

- **GitHub Actions** – CI/CD pipeline for continuous deployment.
- **EAS Work** – Workflow pipeline for continoues production.
- **Trello / Notion** – Agile sprint planning and task management.

---

## ✨ Key Features

### 🩺 Leprosy Awareness Module

- **Educational Content**: Causes, symptoms, treatment, FAQs.
- **Myth vs. Fact**: Busted myths with science-backed information.
- **Multimedia Learning**: Infographics, animations, videos with voiceover support.
- **Recovery Stories**: Real-life inspirational testimonials.
- **Multilingual Access**: English, Hindi (Marathi and more coming soon).

### 🌾 Farmer Community Module

- **Post & Share**: Farmers can share their techniques, upload images, and describe practices.
- **Like, Comment & Save**: Encourages peer-to-peer engagement and knowledge exchange.
- **AI Moderation**: Grammar correction, harmful content filtering, and simplification of posts.
- **Local Language Support**: Ensures accessibility for semi-literate and multilingual users.
- **Future Additions**: Expert Q&A, video tutorials, integration with weather & government schemes.

---

## 📦 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/kissan-vikas-app.git
cd kissan-vikas-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the App (Expo)

```bash
npx expo start
```

> Make sure you have the Expo Go app installed on your Android/iOS device.

### 4. Environment Variables

Create a `.env` file with the necessary keys:

```

EXPO_PUBLIC_SUPABASE_URL= your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY= your_supabase_anon_key
GEMINI_API_KEY= your_gemini_api_key

```

---

## 📱 Deployment

- **App**: Finalizing for release on **Google Play Store**.
- **Web Version**: Hosted via **Expo Hosting**.
- **iOS Support**: Planned in future updates.

---

## 📊 Impact & Vision

Kissan Vikas is more than an app—it's a movement to:

- Combat health misinformation and leprosy stigma.
- Connect rural farmers through meaningful digital collaboration.
- Promote sustainable, scalable, and inclusive technological development.

---

## 📈 Future Enhancements

- Offline mode for rural low-network zones.
- Regional language expansion.
- Gamified rewards for active users.
- Discussion forums & expert advisory integration.
- Government/NGO partnerships for broader rollout.

---

## 🤝 Authors

- **Bhuvnesh Verma**

📚 Mentored by **Prof. Priyanka Mangalkar**

> 🎓 Shri Ramdeobaba College of Engineering & Management, Nagpur  
> 🗓️ Second Year – CSE (AIML) | Submitted on: 11/04/2025

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
