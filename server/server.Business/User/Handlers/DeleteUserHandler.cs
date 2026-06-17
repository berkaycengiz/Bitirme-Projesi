using MediatR;
using server.Business.User.Models;
using server.Business.User.Requests;
using server.Data.Context;

namespace server.Business.User.Handlers;

public class DeleteUserHandler : IRequestHandler<DeleteUserRequest, DeleteUserModel>
{
    private readonly RestaurantContext _context;

    public DeleteUserHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<DeleteUserModel> Handle(DeleteUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.Id }, cancellationToken);

        if (user == null)
        {
            return new DeleteUserModel
            {
                IsSuccess = false,
                Message = "Kullanıcı bulunamadı."
            };
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);

        return new DeleteUserModel
        {
            IsSuccess = true,
            Message = "Kullanıcı başarıyla silindi."
        };
    }
}
