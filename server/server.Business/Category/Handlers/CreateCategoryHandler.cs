using MediatR;
using server.Business.Category.Models;
using server.Business.Category.Requests;
using server.Data.Context;
using server.Data.EF;

namespace server.Business.Category.Handlers;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryRequest, CreateCategoryModel>
{
    private readonly RestaurantContext _context;
    public CreateCategoryHandler(RestaurantContext context) => _context = context;

    public async Task<CreateCategoryModel> Handle(CreateCategoryRequest request, CancellationToken ct)
    {
        var category = new server.Data.EF.Category
        {
            CategoryName = request.CategoryName,
            Description = request.Description,
            // ICollection olduğu için boş bir liste ile başlatıyoruz ki null hatası almayalım
            Products = new List<server.Data.EF.Product>()
        };

        await _context.Categories.AddAsync(category, ct);
        var result = await _context.SaveChangesAsync(ct);

        return new CreateCategoryModel
        {
            CategoryId = category.CategoryID,
            IsSuccess = result > 0,
            Message = result > 0 ? "Kategori başarıyla oluşturuldu." : "Kategori kaydedilirken bir hata oluştu."
        };
    }
}