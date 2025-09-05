using NewsWebsite.API.DTOs;

namespace NewsWebsite.API.Services;

public interface IOpenAIService
{
    Task<string> GenerateResponseAsync(string prompt, string language = "en");
    Task<string> SummarizeTextAsync(string text, string language = "en");
    Task<string> DetectLanguageAsync(string text);
    Task<List<ExternalArticleDto>> RankArticlesByRelevanceAsync(List<ExternalArticleDto> articles, string query, string language = "en");
}
