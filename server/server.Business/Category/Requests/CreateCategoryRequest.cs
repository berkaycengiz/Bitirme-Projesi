using MediatR;
using server.Business.Category.Models;

namespace server.Business.Category.Requests;

public class CreateCategoryRequest : IRequest<CreateCategoryModel>
{
    public string CategoryName { get; set; } = null!;
    public string? Description { get; set; }
}