# СИСТЕМА ЗА УПРАВЛЕНИЕ НА НОВИНИ И ИНТЕЛИГЕНТЕН ЧАТБОТ
## АРХИТЕКТУРА НА ПРИЛОЖЕНИЕТО

### ОБЩ ПРЕГЛЕД НА АРХИТЕКТУРАТА

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Web Browser   │  │  Mobile Browser │  │   Admin Panel   │     │
│  │   (React SPA)   │  │   (Responsive)  │  │   (React Admin) │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │    React.js     │  │   TypeScript    │  │   Material-UI   │     │
│  │   Components    │  │   Type Safety   │  │   UI Library    │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │    AI Chatbot   │  │   Search Box    │  │   Navigation    │     │
│  │   Component     │  │   Component     │  │   Component     │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                          HTTPS/REST API
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │      CORS       │  │  Authentication │  │   Rate Limiting │     │
│  │   Middleware    │  │   JWT Bearer    │  │   Middleware    │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ ArticlesController│ │CategoriesController│ │CommentsController│   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ChatbotController│  │HybridSearchController│ │AuthController│      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVICES LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ ArticleService  │  │ CategoryService │  │ CommentService  │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ ChatbotService  │  │HybridSearchService│ │   AuthService   │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA ACCESS LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ApplicationDbContext│ │  Repository   │  │   Migrations    │     │
│  │ Entity Framework│  │   Pattern      │  │   Management    │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   PostgreSQL    │  │   Redis Cache   │  │   File Storage  │     │
│  │   Primary DB    │  │   Session/Cache │  │   Media Files   │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   OpenAI API    │  │Google Search API│  │   Email Service │     │
│  │   GPT-4o Model  │  │Custom Search CSE│  │   SMTP Provider │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### ДЕТАЙЛНА КОМПОНЕНТНА АРХИТЕКТУРА

#### 1. FRONTEND АРХИТЕКТУРА (React.js)

```
Frontend Application (React SPA)
├── src/
│   ├── components/           # Преизползваеми UI компоненти
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── SearchBox.tsx
│   │   │   └── Pagination.tsx
│   │   ├── articles/
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleList.tsx
│   │   │   ├── ArticleDetail.tsx
│   │   │   └── ArticleEditor.tsx
│   │   ├── categories/
│   │   │   ├── CategoryTree.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   └── CategorySelector.tsx
│   │   ├── comments/
│   │   │   ├── CommentSection.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── CommentThread.tsx
│   │   └── chatbot/
│   │       ├── ChatbotWidget.tsx
│   │       ├── ChatMessage.tsx
│   │       └── ChatInput.tsx
│   ├── pages/               # Основни страници
│   │   ├── HomePage.tsx
│   │   ├── ArticlePage.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── services/            # API комуникация
│   │   ├── articleService.ts
│   │   ├── categoryService.ts
│   │   ├── commentService.ts
│   │   ├── chatbotService.ts
│   │   ├── searchService.ts
│   │   └── authService.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useArticles.ts
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useInfiniteScroll.ts
│   ├── context/             # React Context
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   ├── utils/               # Помощни функции
│   │   ├── dateHelpers.ts
│   │   ├── textHelpers.ts
│   │   ├── apiClient.ts
│   │   └── constants.ts
│   └── types/               # TypeScript типове
│       ├── article.types.ts
│       ├── category.types.ts
│       ├── comment.types.ts
│       ├── chat.types.ts
│       └── auth.types.ts
```

#### 2. BACKEND АРХИТЕКТУРА (ASP.NET Core)

