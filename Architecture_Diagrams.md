# ДИАГРАМИ НА АРХИТЕКТУРАТА
## СИСТЕМА ЗА УПРАВЛЕНИЕ НА НОВИНИ И ИНТЕЛИГЕНТЕН ЧАТБОТ

### 1. СИСТЕМНА АРХИТЕКТУРА НА ВИСОКО НИВО

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

### 2. BACKEND API АРХИТЕКТУРА

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

### 3. FRONTEND КОМПОНЕНТНА АРХИТЕКТУРА

```mermaid
graph TB
    subgraph "Pages Layer"
        HP[HomePage]
        AP[ArticlePage]
        CP[CategoryPage]
        SP[SearchPage]
        ADMIN[AdminPage]
    end
    
    subgraph "Components Layer"
        subgraph "Article Components"
            AC[ArticleCard]
            AL[ArticleList]
            AD[ArticleDetail]
            AE[ArticleEditor]
        end
        
        subgraph "Common Components"
            NAV[Navigation]
            SEARCH_BOX[SearchBox]
            PAG[Pagination]
            HEADER[Header]
            FOOTER[Footer]
        end
        
        subgraph "Chat Components"
            CHATBOT[ChatbotWidget]
            MSG[ChatMessage]
            INPUT[ChatInput]
        end
    end
    
    subgraph "Services Layer"
        API_CLIENT[API Client]
        ARTICLE_SVC[ArticleService]
        CHAT_SVC[ChatbotService]
        AUTH_SVC[AuthService]
    end
    
    subgraph "State Management"
        CONTEXT[React Context]
        HOOKS[Custom Hooks]
        STORAGE[Local Storage]
    end
    
    HP --> AC
    HP --> AL
    AP --> AD
    ADMIN --> AE
    
    AC --> ARTICLE_SVC
    CHATBOT --> CHAT_SVC
    
    ARTICLE_SVC --> API_CLIENT
    CHAT_SVC --> API_CLIENT
    AUTH_SVC --> API_CLIENT
    
    CONTEXT --> HOOKS
    HOOKS --> STORAGE
```

### 4. БАЗА ДАННИ СХЕМА

```mermaid
erDiagram
    Users ||--o{ Articles : creates
    Categories ||--o{ Articles : contains
    Articles ||--o{ Comments : has
    Comments ||--o{ Comments : replies_to
    Users ||--o{ ChatConversations : participates
    
    Users {
        int Id PK
        string Username
        string Email
        string PasswordHash
        string FirstName
        string LastName
        string Role
        datetime CreatedAt
        datetime LastLoginAt
    }
    
    Categories {
        int Id PK
        string Name
        string Description
        int ParentId FK
        datetime CreatedAt
        datetime UpdatedAt
        bool IsActive
    }
    
    Articles {
        int Id PK
        string Title
        text Content
        string Summary
        int CategoryId FK
        int AuthorId FK
        datetime PublishedAt
        datetime CreatedAt
        datetime UpdatedAt
        bool IsPublished
        int ViewCount
        string[] Tags
    }
    
    Comments {
        int Id PK
        int ArticleId FK
        string AuthorName
        string AuthorEmail
        text Content
        int ParentId FK
        datetime CreatedAt
        bool IsApproved
    }
    
    ChatConversations {
        int Id PK
        string SessionId
        text UserMessage
        text BotResponse
        datetime CreatedAt
        int ResponseTime
    }
```

### 5. AI ЧАТБОТ АРХИТЕКТУРА

```mermaid
graph TB
    subgraph "Client Side"
        UI[Chat UI Component]
        INPUT[User Input]
        DISPLAY[Message Display]
    end
    
    subgraph "Backend API"
        CONTROLLER[ChatbotController]
        SERVICE[ChatbotService]
        CONTEXT[Context Preparation]
    end
    
    subgraph "AI Processing"
        OPENAI[OpenAI GPT-4o]
        PROMPT[System Prompt]
        RESPONSE[AI Response]
    end
    
    subgraph "Data Storage"
        HISTORY[(Chat History)]
        CACHE[(Response Cache)]
    end
    
    INPUT --> CONTROLLER
    CONTROLLER --> SERVICE
    SERVICE --> CONTEXT
    CONTEXT --> OPENAI
    OPENAI --> PROMPT
    PROMPT --> RESPONSE
    RESPONSE --> SERVICE
    SERVICE --> HISTORY
    SERVICE --> CACHE
    SERVICE --> DISPLAY
    
    style OPENAI fill:#ff9800
    style PROMPT fill:#ff9800
    style RESPONSE fill:#ff9800
```

