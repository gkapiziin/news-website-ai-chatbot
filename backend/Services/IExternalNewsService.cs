using NewsWebsite.API.DTOs;

namespace NewsWebsite.API.Services;

public interface IExternalNewsService
{
    Task<List<ExternalArticleDto>> SearchNewsAsync(string query, string language = "en", int maxResults = 10);
    string ServiceName { get; }
}
