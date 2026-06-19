using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Table.Models;
using server.Business.Table.Requests;
using server.Data.Context;
using server.Data.EF;

namespace server.Business.Table.Handlers;

public class CreateTableHandler : IRequestHandler<CreateTableRequest, CreateTableModel>
{
    private readonly RestaurantContext _context;

    public CreateTableHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<CreateTableModel> Handle(CreateTableRequest request, CancellationToken cancellationToken)
    {
        var exists = await _context.RestaurantTables.AnyAsync(t => t.TableNumber == request.TableNumber, cancellationToken);
        if (exists)
        {
            return new CreateTableModel
            {
                IsSuccess = false,
                Message = $"Masa {request.TableNumber} zaten mevcut."
            };
        }

        var newTable = new RestaurantTable
        {
            TableNumber = request.TableNumber,
            QrCode = request.QrCode,
            IsOccupied = false
        };

        await _context.RestaurantTables.AddAsync(newTable, cancellationToken);
        var result = await _context.SaveChangesAsync(cancellationToken);

        return new CreateTableModel
        {
            TableID = newTable.TableID,
            IsSuccess = result > 0,
            Message = result > 0 ? "Masa başarıyla eklendi." : "Masa eklenirken bir hata oluştu."
        };
    }
}
