using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Table.Models;
using server.Business.Table.Requests;
using server.Data.Context;
using server.Data.Enums;

namespace server.Business.Table.Handlers;

public class GetRestaurantTablesHandler : IRequestHandler<GetRestaurantTablesRequest, List<GetRestaurantTablesModel>>
{
    private readonly RestaurantContext _context;

    public GetRestaurantTablesHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<List<GetRestaurantTablesModel>> Handle(GetRestaurantTablesRequest request, CancellationToken cancellationToken)
    {
        var tables = await _context.RestaurantTables
            .Include(t => t.Orders)
            .OrderBy(t => t.TableNumber)
            .ToListAsync(cancellationToken);

        return tables.Select(t =>
        {
            var activeOrders = t.Orders
                .Where(o => o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled)
                .ToList();

            var latestActiveOrder = activeOrders
                .OrderByDescending(o => o.OrderDate)
                .FirstOrDefault();

            decimal? sumPrice = activeOrders.Any() ? activeOrders.Sum(o => o.TotalPrice) : null;

            return new GetRestaurantTablesModel
            {
                TableID = t.TableID,
                TableNumber = t.TableNumber,
                QrCode = t.QrCode,
                IsOccupied = t.IsOccupied,
                ActiveOrderId = latestActiveOrder?.OrderID,
                ActiveOrderTotalPrice = sumPrice
            };
        }).ToList();
    }
}
