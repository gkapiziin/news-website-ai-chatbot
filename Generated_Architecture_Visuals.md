# Visual Representation of Project Architecture

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WB[Web Browser<br/>React SPA]
        MB[Mobile Browser<br/>Responsive]
        AP[Admin Panel<br/>Management UI]
    end

    subgraph "Load Balancer"
        LB[Load Balancer<br/>NGINX/Azure LB]
    end

    subgraph "Application Layer"
        API[ASP.NET Core API<br/>Business Logic]
        AUTH[Authentication Service<br/>JWT Tokens]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Primary Database)]
        CACHE[(Redis<br/>Cache Layer)]
        FILES[File Storage<br/>Media Assets]
    end

    subgraph "External Services"
        OPENAI[OpenAI API<br/>GPT-4o]
        GOOGLE[Google Search API<br/>Custom Search]
        EMAIL[Email Service<br/>SMTP Provider]
    end

    WB --> LB
    MB --> LB
    AP --> LB
    LB --> API
    LB --> AUTH
    API --> DB
    API --> CACHE
    API --> FILES
    API --> OPENAI
    API --> GOOGLE
    API --> EMAIL

    style WB fill:#e1f5fe
    style MB fill:#e1f5fe
    style AP fill:#e1f5fe
    style API fill:#f3e5f5
    style DB fill:#e8f5e8
    style CACHE fill:#fff3e0
    style OPENAI fill:#fce4ec
    style GOOGLE fill:#fce4ec
```

## Backend API Architecture

```mermaid
graph TB
    subgraph "Controllers Layer"
        AC[ArticlesController]
        CC[CategoriesController]
        COM[CommentsController]
        CHAT[ChatbotController]
        SEARCH[HybridSearchController]
        AUTH[AuthController]
    end

    subgraph "Services Layer"
        AS[ArticleService]
        CS[CategoryService]
        COMS[CommentService]
        CHATS[ChatbotService]
        SS[HybridSearchService]
        AUTHS[AuthService]
    end

    subgraph "Data Access Layer"
        REPO[Repository Pattern]
        UOW[Unit of Work]
        EF[Entity Framework<br/>DbContext]
    end

    subgraph "Database"
        DB[(PostgreSQL)]
    end

    AC --> AS
    CC --> CS
    COM --> COMS
    CHAT --> CHATS
    SEARCH --> SS
    AUTH --> AUTHS

    AS --> REPO
    CS --> REPO
    COMS --> REPO
    CHATS --> REPO
    SS --> REPO
    AUTHS --> REPO

    REPO --> UOW
    UOW --> EF
    EF --> DB

    style AC fill:#bbdefb
    style CC fill:#bbdefb
    style COM fill:#bbdefb
    style CHAT fill:#bbdefb
    style SEARCH fill:#bbdefb
    style AUTH fill:#bbdefb
    style AS fill:#c8e6c9
    style CS fill:#c8e6c9
    style COMS fill:#c8e6c9
    style CHATS fill:#c8e6c9
    style SS fill:#c8e6c9
    style AUTHS fill:#c8e6c9
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV_FE[Frontend Dev Server<br/>Vite + React]
        DEV_BE[Backend Dev Server<br/>ASP.NET Core]
        DEV_DB[Local PostgreSQL]
        DEV_REDIS[Local Redis]
    end

    subgraph "CI/CD Pipeline"
        GIT[Git Repository]
        BUILD[Build Pipeline]
        TEST[Test Pipeline]
        DEPLOY[Deployment Pipeline]
    end

    subgraph "Production Cloud"
        LB[Load Balancer]
        FE_PROD[Static Web App<br/>React Build]
        BE_PROD[App Service<br/>ASP.NET Core]
        DB_PROD[Managed PostgreSQL]
        CACHE_PROD[Redis Cache]
        CDN[CDN for Assets]
        MONITOR[Application Insights]
    end

    DEV_FE --> GIT
    DEV_BE --> GIT
    GIT --> BUILD
    BUILD --> TEST
    TEST --> DEPLOY
    DEPLOY --> FE_PROD
    DEPLOY --> BE_PROD

    LB --> FE_PROD
    LB --> BE_PROD
    BE_PROD --> DB_PROD
    BE_PROD --> CACHE_PROD
    FE_PROD --> CDN
    BE_PROD --> MONITOR

    style DEV_FE fill:#e3f2fd
    style DEV_BE fill:#e3f2fd
    style FE_PROD fill:#e8f5e8
    style BE_PROD fill:#e8f5e8
    style DB_PROD fill:#fff3e0
    style CACHE_PROD fill:#fff3e0
```

---

These diagrams represent the high-level system architecture, backend API structure, and deployment pipeline. You can copy the Mermaid code into [mermaid.live](https://mermaid.live) to generate visual diagrams.
