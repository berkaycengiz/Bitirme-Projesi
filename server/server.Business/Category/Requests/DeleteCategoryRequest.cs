using MediatR;
using server.Business.Category.Models;

namespace server.Business.Category.Requests;

public class DeleteCategoryRequest : IRequest<DeleteCategoryModel>
{
    public int CategoryID { get; set; }
}
