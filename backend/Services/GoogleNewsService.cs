using NewsWebsite.API.DTOs;

namespace NewsWebsite.API.Services;

public class GoogleNewsService : IExternalNewsService
{
    private readonly HttpClient _httpClient;
    private readonly IGoogleSearchService _googleSearchService;
    private readonly ILogger<GoogleNewsService> _logger;

    public string ServiceName => "Google News";

    public GoogleNewsService(
        HttpClient httpClient,
        IGoogleSearchService googleSearchService,
        ILogger<GoogleNewsService> logger)
    {
        _httpClient = httpClient;
        _googleSearchService = googleSearchService;
        _logger = logger;
    }

    public async Task<List<ExternalArticleDto>> SearchNewsAsync(string query, string language = "en", int maxResults = 10)
    {
        try
        {
            _logger.LogInformation("Searching Google News for: {Query} in {Language}", query, language);

            // Use the GoogleSearchService to search for news
            var articles = await _googleSearchService.SearchNewsAsync(query, language, maxResults);
            
            // Update source to indicate it's from Google News specifically
            foreach (var article in articles)
            {
                article.Source = "Google News";
            }

            _logger.LogInformation("Found {Count} articles from Google News", articles.Count);
            return articles;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching Google News: {Message}", ex.Message);
            return new List<ExternalArticleDto>();
        }
    }
}
