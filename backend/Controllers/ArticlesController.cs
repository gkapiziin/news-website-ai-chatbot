using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NewsWebsite.API.Data;
using NewsWebsite.API.DTOs;
using NewsWebsite.API.Models;
using System.Security.Claims;

namespace NewsWebsite.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ArticlesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<List<ArticleListDto>> GetArticles(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null)
        {
            var query = _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Include(a => a.Likes)
                .Include(a => a.Comments)
                .Where(a => a.IsPublished);

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(a => a.Title.ToLower().Contains(search) || a.Body.ToLower().Contains(search));
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
                    Body = a.Body.Length > 200 ? a.Body.Substring(0, 200) + "..." : a.Body,
                    ImageUrl = a.ImageUrl,
                    CreatedAt = a.CreatedAt,
                    IsPublished = a.IsPublished,
                    AuthorName = $"{a.Author.FirstName} {a.Author.LastName}",
                    CategoryName = a.Category.Name,
                    LikeCount = a.Likes.Count(l => l.IsLike),
                    DislikeCount = a.Likes.Count(l => !l.IsLike),
                    CommentCount = a.Comments.Count
                })
                .ToListAsync();

            return articles;
        }

        [HttpGet("admin")]
        [Authorize]
        public async Task<ActionResult<List<ArticleListDto>>> GetAllArticlesForAdmin(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null)
        {
            // Check if user is admin
            var isAdmin = User.FindFirst("IsAdmin")?.Value == "True";
            if (!isAdmin)
            {
                return Forbid("Only admins can access all articles");
            }

            IQueryable<NewsArticle> query = _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Include(a => a.Likes)
                .Include(a => a.Comments);
                // Note: No .Where(a => a.IsPublished) filter for admin

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(a => a.Title.ToLower().Contains(search) || a.Body.ToLower().Contains(search));
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
                    Body = a.Body.Length > 200 ? a.Body.Substring(0, 200) + "..." : a.Body,
                    ImageUrl = a.ImageUrl,
                    CreatedAt = a.CreatedAt,
                    IsPublished = a.IsPublished,
                    AuthorName = $"{a.Author.FirstName} {a.Author.LastName}",
                    CategoryName = a.Category.Name,
                    LikeCount = a.Likes.Count(l => l.IsLike),
                    DislikeCount = a.Likes.Count(l => !l.IsLike),
                    CommentCount = a.Comments.Count
                })
                .ToListAsync();

            return Ok(articles);
        }

        [HttpGet("trending")]
        public async Task<ActionResult<List<ArticleListDto>>> GetTrendingArticles(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            // Get articles ordered by total engagement (likes + comments) from the last 30 days
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var articles = await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Include(a => a.Likes)
                .Include(a => a.Comments)
                .Where(a => a.IsPublished && a.CreatedAt >= thirtyDaysAgo)
                .OrderByDescending(a => a.Likes.Count + a.Comments.Count)
                .ThenByDescending(a => a.Likes.Count(l => l.IsLike))
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new ArticleListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Preview = a.Preview,
                    Body = a.Body.Length > 200 ? a.Body.Substring(0, 200) + "..." : a.Body,
                    ImageUrl = a.ImageUrl,
                    CreatedAt = a.CreatedAt,
                    IsPublished = a.IsPublished,
                    AuthorName = $"{a.Author.FirstName} {a.Author.LastName}",
                    CategoryName = a.Category.Name,
                    LikeCount = a.Likes.Count(l => l.IsLike),
                    DislikeCount = a.Likes.Count(l => !l.IsLike),
                    CommentCount = a.Comments.Count
                })
                .ToListAsync();

            return Ok(articles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ArticleDto>> GetArticle(int id)
        {
            var article = await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Include(a => a.Likes)
                .Include(a => a.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(a => a.Id == id && a.IsPublished);

            if (article == null)
            {
                return NotFound();
            }

            var articleDto = new ArticleDto
            {
                Id = article.Id,
                Title = article.Title,
                Preview = article.Preview,
                Body = article.Body,
                ImageUrl = article.ImageUrl,
                CreatedAt = article.CreatedAt,
                UpdatedAt = article.UpdatedAt,
                IsPublished = article.IsPublished,
                Author = new UserDto
                {
                    Id = article.Author.Id,
                    Email = article.Author.Email!,
                    FirstName = article.Author.FirstName,
                    LastName = article.Author.LastName,
                    IsAdmin = article.Author.IsAdmin,
                    CreatedAt = article.Author.CreatedAt
                },
                Category = new CategoryDto
                {
                    Id = article.Category.Id,
                    Name = article.Category.Name,
                    Description = article.Category.Description,
                    CreatedAt = article.Category.CreatedAt
                },
                LikeCount = article.Likes.Count(l => l.IsLike),
                DislikeCount = article.Likes.Count(l => !l.IsLike),
                CommentCount = article.Comments.Count,
                Comments = article.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    User = new UserDto
                    {
                        Id = c.User.Id,
                        Email = c.User.Email!,
                        FirstName = c.User.FirstName,
                        LastName = c.User.LastName,
                        IsAdmin = c.User.IsAdmin,
                        CreatedAt = c.User.CreatedAt
                    }
                }).OrderBy(c => c.CreatedAt).ToList()
            };

            return Ok(articleDto);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ArticleDto>> CreateArticle(CreateArticleDto createArticleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("User not found");
            }
            
            var isAdmin = User.FindFirst("IsAdmin")?.Value == "True";

            if (!isAdmin)
            {
                return Forbid("Only admins can create articles");
            }

            // Verify the user exists in the database
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return BadRequest("Author user does not exist");
            }

            var category = await _context.Categories.FindAsync(createArticleDto.CategoryId);
            if (category == null)
            {
                return BadRequest("Invalid category");
            }

            var article = new NewsArticle
            {
                Title = createArticleDto.Title,
                Preview = createArticleDto.Preview,
                Body = createArticleDto.Body,
                ImageUrl = createArticleDto.ImageUrl,
                AuthorId = userId,
                CategoryId = createArticleDto.CategoryId,
                IsPublished = createArticleDto.IsPublished,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Articles.Add(article);
            await _context.SaveChangesAsync();

            // Reload with includes for response
            article = await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .FirstAsync(a => a.Id == article.Id);

            var articleDto = new ArticleDto
            {
                Id = article.Id,
                Title = article.Title,
                Preview = article.Preview,
                Body = article.Body,
                ImageUrl = article.ImageUrl,
                CreatedAt = article.CreatedAt,
                UpdatedAt = article.UpdatedAt,
                IsPublished = article.IsPublished,
                Author = new UserDto
                {
                    Id = article.Author.Id,
                    Email = article.Author.Email!,
                    FirstName = article.Author.FirstName,
                    LastName = article.Author.LastName,
                    IsAdmin = article.Author.IsAdmin,
                    CreatedAt = article.Author.CreatedAt
                },
                Category = new CategoryDto
                {
                    Id = article.Category.Id,
                    Name = article.Category.Name,
                    Description = article.Category.Description,
                    CreatedAt = article.Category.CreatedAt
                }
            };

            return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, articleDto);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateArticle(int id, UpdateArticleDto updateArticleDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.FindFirst("IsAdmin")?.Value == "True";

            if (!isAdmin)
            {
                return Forbid("Only admins can update articles");
            }

            var article = await _context.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound();
            }

            if (updateArticleDto.Title != null)
                article.Title = updateArticleDto.Title;

            if (updateArticleDto.Preview != null)
                article.Preview = updateArticleDto.Preview;

            if (updateArticleDto.Body != null)
                article.Body = updateArticleDto.Body;

            if (updateArticleDto.ImageUrl != null)
                article.ImageUrl = updateArticleDto.ImageUrl;

            if (updateArticleDto.CategoryId.HasValue)
            {
                var category = await _context.Categories.FindAsync(updateArticleDto.CategoryId.Value);
                if (category == null)
                {
                    return BadRequest("Invalid category");
                }
                article.CategoryId = updateArticleDto.CategoryId.Value;
            }

            if (updateArticleDto.IsPublished.HasValue)
                article.IsPublished = updateArticleDto.IsPublished.Value;

            article.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteArticle(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.FindFirst("IsAdmin")?.Value == "True";

            if (!isAdmin)
            {
                return Forbid("Only admins can delete articles");
            }

            var article = await _context.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound();
            }

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/like")]
        [Authorize]
        public async Task<IActionResult> LikeArticle(int id, LikeDto likeDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var article = await _context.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound();
            }

            var existingLike = await _context.ArticleLikes
                .FirstOrDefaultAsync(l => l.UserId == userId && l.ArticleId == id);

            if (existingLike != null)
            {
                if (existingLike.IsLike == likeDto.IsLike)
                {
                    // Remove like/dislike if clicking the same button
                    _context.ArticleLikes.Remove(existingLike);
                }
                else
                {
                    // Update like/dislike if clicking opposite button
                    existingLike.IsLike = likeDto.IsLike;
                    existingLike.CreatedAt = DateTime.UtcNow;
                }
            }
            else
            {
                // Add new like/dislike
                var newLike = new ArticleLike
                {
                    UserId = userId!,
                    ArticleId = id,
                    IsLike = likeDto.IsLike,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ArticleLikes.Add(newLike);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
