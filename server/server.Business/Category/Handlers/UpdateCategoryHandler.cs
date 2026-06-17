using MediatR;
using server.Business.Category.Models;
using server.Business.Category.Requests;
using server.Data.Context;

namespace server.Business.Category.Handlers;

public class UpdateCategoryHandler : IRequestHandler<UpdateCategoryRequest, UpdateCategoryModel>
{
    private readonly RestaurantContext _context;

    public UpdateCategoryHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<UpdateCategoryModel> Handle(UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories.FindAsync(new object[] { request.CategoryID }, cancellationToken);

        if (category == null)
        {
            return new UpdateCategoryModel
            {
                IsSuccess = false,
                Message = "Kategori bulunamadı."
            };
        }

        category.CategoryName = request.CategoryName;
        category.Description = request.Description;

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateCategoryModel
        {
            IsSuccess = true,
            Message = "Kategori başarıyla güncellendi."
        };
    }
}
