using MediatR;
using server.Business.User.Models;

namespace server.Business.User.Requests;

public class GetAllUsersRequest : IRequest<List<GetAllUsersModel>>
{
}
