using MediatR;
using server.Business.Order.Models;
using System.Collections.Generic;

namespace server.Business.Order.Requests;

public class PayItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class PayOrderItemsRequest : IRequest<PayOrderItemsModel>
{
    public int TableNumber { get; set; }
    public List<PayItemDto> Items { get; set; } = new();
}
