using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.User.Models;
using server.Business.User.Requests;
using server.Data.Context;

namespace server.Business.User.Handlers;

public class UpdateUserHandler : IRequestHandler<UpdateUserRequest, UpdateUserModel>
{
    private readonly RestaurantContext _context;

    public UpdateUserHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<UpdateUserModel> Handle(UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.Id }, cancellationToken);
        if (user == null)
        {
            return new UpdateUserModel
            {
                IsSuccess = false,
                Message = "Kullanıcı bulunamadı."
            };
        }

        // Check if username is changing and unique
        if (user.Username != request.Username)
        {
            var exists = await _context.Users.AnyAsync(u => u.Username == request.Username, cancellationToken);
            if (exists)
            {
                return new UpdateUserModel
                {
                    IsSuccess = false,
                    Message = "Bu kullanıcı adı zaten alınmış."
                };
            }
        }

        user.Username = request.Username;
        user.Role = request.Role;

        if (!string.IsNullOrEmpty(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        var result = await _context.SaveChangesAsync(cancellationToken);

        return new UpdateUserModel
        {
            IsSuccess = true,
            Message = "Kullanıcı başarıyla güncellendi."
        };
    }
}
