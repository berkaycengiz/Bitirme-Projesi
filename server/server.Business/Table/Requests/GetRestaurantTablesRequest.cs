using MediatR;
using server.Business.Table.Models;

namespace server.Business.Table.Requests;

public class GetRestaurantTablesRequest : IRequest<List<GetRestaurantTablesModel>>
{
}
