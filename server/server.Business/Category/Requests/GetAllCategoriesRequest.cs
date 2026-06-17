using MediatR;
using server.Business.Category.Models;

namespace server.Business.Category.Requests;

public class GetAllCategoriesRequest : IRequest<List<GetAllCategoriesModel>>
{
}
