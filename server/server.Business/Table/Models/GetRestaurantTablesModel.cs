namespace server.Business.Table.Models;

public class GetRestaurantTablesModel
{
    public int TableID { get; set; }
    public int TableNumber { get; set; }
    public string QrCode { get; set; } = string.Empty;
    public bool IsOccupied { get; set; }
    public int? ActiveOrderId { get; set; }
    public decimal? ActiveOrderTotalPrice { get; set; }
}
