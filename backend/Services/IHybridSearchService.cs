using NewsWebsite.API.DTOs;

namespace NewsWebsite.API.Services;

public interface IHybridSearchService
{
    Task<List<ExternalArticleDto>> SearchAllSourcesAsync(string query, string language = "en", int maxResults = 10);
}
