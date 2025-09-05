using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NewsWebsite.API.Models;
using NewsWebsite.API.Data;
using NewsWebsite.API.Controllers;
using System.Text.RegularExpressions;

namespace NewsWebsite.API.Services
{
    public class ChatBotService : IChatBotService
    {
        private readonly ApplicationDbContext _context;
        private readonly IOpenAIService _openAIService;
        private readonly IGoogleSearchService _googleSearchService;
        private readonly ILogger<ChatBotService> _logger;
        private readonly Dictionary<string, DateTime> _sessions = new();
        private readonly Dictionary<string, List<string>> _conversationHistory = new();

        public ChatBotService(
            ApplicationDbContext context,
            IOpenAIService openAIService,
            IGoogleSearchService googleSearchService,
            ILogger<ChatBotService> logger)
        {
            _context = context;
            _openAIService = openAIService;
            _googleSearchService = googleSearchService;
            _logger = logger;
        }

        public async Task<ChatBotResponse> ProcessMessageAsync(ChatBotRequest request)
        {
            var language = "bg"; // Default to Bulgarian
            try
            {
                language = DetectLanguage(request.Message);
                _logger.LogInformation($"Checking message: '{request.Message}' (Language: {language})");
                
                var sessionId = request.SessionId ?? CreateSession();
                if (!_sessions.ContainsKey(sessionId))
                {
                    sessionId = CreateSession();
                }

                // Initialize conversation history for new sessions
                if (!_conversationHistory.ContainsKey(sessionId))
                {
                    _conversationHistory[sessionId] = new List<string>();
                }

                // Add user message to history
                _conversationHistory[sessionId].Add($"User: {request.Message}");

                string response;
                if (IsArticleAnalysisRequest(request.Message, language))
                {
                    _logger.LogInformation("Detected as ARTICLE ANALYSIS request");
                    response = await ProcessArticleAnalysis(request.Message, language);
                }
                else if (IsWebSearchRequest(request.Message, language))
                {
                    _logger.LogInformation("Detected as WEB SEARCH request");
                    response = await ProcessWebSearch(request.Message, language);
                }
                else
                {
                    _logger.LogInformation("Handling as casual conversation, not web search");
                    response = await ProcessCasualConversation(request.Message, language, sessionId);
                }

                // Add assistant response to history
                _conversationHistory[sessionId].Add($"Assistant: {response}");

                // Keep only last 10 messages to prevent memory issues
                if (_conversationHistory[sessionId].Count > 20)
                {
                    _conversationHistory[sessionId] = _conversationHistory[sessionId].TakeLast(10).ToList();
                }

                return new ChatBotResponse
                {
                    Content = response,
                    SessionId = sessionId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat message");
                var errorMessage = language == "bg" 
                    ? "За съжаление възникна грешка при обработване на заявката."
                    : "Sorry, an error occurred while processing your request.";
                    
                return new ChatBotResponse
                {
                    Content = errorMessage,
                    SessionId = request.SessionId ?? ""
                };
            }
        }

        private string DetectLanguage(string message)
        {
            var cyrillicPattern = @"[а-яё]";
            return Regex.IsMatch(message.ToLower(), cyrillicPattern) ? "bg" : "en";
        }

        private bool IsArticleAnalysisRequest(string message, string language)
        {
            if (IsCasualGreeting(message, language))
                return false;

            string[] articleKeywords = language == "bg" 
                ? new[] { "анализирай", "статия", "статията", "резюме", "резюмирай", "обобщи", "какво казва", "разкажи за", "обясни статията" }
                : new[] { "analyze", "article", "summary", "summarize", "explain", "tell me about" };

            return articleKeywords.Any(keyword => message.ToLower().Contains(keyword.ToLower()));
        }

        private bool IsWebSearchRequest(string message, string language)
        {
            if (IsCasualGreeting(message, language))
                return false;

            string[] webSearchKeywords = language == "bg" 
                ? new[] { "търси", "намери", "какво се случва", "новини за", "информация за", "кажи ми за", "какво има ново", 
                         "статии от интернет", "статии от мрежата", "статии от уеб", "линкове към", "връзки към", 
                         "интернет статии", "уеб статии", "дай ми статии", "покажи ми статии", "интернет", "в интернет",
                         "от интернет", "какво пише в интернет", "с линкове", "линкове", "статии с линкове",
                         "дай ми 3 статии", "дай ми три статии", "3 статии", "три статии", "статии на тема", "искам статии",
                         "дай ми още", "още статии", "дай ми една статия", "дай ми 1 статия", "с линк", "статията", "статии за" }
                : new[] { "search", "find", "what's happening", "news about", "information about", "tell me about", "what's new",
                         "articles from the web", "web articles", "internet articles", "articles from internet", 
                         "links to", "with links", "give me articles", "show me articles", "articles with links",
                         "from the web", "from internet", "give me", "show me", "internet", "on the internet",
                         "articles about", "5 articles", "articles", "links", "from the web", "provide me", "give me 3",
                         "give me more", "more articles", "give me one article", "give me 1 article", "with link", "article", "articles for" };

            var lowerMessage = message.ToLower().Replace("\"", "").Replace("'", "").Trim();
            
            // Prioritize web search patterns - check for explicit web search indicators first
            string[] priorityWebPatterns = language == "bg"
                ? new[] { "от интернет", "в интернет", "статии от", "с линкове", "линкове към", "дай ми статии", "покажи ми статии", "статии с линкове", 
                         "дай ми 3 статии", "дай ми три статии", "искам статии", "искам 3 статии", "статии на тема" }
                : new[] { "from the web", "from internet", "articles from", "with links", "give me articles", "show me articles", "articles about", 
                         "provide me", "give me 3", "3 articles" };

            bool hasPriorityWebPattern = priorityWebPatterns.Any(pattern => lowerMessage.Contains(pattern.ToLower()));
            if (hasPriorityWebPattern)
            {
                _logger.LogInformation($"Found priority web search pattern in: '{message}'");
                return true;
            }

            var isWebSearch = webSearchKeywords.Any(keyword => lowerMessage.Contains(keyword.ToLower()));
            
            _logger.LogInformation($"Checking if '{message}' is web search. Cleaned message: '{lowerMessage}'. Found match: {isWebSearch}");
            
            return isWebSearch;
        }

        private bool IsCasualGreeting(string message, string language)
        {
            string[] casualPatterns = language == "bg" 
                ? new[] { "здравей", "здрасти", "добро утро", "добър ден", "добър вечер", "как си", "как става", "привет", "хей", "ало" }
                : new[] { "hello", "hi", "hey", "good morning", "good afternoon", "good evening", "how are you", "what's up" };

            var lowerMessage = message.ToLower().Trim();
            return casualPatterns.Any(pattern => lowerMessage.Contains(pattern.ToLower()));
        }

        private async Task<string> ProcessCasualConversation(string message, string language, string sessionId)
        {
            try
            {
                // Get conversation history for context
                var history = _conversationHistory.ContainsKey(sessionId) ? _conversationHistory[sessionId] : new List<string>();
                var contextHistory = string.Join("\n", history.TakeLast(6)); // Last 6 messages for context

                var prompt = language == "bg"
                    ? $"Ти си приятелски ChatBot на български език за новинарски сайт. {(string.IsNullOrEmpty(contextHistory) ? "" : $"Ето предишния разговор:\n{contextHistory}\n\n")}Потребителят каза: '{message}'. Отговори естествено и приятелски, като помниш контекста на разговора."
                    : $"You are a friendly ChatBot in English for a news website. {(string.IsNullOrEmpty(contextHistory) ? "" : $"Here's the previous conversation:\n{contextHistory}\n\n")}The user said: '{message}'. Reply naturally and friendly, remembering the conversation context.";

                return await _openAIService.GenerateResponseAsync(prompt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in casual conversation");
                return language == "bg" 
                    ? "Извинявай, възникна грешка. Можем ли да опитаме отново?"
                    : "Sorry, an error occurred. Can we try again?";
            }
        }

        private async Task<string> ProcessArticleAnalysis(string message, string language)
        {
            try
            {
                var articles = await _context.Articles
                    .Where(a => a.IsPublished)
                    .Select(a => new { a.Id, a.Title, a.Body, a.CreatedAt, a.Preview })
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(10)
                    .ToListAsync();

                _logger.LogInformation($"Found {articles.Count} articles for analysis");

                if (!articles.Any())
                {
                    return language == "bg" 
                        ? "Не намерих статии за анализ в момента."
                        : "I couldn't find any articles to analyze at the moment.";
                }

                // Log each article for debugging
                foreach (var article in articles)
                {
                    _logger.LogInformation($"Article {article.Id}: '{article.Title}' - Preview: '{TruncateText(article.Preview ?? article.Body, 50)}'");
                }

                // Use AI to select the most relevant article
                var selectedArticle = await SelectMostRelevantArticle(articles, message, language);
                
                if (selectedArticle == null)
                {
                    selectedArticle = articles.First();
                    _logger.LogInformation($"Fallback to first article: '{selectedArticle.Title}'");
                }
                else
                {
                    _logger.LogInformation($"AI selected article: '{selectedArticle.Title}'");
                }

                var analysisPrompt = language == "bg"
                    ? $"Анализирай следната статия и дай кратко резюме на български език:\n\nЗаглавие: {selectedArticle.Title}\nСъдържание: {selectedArticle.Body}\n\nМолбата на потребителя: {message}"
                    : $"Analyze the following article and provide a brief summary in English:\n\nTitle: {selectedArticle.Title}\nContent: {selectedArticle.Body}\n\nUser request: {message}";

                var aiResponse = await _openAIService.GenerateResponseAsync(analysisPrompt);
                
                // Add article link at the end using the actual database ID
                var articleUrl = $"http://localhost:3000/article/{selectedArticle.Id}";
                var linkText = language == "bg" 
                    ? $"\n\n**Прочетете пълната статия:** [{selectedArticle.Title}]({articleUrl})"
                    : $"\n\n**Read the full article:** [{selectedArticle.Title}]({articleUrl})";
                
                _logger.LogInformation($"Generated article link with actual ID {selectedArticle.Id}: {articleUrl}");
                _logger.LogInformation($"Link text format: {linkText}");
                
                var finalResponse = aiResponse + linkText;
                _logger.LogInformation($"Final response length: {finalResponse.Length} characters");
                _logger.LogInformation($"Final response ends with: {finalResponse.Substring(Math.Max(0, finalResponse.Length - 200))}");
                
                return finalResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in article analysis");
                return language == "bg" 
                    ? "Възникна грешка при анализ на статията."
                    : "An error occurred while analyzing the article.";
            }
        }

        private async Task<string> ProcessWebSearch(string message, string language)
        {
            try
            {
                _logger.LogInformation($"=== STARTING WEB SEARCH ===");
                _logger.LogInformation($"Message: '{message}', Language: '{language}'");
                
                if (IsCasualGreeting(message, language))
                {
                    _logger.LogInformation("Detected as CASUAL CONVERSATION - will not search web");
                    return await ProcessCasualConversation(message, language, "temp-session");
                }

                _logger.LogInformation("Calling GoogleSearchService.SearchNewsAsync...");
                var searchResults = await _googleSearchService.SearchNewsAsync(message, language, 5);
                
                _logger.LogInformation($"=== SEARCH RESULTS ===");
                _logger.LogInformation($"Received {searchResults.Count} search results from Google");
                foreach (var result in searchResults)
                {
                    _logger.LogInformation($"Search result: '{result.Title}' -> {result.Url} (from {result.Source})");
                }
                
                if (!searchResults.Any())
                {
                    _logger.LogWarning("=== NO SEARCH RESULTS FOUND ===");
                    _logger.LogWarning($"Original message: '{message}', Language: '{language}'");
                    return language == "bg" 
                        ? $"Не намерих актуални резултати за вашата заявка '{message}'. Моля, опитайте с други ключови думи."
                        : $"I couldn't find current results for your query '{message}'. Please try with different keywords.";
                }

                _logger.LogInformation("=== FORMATTING RESULTS ===");
                var formattedResults = searchResults.Select(result => new
                {
                    Title = TruncateText(result.Title, 60),
                    Url = result.Url,
                    Source = result.Source,
                    Reliability = DetermineReliability(result.Source),
                    Snippet = TruncateText(result.Summary ?? result.Content, 150)
                }).ToList();

                var searchSummary = string.Join("\n\n", formattedResults.Select(r => 
                    $"**[{r.Title}]({r.Url})**\n{r.Snippet}\n*Източник: {r.Source} (Надеждност: {r.Reliability})*"));

                _logger.LogInformation($"=== SEARCH SUMMARY ===");
                _logger.LogInformation($"Search summary length: {searchSummary.Length} characters");
                _logger.LogInformation($"Search summary preview: {TruncateText(searchSummary, 200)}");

                var contextPrompt = language == "bg"
                    ? $"На базата на следните резултати от търсене, отговори на въпроса: '{message}'\n\nРезултати:\n{searchSummary}\n\nДай кратък и информативен отговор на български език. ВАЖНО: Използвай само действителните връзки (URL адреси) от резултатите по-горе. НЕ създавай примерни или фиктивни връзки."
                    : $"Based on the following search results, answer the question: '{message}'\n\nResults:\n{searchSummary}\n\nProvide a brief and informative answer in English. IMPORTANT: Use only the actual links (URLs) from the results above. DO NOT create placeholder or example links.";

                _logger.LogInformation("=== CALLING OPENAI ===");
                _logger.LogInformation($"OpenAI prompt length: {contextPrompt.Length} characters");
                
                var openAIResponse = await _openAIService.GenerateResponseAsync(contextPrompt);
                
                _logger.LogInformation($"=== OPENAI RESPONSE ===");
                _logger.LogInformation($"OpenAI response length: {openAIResponse.Length} characters");
                _logger.LogInformation($"OpenAI response preview: {TruncateText(openAIResponse, 200)}");
                
                // Add a note about real links at the end
                var linkNote = language == "bg"
                    ? "\n\n*Всички връзки водят към действителни статии от интернет.*"
                    : "\n\n*All links lead to actual articles from the internet.*";
                    
                var finalResponse = openAIResponse + linkNote;
                
                _logger.LogInformation($"=== FINAL RESPONSE ===");
                _logger.LogInformation($"Final response length: {finalResponse.Length} characters");
                _logger.LogInformation($"=== END WEB SEARCH ===");
                
                return finalResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "=== ERROR IN WEB SEARCH ===");
                return language == "bg" 
                    ? "Възникна грешка при търсенето в интернет."
                    : "An error occurred while searching the web.";
            }
        }

        private async Task<dynamic?> SelectMostRelevantArticle(IEnumerable<dynamic> articles, string query, string language)
        {
            try
            {
                var articlesInfo = string.Join("\n", articles.Select((a, i) => 
                    $"{i + 1}. {a.Title} - {TruncateText(a.Preview ?? a.Body, 100)}"));

                var prompt = language == "bg"
                    ? $"Коя от следните статии е най-подходяща за заявката '{query}'? Отговори САМО с номера (например: 3). Статии:\n\n{articlesInfo}"
                    : $"Which of the following articles is most suitable for the query '{query}'? Answer ONLY with the number (example: 3). Articles:\n\n{articlesInfo}";

                _logger.LogInformation($"Asking OpenAI to select from {articles.Count()} articles for query: '{query}'");
                _logger.LogInformation($"Articles list:\n{articlesInfo}");

                var response = await _openAIService.GenerateResponseAsync(prompt);
                _logger.LogInformation($"OpenAI article selection response: '{response}'");
                
                var match = Regex.Match(response, @"(\d+)");
                if (match.Success && int.TryParse(match.Value, out int selectedIndex))
                {
                    _logger.LogInformation($"Extracted article index: {selectedIndex}");
                    
                    if (selectedIndex > 0 && selectedIndex <= articles.Count())
                    {
                        var selectedArticle = articles.ElementAt(selectedIndex - 1);
                        _logger.LogInformation($"Successfully selected article {selectedIndex}: '{selectedArticle.Title}'");
                        return selectedArticle;
                    }
                    else
                    {
                        _logger.LogWarning($"Article index {selectedIndex} is out of range (1-{articles.Count()})");
                    }
                }
                else
                {
                    _logger.LogWarning($"Could not extract valid number from OpenAI response: '{response}'");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in article selection");
            }

            return null;
        }

        private string DetermineReliability(string domain)
        {
            var highReliabilitySources = new[]
            {
                "bbc.com", "reuters.com", "ap.org", "cnn.com", "guardian.com",
                "bnt.bg", "nova.bg", "btvnovinite.bg", "dnevnik.bg", "mediapool.bg"
            };

            return highReliabilitySources.Any(source => domain.Contains(source)) ? "high" : "medium";
        }

        private string TruncateText(string text, int maxLength)
        {
            if (string.IsNullOrEmpty(text) || text.Length <= maxLength)
                return text;

            return text.Substring(0, maxLength - 3) + "...";
        }

        public string CreateSession()
        {
            var sessionId = Guid.NewGuid().ToString();
            _sessions[sessionId] = DateTime.UtcNow;
            CleanOldSessions();
            return sessionId;
        }

        public void EndSession(string sessionId)
        {
            _sessions.Remove(sessionId);
            _conversationHistory.Remove(sessionId); // Also clean conversation history
        }

        private void CleanOldSessions()
        {
            var cutoff = DateTime.UtcNow.AddHours(-1);
            var oldSessions = _sessions.Where(s => s.Value < cutoff).Select(s => s.Key).ToList();
            
            foreach (var oldSession in oldSessions)
            {
                _sessions.Remove(oldSession);
                _conversationHistory.Remove(oldSession); // Also clean conversation history
            }
        }
    }
}