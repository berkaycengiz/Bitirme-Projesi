namespace server.Business.Product.Models;

public class GetAllProductsModel
{
    public int ProductID { get; set; }
    public string ProductName { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string ImageUrl { get; set; }
    public string CategoryName { get; set; } // Kategori adını join ile çekeceğiz
}