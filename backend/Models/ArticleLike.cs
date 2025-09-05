using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NewsWebsite.API.Models
{
    public class ArticleLike
    {
        [Key]
        public int Id { get; set; }

        public bool IsLike { get; set; } // true for like, false for dislike

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int ArticleId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("ArticleId")]
        public virtual NewsArticle Article { get; set; } = null!;
    }
}
