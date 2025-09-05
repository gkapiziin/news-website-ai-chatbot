namespace NewsWebsite.API.DTOs;

public class AISearchRequestDto
{
    public string Query { get; set; } = string.Empty;
    public string Language { get; set; } = "en";
    public int MaxResults { get; set; } = 10;
}

public class LocalArticleDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public DateTime PublishedDate { get; set; }
    public string Language { get; set; } = string.Empty;
    public string? AiSummary { get; set; }
}

public class AISearchResponseDto
{
    public string Query { get; set; } = string.Empty;
    public string Language { get; set; } = "en";
    public List<LocalArticleDto> LocalArticles { get; set; } = new();
    public List<ExternalArticleDto> ExternalArticles { get; set; } = new();
    public string? AiSummary { get; set; } = null; // Made nullable to remove global summary
    public int TotalResults { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsError { get; set; }
    public string? ErrorMessage { get; set; }
}
