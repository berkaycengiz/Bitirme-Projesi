using MediatR;
using server.Business.Product.Models;

namespace server.Business.Product.Requests;

public class CreateProductRequest : IRequest<CreateProductModel>
{
    public string ProductName { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int CategoryID { get; set; }
}