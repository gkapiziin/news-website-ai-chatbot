using System.ComponentModel.DataAnnotations;

namespace NewsWebsite.API.DTOs
{
    public class LikeDto
    {
        [Required]
        public bool IsLike { get; set; } // true for like, false for dislike
    }

    public class ArticleLikeDto
    {
        public int Id { get; set; }
        public bool IsLike { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public int ArticleId { get; set; }
    }

    public class LikeStatsDto
    {
        public int LikesCount { get; set; }
        public int DislikesCount { get; set; }
        public bool? UserLike { get; set; } // null if user hasn't liked/disliked, true if liked, false if disliked
    }
}