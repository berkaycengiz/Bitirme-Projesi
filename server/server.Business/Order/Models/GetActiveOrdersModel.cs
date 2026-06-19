namespace server.Business.Order.Models;

public class GetActiveOrdersModel
{
    public int OrderId { get; set; }
    public int TableNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string OrderTime { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public List<GetActiveOrderDetailModel> Details { get; set; } = new();
}

public class GetActiveOrderDetailModel
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Note { get; set; }
    public decimal UnitPrice { get; set; }
}
