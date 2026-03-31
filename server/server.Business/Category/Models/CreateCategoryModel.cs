namespace server.Business.Category.Models;

public class CreateCategoryModel
{
    public int CategoryId { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
}