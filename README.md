# News Website Project

A full-stack news website built with .NET Core Web API backend, React TypeScript frontend, and PostgreSQL database.

## Project Overview

A complete news management system with user authentication, article management, and interactive features.

### Features
- User registration and authentication with JWT
- Admin users can create, edit, and delete news articles
- Article management with categories, images, and content
- User interactions: like/dislike articles and comments
- Homepage displaying latest news articles
- Search functionality by article title
- Responsive design with Material-UI

## Tech Stack

### Backend (.NET Core)
- **ASP.NET Core Web API** - RESTful API
- **Entity Framework Core** - ORM with PostgreSQL
- **ASP.NET Core Identity** - User management and authentication
- **JWT Authentication** - Secure token-based auth
- **Swagger** - API documentation

### Frontend (React TypeScript)
- **React 18** with TypeScript
- **Material-UI (MUI)** - Modern React UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Context** - State management for authentication

### Database
- **PostgreSQL** - Primary database
- **Entity Framework Migrations** - Database schema management

## Project Structure

```
├── backend/                 # .NET Core Web API
│   ├── Controllers/         # API endpoints
│   ├── Models/             # Data models
│   ├── DTOs/               # Data Transfer Objects
│   ├── Services/           # Business logic
│   ├── Data/               # Database context
│   └── Program.cs          # Application entry point
├── frontend/               # React TypeScript app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React contexts
│   │   └── App.tsx         # Main app component
└── README.md
```

## Getting Started

### Prerequisites
- .NET 9 SDK
- Node.js 18+ and npm
- PostgreSQL 14+

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Configure the database connection in appsettings.json:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=NewsWebsiteDB;Username=postgres;Password=your_password"
     }
   }
   ```

3. **Install dependencies and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

   The API will be available at `https://localhost:7075`

4. **Default admin account:**
   - Email: `admin@newswebsite.com`
   - Password: `Admin123!`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`

### Database Setup

The application will automatically create the database and seed initial data including:
- Default categories (Technology, Sports, Politics, Entertainment, Health)
- Admin user account

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Articles
- `GET /api/articles` - Get articles with pagination and filtering
- `GET /api/articles/{id}` - Get article by ID
- `POST /api/articles` - Create article (Admin only)
- `PUT /api/articles/{id}` - Update article (Admin only)
- `DELETE /api/articles/{id}` - Delete article (Admin only)
- `POST /api/articles/{id}/like` - Like/dislike article

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)

### Comments
- `GET /api/comments/article/{articleId}` - Get article comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

## Features

### User Features
- User registration and login
- Browse latest news articles
- Search articles by title
- Filter articles by category
- Read full articles
- Like/dislike articles
- Comment on articles
- Responsive design for mobile and desktop

### Admin Features
- Create, edit, and delete news articles
- Manage article categories
- Rich content editor for article body
- Image upload for articles
- Publish/unpublish articles

## Development Notes

### Backend Architecture
- **Repository Pattern** with Entity Framework
- **JWT Authentication** with configurable expiration
- **CORS** configured for React frontend
- **Swagger** for API documentation
- **Database seeding** for initial data

### Frontend Architecture
- **Component-based** architecture with React
- **TypeScript** for type safety
- **Material-UI** for consistent design
- **Context API** for authentication state
- **Axios interceptors** for auth token management
- **Error handling** with user-friendly messages

### Security Features
- JWT token-based authentication
- Password hashing with BCrypt
- CORS protection
- Input validation and sanitization
- Role-based authorization (Admin/User)

## Future Enhancements

- Advanced search with filters
- User profiles and preferences
- Article bookmarking
- Email notifications
- Social media sharing
- Article tags and advanced categorization
- Rich text editor for comments
- Image upload functionality
- Article analytics and statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
