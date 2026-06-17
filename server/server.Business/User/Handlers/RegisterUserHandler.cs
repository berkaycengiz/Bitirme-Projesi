using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.User.Models;
using server.Business.User.Requests;
using server.Data.Context;
using server.Data.EF;

namespace server.Business.User.Handlers;

public class RegisterUserHandler : IRequestHandler<RegisterUserRequest, RegisterUserModel>
{
    private readonly RestaurantContext _context;

    public RegisterUserHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<RegisterUserModel> Handle(RegisterUserRequest request, CancellationToken cancellationToken)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Username == request.Username, cancellationToken);
        if (userExists)
        {
            return new RegisterUserModel
            {
                IsSuccess = false,
                Message = "Bu kullanıcı adı zaten alınmış."
            };
        }

        // Şifreyi BCrypt kullanarak güvenli şekilde hash'liyoruz
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newUser = new AppUser
        {
            Username = request.Username,
            PasswordHash = hashedPassword,
            Role = request.Role
        };

        await _context.Users.AddAsync(newUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new RegisterUserModel
        {
            IsSuccess = true,
            Message = "Kullanıcı başarıyla kaydedildi."
        };
    }
}
