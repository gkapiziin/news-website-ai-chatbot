using System.ComponentModel.DataAnnotations;

namespace NewsWebsite.API.DTOs
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public UserDto User { get; set; } = null!;
    }

    public class CreateCommentDto
    {
        [Required(ErrorMessage = "Comment content is required")]
        [StringLength(1000, ErrorMessage = "Comment cannot exceed 1000 characters")]
        public string Content { get; set; } = string.Empty;

        [Required(ErrorMessage = "Article ID is required")]
        public int ArticleId { get; set; }
    }
}