### 6. ТЪРСЕНЕ АРХИТЕКТУРА (ХИБРИДНА СИСТЕМА)

```mermaid
graph TB
    subgraph "Search Interface"
        SEARCH_UI[Search Box]
        FILTERS[Search Filters]
        RESULTS[Results Display]
    end
    
    subgraph "Search Controller"
        CONTROLLER[HybridSearchController]
        SERVICE[HybridSearchService]
    end
    
    subgraph "Local Search"
        LOCAL[Local Database Search]
        FULLTEXT[Full-text Search]
        INDEXED[Indexed Queries]
    end
    
    subgraph "External Search"
        GOOGLE[Google Custom Search]
        EXTERNAL[External APIs]
    end
    
    subgraph "Result Processing"
        MERGE[Result Merging]
        RANK[Ranking Algorithm]
        FILTER[Result Filtering]
    end
    
    SEARCH_UI --> CONTROLLER
    FILTERS --> CONTROLLER
    CONTROLLER --> SERVICE
    SERVICE --> LOCAL
    SERVICE --> GOOGLE
    LOCAL --> FULLTEXT
    LOCAL --> INDEXED
    GOOGLE --> EXTERNAL
    FULLTEXT --> MERGE
    INDEXED --> MERGE
    EXTERNAL --> MERGE
    MERGE --> RANK
    RANK --> FILTER
    FILTER --> RESULTS
```

### 7. АВТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AuthService
    participant Database
    participant JWT
    
    Client->>API: Login Request (Username/Password)
    API->>AuthService: Validate Credentials
    AuthService->>Database: Check User Credentials
    Database-->>AuthService: User Data
    AuthService->>JWT: Generate Access Token
    AuthService->>JWT: Generate Refresh Token
    JWT-->>AuthService: Tokens
    AuthService-->>API: Authentication Response
    API-->>Client: Tokens + User Info
    
    Note over Client: Store tokens in localStorage
    
    Client->>API: Protected Resource Request + Bearer Token
    API->>JWT: Validate Token
    JWT-->>API: Token Valid/Invalid
    
    alt Token Valid
        API-->>Client: Protected Resource
    else Token Invalid
        API-->>Client: 401 Unauthorized
        Client->>API: Refresh Token Request
        API->>JWT: Validate Refresh Token
        JWT-->>API: New Access Token
        API-->>Client: New Access Token
    end
```

### 8. DEPLOYMENT АРХИТЕКТУРА

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

### ИЗПОЛЗВАНЕ НА ДИАГРАМИТЕ

За да създадете визуални диаграми от този код:

1. **Mermaid Диаграми**: Използвайте [mermaid.live](https://mermaid.live) или [mermaid.js](https://mermaid-js.github.io/mermaid/)
2. **Draw.io**: Импортирайте структурата в [draw.io](https://draw.io)
3. **Lucidchart**: Пресъздайте диаграмите в [lucidchart.com](https://lucidchart.com)
4. **Visio**: Използвайте Microsoft Visio за професионални диаграми

### ОПИСАНИЕ НА ДИАГРАМИТЕ

1. **Системна архитектура** - Общ преглед на цялата система
2. **Backend API** - Детайлна структура на сървърната логика
3. **Frontend компоненти** - Организация на React приложението
4. **База данни** - Релационна схема с всички таблици
5. **AI Чатбот** - Поток от данни за AI функционалността
6. **Търсене** - Хибридна система за локално и външно търсене
7. **Автентификация** - Последователност на JWT валидация
8. **Deployment** - От разработка до продукция

Тези диаграми покриват всички аспекти на архитектурата на вашата система!
