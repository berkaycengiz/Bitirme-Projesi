using MediatR;
using server.Business.Auth.Models;

namespace server.Business.Auth.Requests;

public class LoginRequest : IRequest<LoginModel>
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
