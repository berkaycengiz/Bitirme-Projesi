using MediatR;
using server.Business.Category.Models;

namespace server.Business.Category.Requests;

public class UpdateCategoryRequest : IRequest<UpdateCategoryModel>
{
    public int CategoryID { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
