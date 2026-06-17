using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Category.Models;
using server.Business.Category.Requests;
using server.Data.Context;

namespace server.Business.Category.Handlers;

public class DeleteCategoryHandler : IRequestHandler<DeleteCategoryRequest, DeleteCategoryModel>
{
    private readonly RestaurantContext _context;

    public DeleteCategoryHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<DeleteCategoryModel> Handle(DeleteCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories.FindAsync(new object[] { request.CategoryID }, cancellationToken);

        if (category == null)
        {
            return new DeleteCategoryModel
            {
                IsSuccess = false,
                Message = "Kategori bulunamadı."
            };
        }

        // Kategori altında ürün var mı denetle
        var hasProducts = await _context.Products.AnyAsync(p => p.CategoryID == request.CategoryID, cancellationToken);
        if (hasProducts)
        {
            return new DeleteCategoryModel
            {
                IsSuccess = false,
                Message = "Bu kategoriye ait ürünler olduğu için kategori silinemez. Önce ürünleri başka bir kategoriye taşıyın ya da ürünleri silin."
            };
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync(cancellationToken);

        return new DeleteCategoryModel
        {
            IsSuccess = true,
            Message = "Kategori başarıyla silindi."
        };
    }
}
