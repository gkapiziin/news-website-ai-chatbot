using Microsoft.AspNetCore.Mvc;
using NewsWebsite.API.Services;
using NewsWebsite.API.DTOs;
using NewsWebsite.API.Data;
using Microsoft.EntityFrameworkCore;

namespace NewsWebsite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HybridSearchController : ControllerBase
{
    private readonly IHybridSearchService _hybridSearchService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HybridSearchController> _logger;
    private readonly IOpenAIService _openAIService;

    public HybridSearchController(
        IHybridSearchService hybridSearchService,
        ApplicationDbContext context,
        ILogger<HybridSearchController> logger,
        IOpenAIService openAIService)
    {
        _hybridSearchService = hybridSearchService;
        _context = context;
        _logger = logger;
        _openAIService = openAIService;
    }

    [HttpPost("search")]
    public async Task<ActionResult<AISearchResponseDto>> SearchNews([FromBody] AISearchRequestDto request)
    {
        try
        {
            _logger.LogInformation("AI Search request: {Query} in {Language}", request.Query, request.Language);

            // Search local articles
            var localArticlesQuery = _context.Articles
                .Include(a => a.Author)
                .Include(a => a.Category)
                .Where(a => a.IsPublished);

            if (!string.IsNullOrEmpty(request.Query))
            {
                var searchTerm = request.Query.ToLower();
                localArticlesQuery = localArticlesQuery.Where(a => 
                    a.Title.ToLower().Contains(searchTerm) || 
                    a.Body.ToLower().Contains(searchTerm));
            }

            var localArticles = await localArticlesQuery
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new LocalArticleDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Content = a.Body.Length > 500 ? a.Body.Substring(0, 500) + "..." : a.Body,
                    CategoryName = a.Category.Name,
                    AuthorName = $"{a.Author.FirstName} {a.Author.LastName}",
                    PublishedDate = a.CreatedAt,
                    Language = request.Language ?? "en"
                })
                .ToListAsync();

            // Search external sources - get more articles initially
            var rawExternalArticles = await _hybridSearchService.SearchAllSourcesAsync(
                request.Query, 
                request.Language ?? "en", 
                10); // Get more articles for better selection

            // Use OpenAI to rank and select the top 5 most relevant external articles
            var externalArticles = await _openAIService.RankArticlesByRelevanceAsync(
                rawExternalArticles, 
                request.Query, 
                request.Language ?? "en");

            var response = new AISearchResponseDto
            {
                Query = request.Query,
                Language = request.Language ?? "en",
                LocalArticles = localArticles,
                ExternalArticles = externalArticles,
                TotalResults = localArticles.Count + externalArticles.Count
            };

            _logger.LogInformation("Search completed: {LocalCount} local, {ExternalCount} external articles", 
                localArticles.Count, externalArticles.Count);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in hybrid search: {Message}", ex.Message);
            return StatusCode(500, new { error = "Internal server error during search" });
        }
    }
}