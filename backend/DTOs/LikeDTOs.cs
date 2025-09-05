using System.ComponentModel.DataAnnotations;

namespace NewsWebsite.API.DTOs
{
    public class LikeDto
    {
        [Required(ErrorMessage = "IsLike value is required")]
        public bool IsLike { get; set; }
    }
}
