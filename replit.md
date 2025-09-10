# Overview

Maya Chat is an AI chatbot application that simulates a 23-year-old Indian girl named Maya/Kruthika. The app provides a WhatsApp-like chat interface with advanced AI personality simulation, multilingual support (English, Hindi, Kannada), and emotional state management. The application includes real-time chat features, status updates, media sharing capabilities, and comprehensive analytics tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The application is built with **Next.js 15** using the App Router architecture and React Server Components. The frontend follows a modern component-based design with:

- **UI Components**: Built with shadcn/ui and Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom WhatsApp-inspired green theme and responsive design
- **State Management**: Multiple React Context providers for different concerns:
  - `AIProfileContext` for AI personality settings
  - `AdSettingsContext` for advertisement configuration
  - `GlobalStatusContext` for status management
  - `AIMediaAssetsContext` for media asset management
- **Client-Side Rendering**: Extensive use of "use client" components for interactive features
- **Error Handling**: Global error boundary with graceful fallbacks

## Backend Architecture

### AI Processing Pipeline
- **Primary AI**: Google Vertex AI with Gemini 2.0 Flash Lite model for chat responses
- **Backup Systems**: Multiple fallback mechanisms including Google Generative AI SDK
- **Personality Simulation**: Complex emotional state simulation with time-based behavior patterns
- **Language Processing**: Automatic language detection and multilingual response generation
- **Response Flows**: Modular flow system for different response types (emotional states, offline messages, multilingual)

### API Structure
- **Chat API**: `/api/chat/route.ts` handles chat message processing with Vertex AI integration
- **Rate Limiting**: Middleware-based rate limiting (30 requests/minute per IP)
- **Error Handling**: Comprehensive fallback responses for API failures

## Data Storage Solutions

### Primary Database: Supabase (PostgreSQL)
The application uses Supabase with a well-structured schema:

- **messages_log**: Stores chat messages with metadata (sender type, timestamps, content)
- **ai_profile_settings**: AI personality configuration and status information
- **ad_settings**: Advertisement configuration and monetization settings
- **daily_activity_log**: Analytics and user activity tracking
- **app_configurations**: Global application settings storage
- **admin_status_display**: Administrative status management
- **managed_demo_contacts**: Demo contact management

### Data Access Patterns
- Context providers fetch data on component mount with loading states
- Real-time updates through Supabase client
- Optimistic updates for better user experience
- Fallback to default configurations when database is unavailable

## Authentication and Authorization

The application currently operates without traditional user authentication, using:
- Session-based identification through browser storage
- IP-based rate limiting for security
- Anonymous user tracking for analytics
- Service account authentication for Google Cloud services

## External Dependencies

### Google Cloud Services
- **Vertex AI**: Primary AI service for chat responses using Gemini models
- **Service Account**: Authentication via JSON credentials stored in environment variables
- **Project**: maya-chatbot-470113 in us-central1 region

### Database and Backend Services
- **Supabase**: PostgreSQL database with real-time capabilities
- **Connection**: Environment-based configuration with fallback handling

### Advertisement Networks
- **Adsterra**: Banner ads, social bar ads, and popunder advertisements
- **Monetag**: Alternative ad network with similar placement types
- **Configuration**: Dynamic ad enabling/disabling through database settings

### UI and Styling Libraries
- **shadcn/ui**: Pre-built component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **Lucide React**: Icon library for consistent iconography
- **Framer Motion**: Animation library for smooth transitions

### Development and Build Tools
- **Next.js 15**: React framework with App Router and server components
- **TypeScript**: Type safety throughout the application
- **Vercel**: Deployment platform with optimized Next.js hosting
- **Google Fonts**: Inter and Roboto fonts for typography

### Monitoring and Analytics
- **Custom Analytics**: Message counting and user activity tracking
- **Error Tracking**: Console-based error logging with user-friendly fallbacks
- **Performance**: Next.js built-in optimization with image optimization and code splitting