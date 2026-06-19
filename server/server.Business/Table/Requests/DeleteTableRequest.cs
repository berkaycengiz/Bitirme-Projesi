using MediatR;
using server.Business.Table.Models;

namespace server.Business.Table.Requests;

public class DeleteTableRequest : IRequest<DeleteTableModel>
{
    public int TableID { get; set; }
}
