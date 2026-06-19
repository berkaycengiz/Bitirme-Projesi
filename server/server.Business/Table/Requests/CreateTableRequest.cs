using MediatR;
using server.Business.Table.Models;

namespace server.Business.Table.Requests;

public class CreateTableRequest : IRequest<CreateTableModel>
{
    public int TableNumber { get; set; }
    public string QrCode { get; set; } = string.Empty;
}
