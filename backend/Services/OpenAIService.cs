using OpenAI;
using OpenAI.Chat;
using NewsWebsite.API.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace NewsWebsite.API.Services
{
    public class OpenAIService : IOpenAIService
    {
        private readonly OpenAIClient _openAIClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OpenAIService> _logger;

        public OpenAIService(IConfiguration configuration, ILogger<OpenAIService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            
            var apiKey = _configuration["ExternalAPIs:OpenAI:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                throw new InvalidOperationException("OpenAI API key not configured");
            }

            _openAIClient = new OpenAIClient(apiKey);
        }

        public async Task<string> GenerateResponseAsync(string prompt, string language = "en")
        {
            try
            {
                var chatClient = _openAIClient.GetChatClient("gpt-4o");
                
                var response = await chatClient.CompleteChatAsync(
                    ChatMessage.CreateUserMessage(prompt)
                );

                return response.Value.Content[0].Text;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating OpenAI response");
                return language == "bg" 
                    ? "Извинявам се, възникна грешка при генериране на отговор."
                    : "Sorry, there was an error generating a response.";
            }
        }

        public async Task<string> SummarizeTextAsync(string text, string language = "en")
        {
            var prompt = language == "bg"
                ? $"Резюмирай следния текст на български език:\n\n{text}"
                : $"Summarize the following text in English:\n\n{text}";

            return await GenerateResponseAsync(prompt, language);
        }

        public async Task<string> DetectLanguageAsync(string text)
        {
            var prompt = $"Detect the language of this text and respond with only 'bg' for Bulgarian or 'en' for English: {text}";
            var response = await GenerateResponseAsync(prompt);
            
            return response.ToLower().Contains("bg") ? "bg" : "en";
        }

        public async Task<List<ExternalArticleDto>> RankArticlesByRelevanceAsync(List<ExternalArticleDto> articles, string query, string language = "en")
        {
            try
            {
                var articlesText = string.Join("\n", articles.Select((a, i) => 
                    $"{i + 1}. {a.Title} - {a.Summary}"));

                var prompt = language == "bg"
                    ? $"Подреди следните статии по релевантност към заявката '{query}'. Отговори само с номерата, разделени със запетая:\n\n{articlesText}"
                    : $"Rank the following articles by relevance to the query '{query}'. Respond only with numbers separated by commas:\n\n{articlesText}";

                var response = await GenerateResponseAsync(prompt, language);
                
                // Parse the response and reorder articles
                var ranks = response.Split(',')
                    .Select(r => r.Trim())
                    .Where(r => int.TryParse(r, out _))
                    .Select(int.Parse)
                    .ToList();

                var rankedArticles = new List<ExternalArticleDto>();
                foreach (var rank in ranks)
                {
                    if (rank > 0 && rank <= articles.Count)
                    {
                        rankedArticles.Add(articles[rank - 1]);
                    }
                }

                // Add any remaining articles
                foreach (var article in articles.Where(a => !rankedArticles.Contains(a)))
                {
                    rankedArticles.Add(article);
                }

                return rankedArticles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ranking articles");
                return articles; // Return original order on error
            }
        }
    }
}