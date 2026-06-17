using MediatR;
using server.Business.User.Models;

namespace server.Business.User.Requests;

public class DeleteUserRequest : IRequest<DeleteUserModel>
{
    public int Id { get; set; }
}
