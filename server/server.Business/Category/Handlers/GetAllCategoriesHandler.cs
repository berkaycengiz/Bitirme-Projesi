using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Category.Models;
using server.Business.Category.Requests;
using server.Data.Context;

namespace server.Business.Category.Handlers;

public class GetAllCategoriesHandler : IRequestHandler<GetAllCategoriesRequest, List<GetAllCategoriesModel>>
{
    private readonly RestaurantContext _context;

    public GetAllCategoriesHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<List<GetAllCategoriesModel>> Handle(GetAllCategoriesRequest request, CancellationToken cancellationToken)
    {
        var categories = await _context.Categories
            .OrderBy(c => c.CategoryName)
            .ToListAsync(cancellationToken);

        return categories.Select(c => new GetAllCategoriesModel
        {
            CategoryID = c.CategoryID,
            CategoryName = c.CategoryName,
            Description = c.Description
        }).ToList();
    }
}
