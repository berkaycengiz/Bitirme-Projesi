namespace server.Data.EF;

public class Order
{
    public int OrderID { get; set; }
    public int TableNumber { get; set; } // QR'dan gelen masa bilgisi
    public DateTime OrderDate { get; set; }
    public decimal TotalPrice { get; set; }
    public string OrderStatus { get; set; } // "Hazırlanıyor", "Tamamlandı" vb.

    public List<OrderDetail> OrderDetails { get; set; }
}