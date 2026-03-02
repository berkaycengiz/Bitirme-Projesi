using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Order.Models;
using server.Business.Order.Requests;
using server.Data.Context;
using server.Data.EF;
using server.Data; // Entity sınıflarını (Order, OrderDetail) kullanabilmek için

namespace server.Business.Order.Handlers;

public class CreateOrderHandler : IRequestHandler<CreateOrderRequest, CreateOrderModel>
{
    private readonly RestaurantContext _context;

    public CreateOrderHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<CreateOrderModel> Handle(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        // 1. Yeni bir ana sipariş kaydı oluşturuyoruz
        var newOrder = new server.Data.EF.Order
        {
            TableNumber = request.TableNumber, // QR'dan gelen masa no
            OrderDate = DateTime.Now,
            OrderStatus = "Hazırlanıyor",
            OrderDetails = new List<OrderDetail>()
        };

        decimal totalAmount = 0;

        // 2. Sepetteki her bir ürünü tek tek dönüyoruz
        foreach (var item in request.Items)
        {
            // Veri tabanından ürünün güncel fiyatını çekiyoruz
            var product = await _context.Products.FindAsync(item.ProductId);

            if (product != null)
            {
                // Her bir ürün için detay kaydı ve usta için not ekliyoruz
                var detail = new OrderDetail
                {
                    ProductID = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    ProductNote = item.Note // "Turşu olmasın" gibi özel not buraya geliyor
                };

                newOrder.OrderDetails.Add(detail);
                totalAmount += (product.Price * item.Quantity);
            }
        }

        newOrder.TotalPrice = totalAmount;

        // 3. Siparişi ve detaylarını veri tabanına kaydediyoruz
        await _context.Orders.AddAsync(newOrder);
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Sonucu dönüyoruz
        return new CreateOrderModel
        {
            IsSuccess = true,
            OrderId = newOrder.OrderID,
            Message = "Siparişiniz başarıyla alındı, ustalarımız hazırlamaya başladı!"
        };
    }
}