using Microsoft.EntityFrameworkCore;
using NewsWebsite.API.Data;
using NewsWebsite.API.DTOs;
using NewsWebsite.API.Models;

namespace NewsWebsite.API.Services
{
    public class ArticleService : IArticleService
    {
        private readonly ApplicationDbContext _context;

        public ArticleService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ArticleListDto>> GetArticlesAsync(int page = 1, int pageSize = 10, string? search = null, int? categoryId = null)
        {
            var query = _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Where(a => a.IsPublished);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.Title.Contains(search) || a.Body.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(a => a.CategoryId == categoryId.Value);
            }

            var articles = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new ArticleListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Preview = a.Preview,
                    AuthorName = a.Author.UserName ?? "Unknown",
                    CategoryName = a.Category.Name,
                    CreatedAt = a.CreatedAt,
                    ImageUrl = a.ImageUrl,
                    LikeCount = a.LikeCount,
                    CommentCount = a.CommentCount,
                    DislikeCount = a.DislikeCount,
                    IsPublished = a.IsPublished
                })
                .ToListAsync();

            return articles;
        }

        public async Task<ArticleDto?> GetArticleByIdAsync(int id)
        {
            return await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Include(a => a.Comments)
                    .ThenInclude(c => c.User)
                .Where(a => a.Id == id && a.IsPublished)
                .Select(a => new ArticleDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Body = a.Body,
                    Preview = a.Preview,
                    Author = new UserDto 
                    { 
                        Id = a.Author.Id,
                        Email = a.Author.Email ?? "",
                        FirstName = a.Author.FirstName ?? "",
                        LastName = a.Author.LastName ?? "",
                        IsAdmin = false
                    },
                    Category = new CategoryDto 
                    { 
                        Id = a.Category.Id,
                        Name = a.Category.Name
                    },
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    ImageUrl = a.ImageUrl,
                    LikeCount = a.LikeCount,
                    CommentCount = a.CommentCount,
                    DislikeCount = a.DislikeCount,
                    IsPublished = a.IsPublished,
                    Comments = a.Comments.Select(c => new CommentDto
                    {
                        Id = c.Id,
                        Content = c.Content,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt,
                        User = new UserDto
                        {
                            Id = c.User.Id,
                            Email = c.User.Email ?? "",
                            FirstName = c.User.FirstName ?? "",
                            LastName = c.User.LastName ?? "",
                            IsAdmin = false
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ArticleDto> CreateArticleAsync(CreateArticleDto dto, string authorId)
        {
            var article = new NewsArticle
            {
                Title = dto.Title,
                Preview = dto.Preview,
                Body = dto.Body,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId,
                AuthorId = authorId,
                IsPublished = dto.IsPublished,
                CreatedAt = DateTime.UtcNow
            };

            _context.Articles.Add(article);
            await _context.SaveChangesAsync();

            return (await GetArticleByIdAsync(article.Id))!;
        }

        public async Task<ArticleDto?> UpdateArticleAsync(int id, UpdateArticleDto dto, string authorId)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id && a.AuthorId == authorId);
            if (article == null) return null;

            if (!string.IsNullOrEmpty(dto.Title)) article.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Preview)) article.Preview = dto.Preview;
            if (!string.IsNullOrEmpty(dto.Body)) article.Body = dto.Body;
            if (!string.IsNullOrEmpty(dto.ImageUrl)) article.ImageUrl = dto.ImageUrl;
            if (dto.CategoryId.HasValue) article.CategoryId = dto.CategoryId.Value;
            if (dto.IsPublished.HasValue) article.IsPublished = dto.IsPublished.Value;

            article.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetArticleByIdAsync(id);
        }

        public async Task<bool> DeleteArticleAsync(int id, string authorId)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id && a.AuthorId == authorId);
            if (article == null) return false;

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> LikeArticleAsync(int id, string userId)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id);
            if (article == null) return false;

            // Check if user already liked/disliked
            var existingLike = await _context.ArticleLikes
                .FirstOrDefaultAsync(al => al.ArticleId == id && al.UserId == userId);

            if (existingLike == null)
            {
                // Add new like
                _context.ArticleLikes.Add(new ArticleLike 
                { 
                    ArticleId = id, 
                    UserId = userId,
                    IsLike = true
                });
                await _context.SaveChangesAsync();
            }
            else if (!existingLike.IsLike)
            {
                // Change dislike to like
                existingLike.IsLike = true;
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> DislikeArticleAsync(int id, string userId)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id);
            if (article == null) return false;

            // Check if user already liked/disliked
            var existingLike = await _context.ArticleLikes
                .FirstOrDefaultAsync(al => al.ArticleId == id && al.UserId == userId);

            if (existingLike == null)
            {
                // Add new dislike
                _context.ArticleLikes.Add(new ArticleLike 
                { 
                    ArticleId = id, 
                    UserId = userId,
                    IsLike = false
                });
                await _context.SaveChangesAsync();
            }
            else if (existingLike.IsLike)
            {
                // Change like to dislike
                existingLike.IsLike = false;
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<List<ArticleListDto>> GetTrendingArticlesAsync(int count = 10)
        {
            return await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Where(a => a.IsPublished)
                .OrderByDescending(a => a.LikeCount + a.CommentCount)
                .ThenByDescending(a => a.CreatedAt)
                .Take(count)
                .Select(a => new ArticleListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Preview = a.Preview,
                    AuthorName = a.Author.UserName ?? "Unknown",
                    CategoryName = a.Category.Name,
                    CreatedAt = a.CreatedAt,
                    ImageUrl = a.ImageUrl,
                    LikeCount = a.LikeCount,
                    CommentCount = a.CommentCount,
                    DislikeCount = a.DislikeCount,
                    IsPublished = a.IsPublished
                })
                .ToListAsync();
        }

        public async Task<List<ArticleListDto>> SearchArticlesAsync(string query, int maxResults = 20)
        {
            // Split query into words and make case-insensitive search
            var searchTerms = query.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            
            return await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Where(a => a.IsPublished && 
                    searchTerms.Any(term => 
                        a.Title.ToLower().Contains(term) || 
                        a.Body.ToLower().Contains(term) || 
                        a.Preview.ToLower().Contains(term)))
                .OrderByDescending(a => 
                    // Relevance scoring: title matches get higher priority
                    (searchTerms.Count(term => a.Title.ToLower().Contains(term)) * 3) +
                    (searchTerms.Count(term => a.Preview.ToLower().Contains(term)) * 2) +
                    (searchTerms.Count(term => a.Body.ToLower().Contains(term))))
                .ThenByDescending(a => a.CreatedAt)
                .Take(maxResults)
                .Select(a => new ArticleListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Preview = a.Preview,
                    AuthorName = a.Author.UserName ?? "Unknown",
                    CategoryName = a.Category.Name,
                    CreatedAt = a.CreatedAt,
                    ImageUrl = a.ImageUrl,
                    LikeCount = a.LikeCount,
                    CommentCount = a.CommentCount,
                    DislikeCount = a.DislikeCount,
                    IsPublished = a.IsPublished
                })
                .ToListAsync();
        }

        public async Task<bool> PublishArticleAsync(int id, string authorId)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id && a.AuthorId == authorId);
            if (article == null) return false;

            article.IsPublished = true;
            article.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnpublishArticleAsync(int id, string authorId)
        {
            var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id && a.AuthorId == authorId);
            if (article == null) return false;

            article.IsPublished = false;
            article.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}