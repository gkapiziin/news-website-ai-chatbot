using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NewsWebsite.API.Models
{
    public class NewsArticle
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(300)]
        public string Preview { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsPublished { get; set; } = false;

        // Foreign keys
        [Required]
        public string AuthorId { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        // Navigation properties
        [ForeignKey("AuthorId")]
        public virtual User Author { get; set; } = null!;

        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; } = null!;

        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<ArticleLike> Likes { get; set; } = new List<ArticleLike>();

        // Computed properties
        [NotMapped]
        public int LikeCount => Likes?.Count(l => l.IsLike) ?? 0;

        [NotMapped]
        public int DislikeCount => Likes?.Count(l => !l.IsLike) ?? 0;

        [NotMapped]
        public int CommentCount => Comments?.Count ?? 0;
    }
}
