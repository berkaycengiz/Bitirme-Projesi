using MediatR;
using server.Business.User.Models;

namespace server.Business.User.Requests;

public class RegisterUserRequest : IRequest<RegisterUserModel>
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