```
Backend API (ASP.NET Core)
├── Controllers/             # API контролери
│   ├── ArticlesController.cs
│   ├── CategoriesController.cs
│   ├── CommentsController.cs
│   ├── ChatbotController.cs
│   ├── HybridSearchController.cs
│   └── AuthController.cs
├── Services/                # Бизнес логика
│   ├── Interfaces/
│   │   ├── IArticleService.cs
│   │   ├── ICategoryService.cs
│   │   ├── ICommentService.cs
│   │   ├── IChatbotService.cs
│   │   ├── IHybridSearchService.cs
│   │   └── IAuthService.cs
│   └── Implementations/
│       ├── ArticleService.cs
│       ├── CategoryService.cs
│       ├── CommentService.cs
│       ├── ChatbotService.cs
│       ├── HybridSearchService.cs
│       └── AuthService.cs
├── Data/                    # Data Access Layer
│   ├── ApplicationDbContext.cs
│   ├── Entities/
│   │   ├── Article.cs
│   │   ├── Category.cs
│   │   ├── Comment.cs
│   │   ├── User.cs
│   │   └── ChatConversation.cs
│   ├── Repositories/
│   │   ├── IRepository.cs
│   │   ├── Repository.cs
│   │   └── UnitOfWork.cs
│   └── Migrations/
├── DTOs/                    # Data Transfer Objects
│   ├── ArticleDTO.cs
│   ├── CategoryDTO.cs
│   ├── CommentDTO.cs
│   ├── ChatRequestDTO.cs
│   ├── ChatResponseDTO.cs
│   └── SearchResultDTO.cs
├── Middleware/              # Custom middleware
│   ├── ErrorHandlingMiddleware.cs
│   ├── LoggingMiddleware.cs
│   └── RateLimitingMiddleware.cs
├── Configuration/           # Конфигурация
│   ├── JwtConfiguration.cs
│   ├── DatabaseConfiguration.cs
│   └── ExternalServicesConfiguration.cs
└── Utils/                   # Помощни класове
    ├── JwtTokenGenerator.cs
    ├── PasswordHasher.cs
    └── FileUploadHelper.cs
```

#### 3. БАЗА ДАННИ СХЕМА (PostgreSQL)

```
Database Schema (PostgreSQL)
├── Tables
│   ├── Users
│   │   ├── Id (PK)
│   │   ├── Username
│   │   ├── Email
│   │   ├── PasswordHash
│   │   ├── FirstName
│   │   ├── LastName
│   │   ├── Role
│   │   ├── CreatedAt
│   │   └── LastLoginAt
│   ├── Categories
│   │   ├── Id (PK)
│   │   ├── Name
│   │   ├── Description
│   │   ├── ParentId (FK)
│   │   ├── CreatedAt
│   │   ├── UpdatedAt
│   │   └── IsActive
│   ├── Articles
│   │   ├── Id (PK)
│   │   ├── Title
│   │   ├── Content
│   │   ├── Summary
│   │   ├── CategoryId (FK)
│   │   ├── AuthorId (FK)
│   │   ├── PublishedAt
│   │   ├── CreatedAt
│   │   ├── UpdatedAt
│   │   ├── IsPublished
│   │   ├── ViewCount
│   │   └── Tags (Array)
│   ├── Comments
│   │   ├── Id (PK)
│   │   ├── ArticleId (FK)
│   │   ├── AuthorName
│   │   ├── AuthorEmail
│   │   ├── Content
│   │   ├── ParentId (FK)
│   │   ├── CreatedAt
│   │   └── IsApproved
│   └── ChatConversations
│       ├── Id (PK)
│       ├── SessionId
│       ├── UserMessage
│       ├── BotResponse
│       ├── CreatedAt
│       └── ResponseTime
├── Indexes
│   ├── IX_Articles_CategoryId
│   ├── IX_Articles_AuthorId
│   ├── IX_Articles_PublishedAt
│   ├── IX_Comments_ArticleId
│   ├── IX_Categories_ParentId
│   └── IX_Articles_FullText (Full-text search)
└── Constraints
    ├── FK_Articles_Categories
    ├── FK_Articles_Users
    ├── FK_Comments_Articles
    ├── FK_Comments_Comments (self-reference)
    └── FK_Categories_Categories (self-reference)
```

### ТЕХНОЛОГИЧЕН СТЕК

#### Frontend Technologies
- **React.js 18** - UI Framework
- **TypeScript 5.0** - Type Safety
- **Material-UI (MUI) 5** - Component Library
- **Vite 4** - Build Tool
- **React Router 6** - Client-side Routing
- **Axios** - HTTP Client
- **React Query** - Server State Management
- **React Hook Form** - Form Management

