using MediatR;
using server.Business.Table.Models;
using server.Business.Table.Requests;
using server.Data.Context;

namespace server.Business.Table.Handlers;

public class DeleteTableHandler : IRequestHandler<DeleteTableRequest, DeleteTableModel>
{
    private readonly RestaurantContext _context;

    public DeleteTableHandler(RestaurantContext context)
    {
        _context = context;
    }

    public async Task<DeleteTableModel> Handle(DeleteTableRequest request, CancellationToken cancellationToken)
    {
        var table = await _context.RestaurantTables.FindAsync(new object[] { request.TableID }, cancellationToken);
        if (table == null)
        {
            return new DeleteTableModel
            {
                IsSuccess = false,
                Message = "Masa bulunamadı."
            };
        }

        _context.RestaurantTables.Remove(table);
        var result = await _context.SaveChangesAsync(cancellationToken);

        return new DeleteTableModel
        {
            IsSuccess = result > 0,
            Message = result > 0 ? "Masa başarıyla silindi." : "Masa silinirken bir hata oluştu."
        };
    }
}
