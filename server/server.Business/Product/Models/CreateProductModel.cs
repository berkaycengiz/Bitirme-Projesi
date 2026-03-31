namespace server.Business.Product.Models;

public class CreateProductModel
{
    public int ProductId { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
}