#### Backend Technologies
- **ASP.NET Core 8.0** - Web API Framework
- **Entity Framework Core 8.0** - ORM
- **PostgreSQL 15** - Primary Database
- **Redis** - Caching
- **JWT Bearer Authentication** - Security
- **Swagger/OpenAPI** - API Documentation
- **Serilog** - Logging

#### External Services
- **OpenAI GPT-4o** - AI Chatbot
- **Google Custom Search API** - External Search
- **SendGrid/SMTP** - Email Service
- **Azure Blob Storage** - File Storage (optional)

### АРХИТЕКТУРНИ МОДЕЛИ

#### 1. MVC Pattern (Backend)
```
Model (Data Layer)
├── Entity Models
├── DTOs
└── ViewModels

View (Presentation Layer)
├── API Responses
├── JSON Serialization
└── Error Responses

Controller (Business Logic)
├── HTTP Request Handling
├── Business Rule Enforcement
└── Response Generation
```

#### 2. Component Architecture (Frontend)
```
Smart Components (Containers)
├── State Management
├── API Calls
├── Business Logic
└── Data Processing

Dumb Components (Presentational)
├── UI Rendering
├── Event Handling
├── Props Receiving
└── Pure Functions
```

#### 3. Repository Pattern (Data Access)
```
Repository Interface
├── CRUD Operations
├── Query Methods
├── Async Operations
└── Transaction Support

Repository Implementation
├── Entity Framework Context
├── Query Optimization
├── Error Handling
└── Connection Management
```

### БЕЗОПАСНОСТ И АВТЕНТИФИКАЦИЯ

#### JWT Authentication Flow
```
Client Login Request
        ▼
Auth Controller Validates Credentials
        ▼
Generate JWT Token (Access + Refresh)
        ▼
Return Tokens to Client
        ▼
Client Stores Tokens
        ▼
Subsequent Requests Include Bearer Token
        ▼
JWT Middleware Validates Token
        ▼
Allow/Deny Access to Resources
```

#### Security Measures
- **HTTPS Enforcement**
- **CORS Configuration**
- **Rate Limiting**
- **Input Validation**
- **SQL Injection Prevention**
- **XSS Protection**
- **Password Hashing (bcrypt)**
- **JWT Token Expiration**

### ПРОИЗВОДИТЕЛНОСТ И МАЩАБИРУЕМОСТ

#### Caching Strategy
- **Redis Cache** for frequently accessed data
- **Memory Cache** for application-level caching
- **HTTP Caching** headers for static content
- **Database Query Optimization** with indexes

#### Performance Optimizations
- **Database Indexing** on commonly queried fields
- **Lazy Loading** for related entities
- **Pagination** for large data sets
- **Image Optimization** and compression
- **CDN** for static assets
- **Minification** of CSS/JS files

### МОНИТОРИНГ И ЛОГВАНЕ

#### Logging Strategy
```
Application Logs
├── Information Logs
├── Warning Logs
├── Error Logs
└── Debug Logs (Development only)

Log Destinations
├── Console Output
├── File System
├── Database Logging
└── External Services (e.g., Application Insights)
```

#### Monitoring Points
- **API Response Times**
- **Database Query Performance**
- **Error Rates**
- **User Activity**
- **System Resource Usage**
- **External Service Dependencies**

### DEPLOYMENT АРХИТЕКТУРА

#### Development Environment
```
Developer Machine
├── Visual Studio Code / Visual Studio
├── Local PostgreSQL Instance
├── Local Redis Instance
├── Node.js Development Server
└── .NET Development Server
```

#### Production Environment
```
Cloud Infrastructure (Azure/AWS)
├── Web App Service (Backend API)
├── Static Web App (Frontend SPA)
├── Managed PostgreSQL Database
├── Redis Cache Service
├── CDN for Static Assets
└── Application Insights/Monitoring
```

Тази архитектура осигурява модерно, скалируемо и поддържаемо решение за система за управление на новини с интегриран AI чатбот.
