using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Product.Models;
using server.Business.Product.Requests;
using server.Data.Context;

namespace server.Business.Product.Handlers;

public class UpdateProductHandler : IRequestHandler<UpdateProductRequest, UpdateProductModel>
{
    private readonly RestaurantContext _context;

    public UpdateProductHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<UpdateProductModel> Handle(UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var product = await _context.Products.FindAsync(new object[] { request.ProductID }, cancellationToken);

        if (product == null)
        {
            return new UpdateProductModel
            {
                IsSuccess = false,
                Message = "Ürün bulunamadı."
            };
        }

        var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryID == request.CategoryID, cancellationToken);
        if (!categoryExists)
        {
            return new UpdateProductModel
            {
                IsSuccess = false,
                Message = "Belirtilen kategori bulunamadı."
            };
        }

        product.ProductName = request.ProductName;
        product.Description = request.Description;
        product.Price = request.Price;
        product.ImageUrl = request.ImageUrl;
        product.IsAvailable = request.IsAvailable;
        product.CategoryID = request.CategoryID;

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateProductModel
        {
            IsSuccess = true,
            Message = "Ürün başarıyla güncellendi."
        };
    }
}
