# Course Champion

A modern course management platform designed for educators who need secure content delivery, flexible release schedules, and seamless integration with existing documentation systems.

## 🚀 Key Features

- **Secure Video Hosting**: Protect your intellectual property with our copyright-protected video player that prevents unauthorized downloading or copying
- **Flexible Content Release**: Configure "drip" content releases based on time intervals or specific conditions
- **Manual Override**: Instantly release content to specific students or groups when needed
- **Notion Integration**: Seamlessly import and sync lecture notes from Notion, eliminating duplicate work
- **Automation Workflows**: Support for Make.com (formerly Integromat) for custom automation between platforms
- **Focused Experience**: Streamlined platform without unnecessary communication features
- **Subscription Payment**: Flexible subscription models with multiple payment providers

## 🛠️ Technology Stack

- **Frontend**: Vue.js
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Video Processing**: FFmpeg with HLS encryption
- **Authentication**: JWT with OAuth 2.0
- **Payment Processing**:
  - Stripe API integration
  - PayPal API integration
- **Integration APIs**: 
  - Notion API
  - Make.com connector
  - Slack API (optional)

## 🔄 Integration Options

CourseChampion focuses on integrating with your existing workflow:

- **Notion Sync**: Direct import from Notion pages to course modules
- **Make.com Workflows**: Create custom automation between any supported platforms
- **Slack Integration**: Optional notifications about course updates (no community features)

## 💰 Payment & Subscription Options

CourseChampion offers flexible monetization for your courses:

- **Multiple Payment Providers**:
  - Stripe for global card payments
  - PayPal for alternative payment methods
- **Subscription Models**:
  - Monthly recurring subscriptions
  - Annual plans with discounts
  - One-time course purchases
  - Custom payment schedules
- **Course Bundles**: Create and sell packaged course collections
- **Promotional Tools**: Discount codes, limited-time offers, and referral programs

## 🚫 What We Don't Do

CourseChampion intentionally does not include:
- Internal chat or community features
- Standalone discussion forums
- Messaging systems that would create additional monitoring overhead

## 📝 Code of Conduct

### Our Pledge

We pledge to make CourseChampion a tool that respects educators' time, protects their intellectual property, and enhances their teaching experience.

### Our Standards

- **Efficiency**: We prioritize features that save time and reduce duplicate work
- **Security**: We implement robust copyright protection for all hosted content
- **Integration**: We design our platform to work with your existing tools, not replace them
- **Simplicity**: We avoid feature bloat and maintain a focused, purpose-driven platform

### Our Responsibilities

- Maintain a secure and reliable platform for educational content
- Respect user privacy and intellectual property rights
- Provide timely support for technical issues
- Continuously improve based on educator feedback

## 🔄 Development Roadmap

- [ ] Secure video hosting with copyright protection
- [ ] Flexible content release scheduling
- [ ] Manual content release controls
- [ ] Notion integration for lecture notes
- [ ] Stripe and PayPal payment integrations
- [ ] Subscription management system
- [ ] Enhanced Make.com workflow templates
- [ ] Optional Slack integration for notifications
- [ ] Advanced analytics dashboard

## 📜 License

CourseChampion is licensed under the [MIT License](LICENSE).

## 📋 Change History

### Version 0.1.0 (Initial Release)

- Created basic project structure
- Set up Vue.js frontend with the following views:
  - Home page
  - Courses listing page
  - Login page
  - Registration page
  - 404 Not Found page
- Set up Node.js/Express backend with the following endpoints:
  - `/api/auth` for authentication
  - `/api/courses` for course management
  - `/api/users` for user profile management
- Implemented mock API endpoints for development
- Added responsive design with mobile-friendly layouts
- Set up project documentation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL (v12 or later)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/coursechampion.git
   cd coursechampion
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   Then update the `.env` file with your database credentials and JWT secret

4. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

5. Run the development servers

   Backend:
   ```
   cd backend
   npm run dev
   ```

   Frontend:
   ```
   cd frontend
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:8080`