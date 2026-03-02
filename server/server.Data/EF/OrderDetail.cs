namespace server.Data.EF;

public class OrderDetail
{
    public int OrderDetailID { get; set; }
    public int OrderID { get; set; }
    public Order Order { get; set; }

    public int ProductID { get; set; }
    public Product Product { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? ProductNote { get; set; } // Örn: "Turşu olmasın", "Az pişmiş"
}