using NewsWebsite.API.DTOs;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text;

namespace NewsWebsite.API.Services;

public class GoogleSearchService : IGoogleSearchService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleSearchService> _logger;
    private readonly string _apiKey;
    private readonly string _searchEngineId;

    public GoogleSearchService(
        HttpClient httpClient, 
        IConfiguration configuration, 
        ILogger<GoogleSearchService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        
        _apiKey = _configuration["ExternalAPIs:GoogleSearch:ApiKey"] ?? "AIzaSyB7KfqdV40xcL5UX3AQFAJF7k0KuGa2DR0";
        _searchEngineId = _configuration["ExternalAPIs:GoogleSearch:SearchEngineId"] ?? "40b82a911ca754b5c";
    }

    public async Task<List<ExternalArticleDto>> SearchAsync(string query, string language = "en", int maxResults = 10)
    {
        try
        {
            _logger.LogInformation("Searching Google for: {Query} in {Language}", query, language);
            
            // Ensure proper encoding for Bulgarian text
            var encodedQuery = Uri.EscapeDataString(query);
            
            var url = $"https://www.googleapis.com/customsearch/v1" +
                     $"?key={_apiKey}" +
                     $"&cx={_searchEngineId}" +
                     $"&q={encodedQuery}" +
                     $"&num={Math.Min(maxResults, 10)}" +
                     $"&lr=lang_{language}" +
                     $"&ie=utf8" +
                     $"&oe=utf8";
                     
            // Add country-specific search for Bulgarian
            if (language == "bg")
            {
                url += "&gl=bg&cr=countryBG";
            }
            
            _logger.LogInformation("Google Search URL: {Url}", url);
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Google API response length: {Length} characters", content.Length);
            
            var searchResult = JsonSerializer.Deserialize<GoogleSearchResult>(content);
            
            var articles = new List<ExternalArticleDto>();
            
            if (searchResult?.Items != null)
            {
                foreach (var item in searchResult.Items.Take(maxResults))
                {
                    var domain = ExtractDomain(item.Link ?? "");
                    articles.Add(new ExternalArticleDto
                    {
                        Title = item.Title ?? "",
                        Content = item.Snippet ?? "",
                        Url = item.Link ?? "",
                        Source = domain,
                        Language = language,
                        ImageUrl = item.PageMap?.CseThumbnail?.FirstOrDefault()?.Src ?? ""
                    });
                }
            }
            
            _logger.LogInformation("Found {Count} results from Google Search", articles.Count);
            return articles;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching Google: {Message}", ex.Message);
            return new List<ExternalArticleDto>();
        }
    }

    public async Task<List<ExternalArticleDto>> SearchNewsAsync(string query, string language = "en", int maxResults = 10)
    {
        try
        {
            _logger.LogInformation("Searching Google News for: {Query} in {Language}", query, language);
            
            // Improve search query construction for better relevance
            var newsQuery = language == "bg" 
                ? ConstructBulgarianSearchQuery(query) 
                : ConstructEnglishSearchQuery(query);
                
            _logger.LogInformation("Constructed search query: {NewsQuery}", newsQuery);
                
            // Request more results to ensure source diversity and quantity
            var results = await SearchAsync(newsQuery, language, Math.Max(maxResults * 2, 15));
            
            // Ensure source diversity - max 1 article per domain, but return up to maxResults
            var diverseResults = EnsureSourceDiversity(results, maxResults);
            
            _logger.LogInformation("Filtered {OriginalCount} results to {FilteredCount} for source diversity", 
                results.Count, diverseResults.Count);
                
            return diverseResults;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching Google News: {Message}", ex.Message);
            return new List<ExternalArticleDto>();
        }
    }
    
    private string ConstructBulgarianSearchQuery(string query)
    {
        // Improve Bulgarian search queries based on common search terms
        var lowerQuery = query.ToLower();
        
        if (lowerQuery.Contains("личен бюджет") || lowerQuery.Contains("personal budget") || lowerQuery.Contains("бюджет"))
        {
            return $"личен бюджет планиране спестявания семеен домакинство финанси България";
        }
        else if (lowerQuery.Contains("личните финанси") || lowerQuery.Contains("лични финанси") || lowerQuery.Contains("финансова грамотност") || lowerQuery.Contains("финанси"))
        {
            return $"лични финанси финансова грамотност обучение курсове съвети управление пари България";
        }
        else if (lowerQuery.Contains("мачове") || lowerQuery.Contains("футбол") || lowerQuery.Contains("спорт") || lowerQuery.Contains("matches") || lowerQuery.Contains("football") || lowerQuery.Contains("sports"))
        {
            return $"мачове футбол спорт днес резултати програма България";
        }
        else if (lowerQuery.Contains("минимализ") || lowerQuery.Contains("minimalism"))
        {
            return $"минимализъм стил живот съвети"; // Simplified for better results
        }
        else if (lowerQuery.Contains("психично здраве") || lowerQuery.Contains("mental health"))
        {
            return $"психично здраве благополучие стрес тревожност България";
        }
        else if (lowerQuery.Contains("технологи") || lowerQuery.Contains("technology"))
        {
            return $"технологии иновации България IT софтуер стартъп";
        }
        else if (lowerQuery.Contains("инвестиции") || lowerQuery.Contains("investment"))
        {
            return $"инвестиции акции облигации фондове портфейл България български";
        }
        else if (lowerQuery.Contains("кредит") || lowerQuery.Contains("заем"))
        {
            return $"кредити заеми банки лихви ипотека България български";
        }
        else if (lowerQuery.Contains("пенсия") || lowerQuery.Contains("pension"))
        {
            return $"пенсия осигуряване НОИ България пенсионни фондове";
        }
        else if (lowerQuery.Contains("здраве") || lowerQuery.Contains("health"))
        {
            return $"здраве медицина профилактика лечение България здравеопазване";
        }
        else if (lowerQuery.Contains("спорт") || lowerQuery.Contains("sport"))
        {
            return $"спорт фитнес тренировки България спортисти състезания";
        }
        else
        {
            // For other queries, try to extract meaningful keywords and avoid generic additions
            var words = lowerQuery.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var stopWords = new HashSet<string> { "дай", "ми", "моля", "те", "от", "интернет", "в", "за", "с", "линкове", "статии", "информация", "търси", "намери", "покажи", "кажи" };
            var meaningfulWords = words.Where(w => !stopWords.Contains(w) && w.Length > 2).ToList();
            
            if (meaningfulWords.Any())
            {
                return string.Join(" ", meaningfulWords.Take(5)); // Take up to 5 meaningful words
            }
            
            return query; // Fallback to original query
        }
    }
    
    private string ConstructEnglishSearchQuery(string query)
    {
        // Keep existing English query construction but improve it
        var lowerQuery = query.ToLower();
        
        if (lowerQuery.Contains("budget") || lowerQuery.Contains("personal finance"))
        {
            return $"\"{query}\" personal finance budgeting money management household";
        }
        else if (lowerQuery.Contains("investment") || lowerQuery.Contains("investing"))
        {
            return $"\"{query}\" investing stocks bonds portfolio strategy advice";
        }
        else
        {
            return $"\"{query}\" guide tips how to tutorial advice complete";
        }
    }
    
    private List<ExternalArticleDto> EnsureSourceDiversity(List<ExternalArticleDto> articles, int maxResults)
    {
        var diverseArticles = new List<ExternalArticleDto>();
        var usedDomains = new HashSet<string>();
        
        // First pass: get unique articles from different domains
        foreach (var article in articles)
        {
            if (diverseArticles.Count >= maxResults)
                break;
                
            var domain = ExtractDomain(article.Url);
            if (!usedDomains.Contains(domain))
            {
                diverseArticles.Add(article);
                usedDomains.Add(domain);
            }
        }
        
        // Second pass: if we still need more articles, add remaining articles
        if (diverseArticles.Count < maxResults)
        {
            foreach (var article in articles)
            {
                if (diverseArticles.Count >= maxResults)
                    break;
                    
                if (!diverseArticles.Contains(article))
                {
                    diverseArticles.Add(article);
                }
            }
        }
        
        return diverseArticles;
    }
    
    private string ExtractDomain(string url)
    {
        try
        {
            var uri = new Uri(url);
            return uri.Host.ToLower();
        }
        catch
        {
            return url; // Fallback to full URL if parsing fails
        }
    }
}

// Google Custom Search API response models
public class GoogleSearchResult
{
    [JsonPropertyName("items")]
    public List<GoogleSearchItem>? Items { get; set; }
}

public class GoogleSearchItem
{
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("link")]
    public string? Link { get; set; }

    [JsonPropertyName("snippet")]
    public string? Snippet { get; set; }

    [JsonPropertyName("pagemap")]
    public PageMap? PageMap { get; set; }
}

public class PageMap
{
    [JsonPropertyName("cse_thumbnail")]
    public List<CseThumbnail>? CseThumbnail { get; set; }
}

public class CseThumbnail
{
    [JsonPropertyName("src")]
    public string? Src { get; set; }
}
