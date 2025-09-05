using NewsWebsite.API.DTOs;

namespace NewsWebsite.API.Services;

public interface IGoogleSearchService
{
    Task<List<ExternalArticleDto>> SearchAsync(string query, string language = "en", int maxResults = 10);
    Task<List<ExternalArticleDto>> SearchNewsAsync(string query, string language = "en", int maxResults = 10);
}
