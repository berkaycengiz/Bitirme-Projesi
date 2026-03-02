using MediatR;
using server.Business.Order.Models;

namespace server.Business.Order.Requests;

public class CreateOrderRequest : IRequest<CreateOrderModel>
{
    public int TableNumber { get; set; }
    public List<OrderDetailItem> Items { get; set; }
}

public class OrderDetailItem
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; } // Kullanıcının girdiği not
}