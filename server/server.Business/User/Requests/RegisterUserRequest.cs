using MediatR;
using server.Business.User.Models;
using server.Data.Enums;

namespace server.Business.User.Requests;

public class RegisterUserRequest : IRequest<RegisterUserModel>
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}
