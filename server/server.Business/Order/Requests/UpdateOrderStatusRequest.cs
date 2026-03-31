using MediatR;
using server.Business.Order.Models;
using server.Data.Enums;

public class UpdateOrderStatusRequest : IRequest<UpdateOrderStatusModel>
{
    public int OrderId { get; set; }
    public OrderStatus NewStatus { get; set; }
}