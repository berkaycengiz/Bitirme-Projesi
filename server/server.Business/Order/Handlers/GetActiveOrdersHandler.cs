using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Order.Models;
using server.Business.Order.Requests;
using server.Data.Context;
using server.Data.Enums;

namespace server.Business.Order.Handlers;

public class GetActiveOrdersHandler : IRequestHandler<GetActiveOrdersRequest, List<GetActiveOrdersModel>>
{
    private readonly RestaurantContext _context;

    public GetActiveOrdersHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<List<GetActiveOrdersModel>> Handle(GetActiveOrdersRequest request, CancellationToken cancellationToken)
    {
        var activeOrders = await _context.Orders
            .Include(o => o.Table)
            .Include(o => o.OrderDetails)
                .ThenInclude(d => d.Product)
            .Where(o => o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled)
            .OrderBy(o => o.OrderDate)
            .ToListAsync(cancellationToken);

        return activeOrders.Select(o => new GetActiveOrdersModel
        {
            OrderId = o.OrderID,
            TableNumber = o.Table.TableNumber,
            Status = o.Status.ToString(),
            OrderTime = o.OrderDate.ToString("HH:mm"),
            TotalAmount = o.TotalPrice,
            Details = o.OrderDetails.Select(d => new GetActiveOrderDetailModel
            {
                ProductId = d.ProductID,
                ProductName = d.Product != null ? d.Product.ProductName : "Bilinmeyen Ürün",
                Quantity = d.Quantity,
                Note = d.ProductNote
            }).ToList()
        }).ToList();
    }
}
