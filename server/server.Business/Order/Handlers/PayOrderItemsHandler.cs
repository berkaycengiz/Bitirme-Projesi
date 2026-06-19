using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using server.Business.Hubs;
using server.Business.Order.Models;
using server.Business.Order.Requests;
using server.Data.Context;
using server.Data.Enums;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace server.Business.Order.Handlers;

public class PayOrderItemsHandler : IRequestHandler<PayOrderItemsRequest, PayOrderItemsModel>
{
    private readonly RestaurantContext _context;
    private readonly IHubContext<OrderHub> _hubContext;

    public PayOrderItemsHandler(RestaurantContext context, IHubContext<OrderHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<PayOrderItemsModel> Handle(PayOrderItemsRequest request, CancellationToken cancellationToken)
    {
        var table = await _context.RestaurantTables
            .FirstOrDefaultAsync(t => t.TableNumber == request.TableNumber, cancellationToken);

        if (table == null)
        {
            return new PayOrderItemsModel { IsSuccess = false, Message = "Masa bulunamadı." };
        }

        // 1. Masaya ait tüm aktif siparişleri getir
        var activeOrders = await _context.Orders
            .Include(o => o.OrderDetails)
            .Where(o => o.TableID == table.TableID && o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled)
            .OrderBy(o => o.OrderDate)
            .ToListAsync(cancellationToken);

        if (!activeOrders.Any())
        {
            return new PayOrderItemsModel { IsSuccess = false, Message = "Masanın aktif siparişi bulunmamaktadır." };
        }

        // 2. Ödenecek ürünleri sırayla aktif siparişlerden düş
        foreach (var payItem in request.Items)
        {
            int quantityToPay = payItem.Quantity;
            if (quantityToPay <= 0) continue;

            foreach (var order in activeOrders)
            {
                var detail = order.OrderDetails.FirstOrDefault(d => d.ProductID == payItem.ProductId);
                if (detail != null)
                {
                    int availableQty = detail.Quantity;
                    if (availableQty <= quantityToPay)
                    {
                        // Bu siparişteki ürünün tamamını öde
                        quantityToPay -= availableQty;
                        order.TotalPrice -= availableQty * detail.UnitPrice;
                        _context.Remove(detail);
                        order.OrderDetails.Remove(detail);
                    }
                    else
                    {
                        // Bu siparişteki ürünün bir kısmını öde
                        detail.Quantity -= quantityToPay;
                        order.TotalPrice -= quantityToPay * detail.UnitPrice;
                        quantityToPay = 0;
                    }
                }

                if (quantityToPay == 0) break;
            }
        }

        // 3. Siparişlerin durumunu ve masanın doluluk durumunu kontrol et
        foreach (var order in activeOrders)
        {
            // Eğer siparişte hiç ürün kalmadıysa siparişi tamamla
            if (!order.OrderDetails.Any() || order.TotalPrice <= 0)
            {
                order.TotalPrice = 0;
                order.Status = OrderStatus.Completed;

                // SignalR ile durumun değiştiğini yayınla
                await _hubContext.Clients.All.SendAsync("OrderStatusChanged", new
                {
                    OrderId = order.OrderID,
                    TableNumber = table.TableNumber,
                    NewStatus = order.Status.ToString(),
                    UpdateDate = DateTime.Now.ToString("HH:mm:ss")
                }, cancellationToken);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Masada hala aktif sipariş kalıp kalmadığına bak
        var hasActiveOrders = await _context.Orders
            .AnyAsync(o => o.TableID == table.TableID && o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled, cancellationToken);

        if (!hasActiveOrders)
        {
            // Aktif sipariş kalmadıysa masayı boşalt
            table.IsOccupied = false;
            await _context.SaveChangesAsync(cancellationToken);

            // SignalR ile masanın güncel durumunu bildir
            await _hubContext.Clients.Group("WaiterGroup").SendAsync("TableStatusChanged", new
            {
                TableNumber = table.TableNumber,
                IsOccupied = false
            }, cancellationToken);
        }

        return new PayOrderItemsModel
        {
            IsSuccess = true,
            Message = "Seçilen ürünlerin ödemesi başarıyla alındı ve hesaptan düşüldü."
        };
    }
}
