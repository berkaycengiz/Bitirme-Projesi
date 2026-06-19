using MediatR;
using server.Business.Table.Models;

namespace server.Business.Table.Requests;

public class UpdateTableRequest : IRequest<UpdateTableModel>
{
    public int TableID { get; set; }
    public int TableNumber { get; set; }
    public string QrCode { get; set; } = string.Empty;
}
