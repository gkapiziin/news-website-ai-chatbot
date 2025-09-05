using NewsWebsite.API.DTOs;

namespace NewsWebsite.API.Services;

public class HybridSearchService : IHybridSearchService
{
    private readonly IEnumerable<IExternalNewsService> _newsServices;
    private readonly ILogger<HybridSearchService> _logger;

    public HybridSearchService(
        IEnumerable<IExternalNewsService> newsServices,
        ILogger<HybridSearchService> logger)
    {
        _newsServices = newsServices;
        _logger = logger;
    }

    public async Task<List<ExternalArticleDto>> SearchAllSourcesAsync(string query, string language = "en", int maxResults = 10)
    {
        try
        {
            _logger.LogInformation("Searching all news sources for: {Query} in {Language}", query, language);

            var allArticles = new List<ExternalArticleDto>();
            var tasks = new List<Task<List<ExternalArticleDto>>>();

            // Start searches from all news services concurrently
            // Since we now only have one service (GoogleNewsService), request more articles for diversity
            var articlesPerService = Math.Max(maxResults * 2, 10); // Request more to ensure variety
            
            foreach (var service in _newsServices)
            {
                tasks.Add(SearchFromService(service, query, language, articlesPerService));
            }

            // Wait for all searches to complete
            var results = await Task.WhenAll(tasks);

            // Combine results from all services
            foreach (var serviceResults in results)
            {
                allArticles.AddRange(serviceResults);
            }

            // Remove duplicates based on URL and title
            var uniqueArticles = allArticles
                .GroupBy(a => new { Url = a.Url.ToLower(), Title = a.Title.ToLower() })
                .Select(g => g.First())
                .OrderByDescending(a => a.PublishedDate ?? DateTime.MinValue)
                .Take(maxResults)
                .ToList();

            _logger.LogInformation("Found {TotalCount} unique articles from {ServiceCount} services", 
                uniqueArticles.Count, _newsServices.Count());

            return uniqueArticles;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in hybrid search: {Message}", ex.Message);
            return new List<ExternalArticleDto>();
        }
    }

    private async Task<List<ExternalArticleDto>> SearchFromService(
        IExternalNewsService service, 
        string query, 
        string language, 
        int maxResults)
    {
        try
        {
            _logger.LogInformation("Searching {ServiceName} for: {Query}", service.ServiceName, query);
            return await service.SearchNewsAsync(query, language, maxResults);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching {ServiceName}: {Message}", service.ServiceName, ex.Message);
            return new List<ExternalArticleDto>();
        }
    }
}
