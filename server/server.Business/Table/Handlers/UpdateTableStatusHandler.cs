using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using server.Business.Hubs;
using server.Business.Table.Models;
using server.Business.Table.Requests;
using server.Data.Context;
using server.Data.Enums;

namespace server.Business.Table.Handlers;

public class UpdateTableStatusHandler : IRequestHandler<UpdateTableStatusRequest, UpdateTableStatusModel>
{
    private readonly RestaurantContext _context;
    private readonly IHubContext<OrderHub> _hubContext;

    public UpdateTableStatusHandler(RestaurantContext context, IHubContext<OrderHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<UpdateTableStatusModel> Handle(UpdateTableStatusRequest request, CancellationToken cancellationToken)
    {
        var table = await _context.RestaurantTables
            .FirstOrDefaultAsync(t => t.TableNumber == request.TableNumber, cancellationToken);

        if (table == null)
        {
            return new UpdateTableStatusModel
            {
                IsSuccess = false,
                Message = $"{request.TableNumber} numaralı masa bulunamadı."
            };
        }

        table.IsOccupied = request.IsOccupied;

        if (!request.IsOccupied)
        {
            // Masa boşaltılıyorsa, bu masaya ait tüm aktif siparişleri tamamlandı (Completed = status 3) yap
            var activeOrders = await _context.Orders
                .Where(o => o.TableID == table.TableID && o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled)
                .ToListAsync(cancellationToken);

            foreach (var order in activeOrders)
            {
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

        // SignalR ile garsonlara masanın güncel durumunu bildir
        await _hubContext.Clients.Group("WaiterGroup").SendAsync("TableStatusChanged", new
        {
            TableNumber = table.TableNumber,
            IsOccupied = table.IsOccupied
        }, cancellationToken);

        return new UpdateTableStatusModel
        {
            IsSuccess = true,
            Message = $"Masa {table.TableNumber} doluluk durumu '{table.IsOccupied}' olarak güncellendi."
        };
    }
}
