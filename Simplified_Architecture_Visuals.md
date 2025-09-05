# Simplified and Corrected Visual Representation of Project Architecture

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WB[Web Browser - React SPA]
        MB[Mobile Browser - Responsive]
        AP[Admin Panel - Management UI]
    end

    subgraph "Load Balancer"
        LB[Load Balancer - NGINX/Azure LB]
    end

    subgraph "Application Layer"
        API[ASP.NET Core API - Business Logic]
        AUTH[Authentication Service - JWT Tokens]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL - Primary Database)]
        CACHE[(Redis - Cache Layer)]
        FILES[File Storage - Media Assets]
    end

    subgraph "External Services"
        OPENAI[OpenAI API - GPT-4o]
        GOOGLE[Google Search API - Custom Search]
        EMAIL[Email Service - SMTP Provider]
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

---

This simplified Mermaid code ensures compatibility with Mermaid's rendering engine. You can copy this code into [mermaid.live](https://mermaid.live) to generate the diagram. Let me know if you need further assistance!
