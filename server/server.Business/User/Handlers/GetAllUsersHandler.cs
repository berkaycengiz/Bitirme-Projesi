using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.User.Models;
using server.Business.User.Requests;
using server.Data.Context;

namespace server.Business.User.Handlers;

public class GetAllUsersHandler : IRequestHandler<GetAllUsersRequest, List<GetAllUsersModel>>
{
    private readonly RestaurantContext _context;

    public GetAllUsersHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<List<GetAllUsersModel>> Handle(GetAllUsersRequest request, CancellationToken cancellationToken)
    {
        var users = await _context.Users
            .OrderBy(u => u.Username)
            .ToListAsync(cancellationToken);

        return users.Select(u => new GetAllUsersModel
        {
            Id = u.Id,
            Username = u.Username,
            Role = u.Role.ToString()
        }).ToList();
    }
}
