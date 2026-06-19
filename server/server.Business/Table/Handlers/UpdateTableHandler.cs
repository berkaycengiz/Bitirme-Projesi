using MediatR;
using Microsoft.EntityFrameworkCore;
using server.Business.Table.Models;
using server.Business.Table.Requests;
using server.Data.Context;

namespace server.Business.Table.Handlers;

public class UpdateTableHandler : IRequestHandler<UpdateTableRequest, UpdateTableModel>
{
    private readonly RestaurantContext _context;

    public UpdateTableHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<UpdateTableModel> Handle(UpdateTableRequest request, CancellationToken cancellationToken)
    {
        var table = await _context.RestaurantTables.FindAsync(new object[] { request.TableID }, cancellationToken);
        if (table == null)
        {
            return new UpdateTableModel
            {
                IsSuccess = false,
                Message = "Masa bulunamadı."
            };
        }

        if (table.TableNumber != request.TableNumber)
        {
            var exists = await _context.RestaurantTables.AnyAsync(t => t.TableNumber == request.TableNumber, cancellationToken);
            if (exists)
            {
                return new UpdateTableModel
                {
                    IsSuccess = false,
                    Message = $"Masa {request.TableNumber} zaten mevcut."
                };
            }
        }

        table.TableNumber = request.TableNumber;
        table.QrCode = request.QrCode;

        var result = await _context.SaveChangesAsync(cancellationToken);

        return new UpdateTableModel
        {
            IsSuccess = true,
            Message = "Masa başarıyla güncellendi."
        };
    }
}
