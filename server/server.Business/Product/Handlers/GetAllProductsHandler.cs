using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Data.Context;
using server.Business.Product.Requests;
using server.Business.Product.Models;

namespace server.Business.Product.Handlers;

public class GetAllProductsHandler : IRequestHandler<GetAllProductsRequest, List<GetAllProductsModel>>
{
    private readonly RestaurantContext _context;

    public GetAllProductsHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<List<GetAllProductsModel>> Handle(GetAllProductsRequest request, CancellationToken cancellationToken)
    {
        var query = _context.Products.Include(x => x.Category).AsQueryable();

        // Eğer bir CategoryID gönderildiyse filtrele
        if (request.CategoryID.HasValue && request.CategoryID > 0)
        {
            query = query.Where(x => x.CategoryID == request.CategoryID.Value);
        }

        return await query
            .Select(p => new GetAllProductsModel
            {
                ProductID = p.ProductID,
                ProductName = p.ProductName,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                CategoryName = p.Category.CategoryName
            })
            .ToListAsync(cancellationToken);
    }
}