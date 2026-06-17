using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Product.Models;
using server.Business.Product.Requests;
using server.Data.Context;

namespace server.Business.Product.Handlers;

public class DeleteProductHandler : IRequestHandler<DeleteProductRequest, DeleteProductModel>
{
    private readonly RestaurantContext _context;

    public DeleteProductHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<DeleteProductModel> Handle(DeleteProductRequest request, CancellationToken cancellationToken)
    {
        var product = await _context.Products.FindAsync(new object[] { request.ProductID }, cancellationToken);

        if (product == null)
        {
            return new DeleteProductModel
            {
                IsSuccess = false,
                Message = "Ürün bulunamadı."
            };
        }

        // Sipariş detaylarında bu ürünün kullanılıp kullanılmadığını denetleyelim
        var isUsed = await _context.OrderDetails.AnyAsync(d => d.ProductID == request.ProductID, cancellationToken);
        if (isUsed)
        {
            // Eğer siparişi geçmişte varsa, silmek yerine stokta yok (IsAvailable = false) olarak işaretlemeyi önerebiliriz veya hata döneriz.
            return new DeleteProductModel
            {
                IsSuccess = false,
                Message = "Bu ürün geçmiş siparişlerde kullanıldığı için silinemez. Stok dışı (IsAvailable = false) olarak güncellemeyi deneyin."
            };
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);

        return new DeleteProductModel
        {
            IsSuccess = true,
            Message = "Ürün başarıyla silindi."
        };
    }
}
