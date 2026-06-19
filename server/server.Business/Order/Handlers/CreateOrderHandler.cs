using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Order.Models;
using server.Business.Order.Requests;
using server.Data.Context;
using server.Data.EF;
using server.Data;
using Microsoft.AspNetCore.SignalR;
using server.Business.Hubs; // EKSİK: Hub'ın yerini belirtmeliyiz
using server.Data.Enums; // EKSİK: OrderStatus Enum'ını kullanabilmek için

namespace server.Business.Order.Handlers;

public class CreateOrderHandler : IRequestHandler<CreateOrderRequest, CreateOrderModel>
{
    private readonly RestaurantContext _context;
    private readonly IHubContext<OrderHub> _hubContext;

    public CreateOrderHandler(RestaurantContext context, IHubContext<OrderHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<CreateOrderModel> Handle(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        // 1. TableNumber'a göre RestaurantTable kaydını bul
        var table = await _context.RestaurantTables
            .FirstOrDefaultAsync(t => t.TableNumber == request.TableNumber, cancellationToken);

        if (table == null)
        {
            return new CreateOrderModel
            {
                IsSuccess = false,
                Message = $"{request.TableNumber} numaralı masa bulunamadı."
            };
        }

        if (!table.IsOccupied)
        {
            return new CreateOrderModel
            {
                IsSuccess = false,
                Message = "Bu masa henüz açık/dolu olarak işaretlenmemiş. Lütfen sipariş vermeden önce masanızı açtırın."
            };
        }

        // 2. Yeni bir ana sipariş kaydı oluşturuyoruz
        var newOrder = new server.Data.EF.Order
        {
            TableID = table.TableID,
            OrderDate = DateTime.Now,
            Status = OrderStatus.Preparing,
            OrderDetails = new List<OrderDetail>()
        };

        decimal totalAmount = 0;

        // 2. Sepetteki her bir ürünü tek tek dönüyoruz
        foreach (var item in request.Items)
        {
            // DÜZELTME: FindAsync kullanımı sadece ProductID (int) bekler
            var product = await _context.Products.FindAsync(new object[] { item.ProductId }, cancellationToken);

            if (product != null)
            {
                var detail = new OrderDetail
                {
                    ProductID = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    ProductNote = item.Note
                };

                newOrder.OrderDetails.Add(detail);
                totalAmount += (product.Price * item.Quantity);
            }
        }

        newOrder.TotalPrice = totalAmount;

        // 3. Siparişi ve detaylarını veri tabanına kaydediyoruz
        await _context.Orders.AddAsync(newOrder, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // --- 4. SIGNALR BİLDİRİMİ GÖNDERME ---
        var newOrderNotification = new
        {
            OrderId = newOrder.OrderID,
            TableNumber = table.TableNumber,
            Status = newOrder.Status.ToString(),
            OrderTime = newOrder.OrderDate.ToString("HH:mm"),
            TotalAmount = newOrder.TotalPrice,
            Details = newOrder.OrderDetails.Select(d => new {
                ProductId = d.ProductID,
                ProductName = d.Product != null ? d.Product.ProductName : "Yemek",
                Quantity = d.Quantity,
                Note = d.ProductNote,
                UnitPrice = d.UnitPrice
            })
        };

        await _hubContext.Clients.Group("KitchenGroup").SendAsync("ReceiveNewOrder", newOrderNotification, cancellationToken);
        await _hubContext.Clients.Group("WaiterGroup").SendAsync("ReceiveNewOrder", newOrderNotification, cancellationToken);

        // 5. Sonucu dönüyoruz
        return new CreateOrderModel
        {
            IsSuccess = true,
            OrderId = newOrder.OrderID,
            Message = "Siparişiniz başarıyla alındı, ustalarımız hazırlamaya başladı!"
        };
    }
}