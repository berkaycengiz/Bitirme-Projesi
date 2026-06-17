namespace server.Data.EF;

public class RestaurantTable
{
    public int TableID { get; set; }
    public int TableNumber { get; set; }      // Masa numarası (1, 2, 3...)
    public string QrCode { get; set; } = string.Empty; // QR içeriği (örn. URL: /menu?table=3)
    public bool IsOccupied { get; set; }      // Masada müşteri var mı?

    // Navigation property
    public List<Order> Orders { get; set; } = new();
}
