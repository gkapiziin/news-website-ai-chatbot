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
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("article/{articleId}")]
        public async Task<ActionResult<List<CommentDto>>> GetArticleComments(int articleId)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.ArticleId == articleId)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto
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
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CommentDto>> CreateComment(CreateCommentDto createCommentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var article = await _context.Articles.FindAsync(createCommentDto.ArticleId);
            if (article == null)
            {
                return BadRequest("Article not found");
            }

            if (!article.IsPublished)
            {
                return BadRequest("Cannot comment on unpublished articles");
            }

            var comment = new Comment
            {
                Content = createCommentDto.Content,
                UserId = userId!,
                ArticleId = createCommentDto.ArticleId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // Reload with user for response
            comment = await _context.Comments
                .Include(c => c.User)
                .FirstAsync(c => c.Id == comment.Id);

            var commentDto = new CommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                User = new UserDto
                {
                    Id = comment.User.Id,
                    Email = comment.User.Email!,
                    FirstName = comment.User.FirstName,
                    LastName = comment.User.LastName,
                    IsAdmin = comment.User.IsAdmin,
                    CreatedAt = comment.User.CreatedAt
                }
            };

            return CreatedAtAction(nameof(GetArticleComments), new { articleId = comment.ArticleId }, commentDto);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(int id, CreateCommentDto updateCommentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.FindFirst("IsAdmin")?.Value == "True";

            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
            {
                return NotFound();
            }

            // Only the comment author or admin can update
            if (comment.UserId != userId && !isAdmin)
            {
                return Forbid();
            }

            comment.Content = updateCommentDto.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.FindFirst("IsAdmin")?.Value == "True";

            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
            {
                return NotFound();
            }

            // Only the comment author or admin can delete
            if (comment.UserId != userId && !isAdmin)
            {
                return Forbid();
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
