using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using server.Business.Order.Models;
using server.Business.Order.Requests;
using server.Data.Context;
using server.Business.Hubs;
using server.Data.Enums; // Enum'ı tanıması için ekledik

namespace server.Business.Order.Handlers;

public class UpdateOrderStatusHandler : IRequestHandler<UpdateOrderStatusRequest, UpdateOrderStatusModel>
{
    private readonly RestaurantContext _context;
    private readonly IHubContext<OrderHub> _hubContext;

    public UpdateOrderStatusHandler(RestaurantContext context, IHubContext<OrderHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<UpdateOrderStatusModel> Handle(UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        // 1. İlgili siparişi tabloya include ederek buluyoruz
        var order = await _context.Orders
            .Include(o => o.Table)
            .FirstOrDefaultAsync(x => x.OrderID == request.OrderId, cancellationToken);

        if (order == null)
        {
            return new UpdateOrderStatusModel
            {
                IsSuccess = false,
                Message = $"Hata: {request.OrderId} numaralı sipariş bulunamadı.",
                OrderId = request.OrderId
            };
        }

        // 2. Eski durumu saklıyoruz (Mesajda göstermek için string'e çeviriyoruz)
        string oldStatusDisplay = order.Status.ToString();

        // 3. Durumu güncelliyoruz (Enum olduğu için direkt atama yapıyoruz)
        order.Status = request.NewStatus;

        // 4. Kaydediyoruz
        await _context.SaveChangesAsync(cancellationToken);

        // --- 5. SIGNALR BİLDİRİMİ ---
        await _hubContext.Clients.All.SendAsync("OrderStatusChanged", new
        {
            OrderId = order.OrderID,
            TableNumber = order.Table.TableNumber,
            NewStatus = order.Status.ToString(), // DÜZELTME: "order.OrderStatus" değil "order.Status"
            UpdateDate = DateTime.Now.ToString("HH:mm:ss")
        }, cancellationToken);

        // 6. Başarılı sonucu dönüyoruz
        return new UpdateOrderStatusModel
        {
            IsSuccess = true,
            OrderId = order.OrderID,
            UpdatedStatus = order.Status.ToString(), // DÜZELTME: "order.Status"
            Message = $"Sipariş durumu '{oldStatusDisplay}' aşamasından '{order.Status}' aşamasına güncellendi."
        };
    }
}