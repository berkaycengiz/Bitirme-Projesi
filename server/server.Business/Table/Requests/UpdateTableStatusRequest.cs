using MediatR;
using server.Business.Table.Models;

namespace server.Business.Table.Requests;

public class UpdateTableStatusRequest : IRequest<UpdateTableStatusModel>
{
    public int TableNumber { get; set; }
    public bool IsOccupied { get; set; }
}
