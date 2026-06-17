using MediatR;
using server.Business.Product.Models;

namespace server.Business.Product.Requests;

public class DeleteProductRequest : IRequest<DeleteProductModel>
{
    public int ProductID { get; set; }
}
