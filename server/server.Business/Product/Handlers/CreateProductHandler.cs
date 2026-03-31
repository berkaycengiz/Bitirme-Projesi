using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Product.Models;
using server.Business.Product.Requests;
using server.Data.Context;
using server.Data.EF;

namespace server.Business.Product.Handlers;

public class CreateProductHandler : IRequestHandler<CreateProductRequest, CreateProductModel>
{
    private readonly RestaurantContext _context;

    public CreateProductHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<CreateProductModel> Handle(CreateProductRequest request, CancellationToken cancellationToken)
    {
        // 1. Kategori kontrolü (Foreign Key güvenliği için)
        var category = await _context.Categories
            .FirstOrDefaultAsync(x => x.CategoryID == request.CategoryID, cancellationToken);

        if (category == null)
        {
            return new CreateProductModel
            {
                IsSuccess = false,
                Message = "Hata: Belirtilen Kategori bulunamadı."
            };
        }

        // 2. Yeni Product nesnesini oluşturma
        var newProduct = new server.Data.EF.Product
        {
            ProductName = request.ProductName,
            Price = request.Price,
            ImageUrl = request.ImageUrl,
            CategoryID = request.CategoryID,
            // ICollection yapısı: Navigation property'yi boş liste ile başlatıyoruz
            OrderDetails = new List<OrderDetail>()
        };

        // 3. Veritabanına kayıt
        await _context.Products.AddAsync(newProduct, cancellationToken);
        var result = await _context.SaveChangesAsync(cancellationToken);

        // 4. Sonuç modelini dönme
        return new CreateProductModel
        {
            ProductId = newProduct.ProductID,
            IsSuccess = result > 0,
            Message = result > 0 ? "Ürün başarıyla eklendi." : "Veritabanına kayıt sırasında bir hata oluştu."
        };
    }
}