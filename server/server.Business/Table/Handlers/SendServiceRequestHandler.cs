using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using server.Business.Hubs;
using server.Business.Table.Models;
using server.Business.Table.Requests;
using server.Data.Context;

namespace server.Business.Table.Handlers;

public class SendServiceRequestHandler : IRequestHandler<SendServiceRequest, SendServiceRequestModel>
{
    private readonly RestaurantContext _context;
    private readonly IHubContext<OrderHub> _hubContext;

    public SendServiceRequestHandler(RestaurantContext context, IHubContext<OrderHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<SendServiceRequestModel> Handle(SendServiceRequest request, CancellationToken cancellationToken)
    {
        var table = await _context.RestaurantTables
            .FirstOrDefaultAsync(t => t.TableNumber == request.TableNumber, cancellationToken);

        if (table == null)
        {
            return new SendServiceRequestModel
            {
                IsSuccess = false,
                Message = $"{request.TableNumber} numaralı masa bulunamadı."
            };
        }

        // Garson çağrısı veya hesap isteme durumunda garson paneline bildirim gönder
        await _hubContext.Clients.Group("WaiterGroup").SendAsync("ReceiveServiceRequest", new
        {
            TableNumber = table.TableNumber,
            RequestType = request.RequestType, // "CallWaiter" veya "RequestBill"
            RequestTime = DateTime.Now.ToString("HH:mm:ss")
        }, cancellationToken);

        return new SendServiceRequestModel
        {
            IsSuccess = true,
            Message = $"Talep başarıyla iletildi: {request.RequestType}"
        };
    }
}
