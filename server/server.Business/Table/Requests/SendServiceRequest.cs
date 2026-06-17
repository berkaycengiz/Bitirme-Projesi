using MediatR;
using server.Business.Table.Models;

namespace server.Business.Table.Requests;

public class SendServiceRequest : IRequest<SendServiceRequestModel>
{
    public int TableNumber { get; set; }
    public string RequestType { get; set; } = string.Empty; // "CallWaiter" veya "RequestBill"
}
