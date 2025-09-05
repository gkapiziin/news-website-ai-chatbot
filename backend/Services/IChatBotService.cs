using NewsWebsite.API.Controllers;

namespace NewsWebsite.API.Services
{
    public interface IChatBotService
    {
        Task<ChatBotResponse> ProcessMessageAsync(ChatBotRequest request);
        string CreateSession();
        void EndSession(string sessionId);
    }
}
