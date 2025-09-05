using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NewsWebsite.API.Services;
using System.ComponentModel.DataAnnotations;

namespace NewsWebsite.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatBotService _chatBotService;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(IChatBotService chatBotService, ILogger<ChatbotController> logger)
        {
            _chatBotService = chatBotService;
            _logger = logger;
        }

        [HttpPost("process")]
        public async Task<ActionResult<ChatBotResponse>> ProcessMessage([FromBody] ChatBotRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response = await _chatBotService.ProcessMessageAsync(request);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing ChatBot message: {Message}", request.Message);
                return StatusCode(500, "Възникна грешка при обработката на съобщението");
            }
        }

        [HttpPost("session")]
        public ActionResult<ChatBotSessionResponse> CreateSession()
        {
            try
            {
                var sessionId = _chatBotService.CreateSession();
                return Ok(new ChatBotSessionResponse { SessionId = sessionId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ChatBot session");
                return StatusCode(500, "Възникна грешка при създаването на сесия");
            }
        }

        [HttpDelete("session/{sessionId}")]
        public ActionResult EndSession(string sessionId)
        {
            try
            {
                _chatBotService.EndSession(sessionId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending ChatBot session: {SessionId}", sessionId);
                return StatusCode(500, "Възникна грешка при приключването на сесията");
            }
        }
    }

    public class ChatBotRequest
    {
        [Required(ErrorMessage = "Съобщението е задължително")]
        [StringLength(1000, ErrorMessage = "Съобщението не може да бъде по-дълго от 1000 символа")]
        public string Message { get; set; } = string.Empty;

        [Required(ErrorMessage = "Езикът е задължителен")]
        public string Language { get; set; } = "bg";

        public string? SessionId { get; set; }
    }

    public class ChatBotResponse
    {
        public string Content { get; set; } = string.Empty;
        public List<SourceInfo>? Sources { get; set; }
        public string? ArticleLink { get; set; }
        public string SessionId { get; set; } = string.Empty;
    }

    public class ChatBotSessionResponse
    {
        public string SessionId { get; set; } = string.Empty;
    }

    public class SourceInfo
    {
        public string Title { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Reliability { get; set; } = "medium";
        public string? Snippet { get; set; }
    }
}
