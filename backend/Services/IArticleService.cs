using NewsWebsite.API.DTOs;
using NewsWebsite.API.Models;

namespace NewsWebsite.API.Services
{
    public interface IArticleService
    {
        Task<List<ArticleListDto>> GetArticlesAsync(int page = 1, int pageSize = 10, string? search = null, int? categoryId = null);
        Task<ArticleDto?> GetArticleByIdAsync(int id);
        Task<ArticleDto> CreateArticleAsync(CreateArticleDto dto, string authorId);
        Task<ArticleDto?> UpdateArticleAsync(int id, UpdateArticleDto dto, string authorId);
        Task<bool> DeleteArticleAsync(int id, string authorId);
        Task<bool> LikeArticleAsync(int id, string userId);
        Task<bool> DislikeArticleAsync(int id, string userId);
        Task<List<ArticleListDto>> GetTrendingArticlesAsync(int count = 10);
        Task<List<ArticleListDto>> SearchArticlesAsync(string query, int maxResults = 20);
        Task<bool> PublishArticleAsync(int id, string authorId);
        Task<bool> UnpublishArticleAsync(int id, string authorId);
    }
}
