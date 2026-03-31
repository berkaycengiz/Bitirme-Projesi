using server.Data.Enums;

namespace server.Data.EF;

public class Order
{
    public int OrderID { get; set; }
    public int TableNumber { get; set; } // QR'dan gelen masa bilgisi
    public DateTime OrderDate { get; set; }
    public decimal TotalPrice { get; set; }
    public OrderStatus Status { get; set; }

    public List<OrderDetail> OrderDetails { get; set; }
}