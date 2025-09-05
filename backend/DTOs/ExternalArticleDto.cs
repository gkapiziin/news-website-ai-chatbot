namespace NewsWebsite.API.DTOs;

public class ExternalArticleDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public DateTime? PublishedDate { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Language { get; set; } = "en";
    public List<string> Tags { get; set; } = new();
}
