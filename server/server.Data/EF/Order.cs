using server.Data.Enums;

namespace server.Data.EF;

public class Order
{
    public int OrderID { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalPrice { get; set; }
    public OrderStatus Status { get; set; }

    // FK: Hangi masanın siparişi
    public int TableID { get; set; }
    public RestaurantTable Table { get; set; } = null!;

    public List<OrderDetail> OrderDetails { get; set; } = new();
}