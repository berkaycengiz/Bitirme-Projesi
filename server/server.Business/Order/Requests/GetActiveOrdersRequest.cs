using MediatR;
using server.Business.Order.Models;

namespace server.Business.Order.Requests;

public class GetActiveOrdersRequest : IRequest<List<GetActiveOrdersModel>>
{
}
