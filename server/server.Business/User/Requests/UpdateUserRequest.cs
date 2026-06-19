using MediatR;
using server.Business.User.Models;

namespace server.Business.User.Requests;

public class UpdateUserRequest : IRequest<UpdateUserModel>
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string Role { get; set; } = string.Empty;
}
