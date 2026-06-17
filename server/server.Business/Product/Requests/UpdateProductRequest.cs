using MediatR;
using server.Business.Product.Models;

namespace server.Business.Product.Requests;

public class UpdateProductRequest : IRequest<UpdateProductModel>
{
    public int ProductID { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public int CategoryID { get; set; }
}
