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
            var activeOrder = t.Orders
                .Where(o => o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled)
                .OrderByDescending(o => o.OrderDate)
                .FirstOrDefault();

            return new GetRestaurantTablesModel
            {
                TableID = t.TableID,
                TableNumber = t.TableNumber,
                QrCode = t.QrCode,
                IsOccupied = t.IsOccupied,
                ActiveOrderId = activeOrder?.OrderID,
                ActiveOrderTotalPrice = activeOrder?.TotalPrice
            };
        }).ToList();
    }
}
