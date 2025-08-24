# Multi-Sport Betting Intelligence Web App

## Overview

This is a comprehensive multi-sport betting intelligence platform that provides advanced analytics and edge detection for MLB, NFL, and NBA betting opportunities. The application features a prop finder engine, elite player analytics, attack board for opponent exploitability, team intelligence, and an automated parlay builder. The system calculates sport-specific edge scores using mathematical models that consider factors like pitch matchups, recent form, environmental conditions, usage rates, and opponent tendencies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state and local React state for UI state
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization and performance analytics
- **Design System**: Custom design tokens with sport-specific color coding and dark theme optimization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with sport-specific endpoints for slate data, game analysis, and player edges
- **Data Layer**: Drizzle ORM for type-safe database operations
- **Services**: Modular service architecture with separate modules for sports data ingestion, edge calculation, and parlay building
- **Real-time Updates**: Scheduled refresh system with configurable intervals based on subscription tiers

### Database Architecture
- **Primary Database**: PostgreSQL using Neon serverless with connection pooling
- **ORM**: Drizzle with schema-first approach for type safety
- **Schema Design**: Normalized structure with entities for sports, teams, players, games, player stats, and calculated edges
- **Performance**: Indexed tables for fast queries on game dates, player edges, and team lookups
- **Session Storage**: PostgreSQL-based session management with connect-pg-simple

### Edge Calculation Engine
- **Sport-Specific Algorithms**: 
  - MLB: PitchMatchEdge + RecentForm + SlotVulnerability + Environment
  - NFL: RoleUsage + OpponentTendencies + Environment
  - NBA: MinutesUsage + OpponentRank + Pace + Environment
- **Normalization**: Z-score normalization per slate for consistent edge scoring
- **Confidence Scoring**: Multi-factor confidence calculation based on data quality and sample size
- **Caching Strategy**: Redis integration planned for performance optimization

### Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL storage
- **Subscription Tiers**: Free (limited access), Standard (full features), VIP (real-time updates + parlay builder)
- **Access Control**: Route-level protection based on subscription tier and feature gates

### Data Integration Strategy
- **External APIs**: Integration points for league APIs, weather services (Open-Meteo/NWS), and injury reports
- **ETL Pipeline**: Scheduled data refresh with configurable intervals (2-hourly standard, hourly on game days)
- **Data Validation**: Schema validation using Zod for incoming data integrity
- **Error Handling**: Graceful degradation with last-known-good data when API services are unavailable

### Performance Optimization
- **Code Splitting**: Vite-based build optimization with lazy loading for non-critical routes
- **Database Indexing**: Strategic indexes on frequently queried columns (gameDate, sportId, edgeScore)
- **Caching**: Browser caching for static assets and API response caching planned
- **Real-time Updates**: Optimistic updates with background refresh to maintain responsiveness

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **ORM**: Drizzle for type-safe database operations and migrations
- **Session Store**: connect-pg-simple for PostgreSQL-based session management

### UI Framework & Styling
- **React Ecosystem**: React 18 with TypeScript, Vite build tooling, and TanStack Query for data fetching
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with custom design tokens and responsive design patterns
- **Charts**: Recharts for data visualization and performance analytics

### Data & APIs
- **Sports Data**: Integration planned for league APIs (MLB, NFL, NBA) for schedules, lineups, and player statistics
- **Weather Service**: Open-Meteo and National Weather Service APIs for environmental data
- **Caching**: Upstash Redis planned for high-performance data caching
- **Validation**: Zod schemas for runtime type checking and data validation

### Development & Deployment
- **Build System**: Vite with TypeScript compilation and optimized bundling
- **Development Tools**: TypeScript strict mode, ESLint configuration, and hot module replacement
- **Deployment Target**: Designed for Vercel deployment with serverless function support
- **Monitoring**: Error boundary components and structured logging for production debugging

### Third-Party Integrations
- **Font Loading**: Google Fonts integration for typography (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation and formatting
- **Utilities**: clsx and tailwind-merge for conditional styling, nanoid for unique ID generation