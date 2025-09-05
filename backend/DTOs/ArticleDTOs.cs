using System.ComponentModel.DataAnnotations;

namespace NewsWebsite.API.DTOs
{
    public class CreateArticleDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(300)]
        public string Preview { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        public bool IsPublished { get; set; } = false;
    }

    public class UpdateArticleDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(300)]
        public string? Preview { get; set; }

        public string? Body { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public int? CategoryId { get; set; }

        public bool? IsPublished { get; set; }
    }

    public class ArticleDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Preview { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsPublished { get; set; }

        public UserDto Author { get; set; } = null!;
        public CategoryDto Category { get; set; } = null!;

        public int LikeCount { get; set; }
        public int DislikeCount { get; set; }
        public int CommentCount { get; set; }

        public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
    }

    public class ArticleListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Preview { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsPublished { get; set; }

        public string AuthorName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;

        public int LikeCount { get; set; }
        public int DislikeCount { get; set; }
        public int CommentCount { get; set; }
    }
}
