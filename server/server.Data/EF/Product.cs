using server.Data.EF; // OrderDetail'in olduğu namespace

namespace server.Data.EF;

public class Product
{
    public int ProductID { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }

    // Kategori ile olan ilişkisi (Zaten sende vardı)
    public int CategoryID { get; set; }
    public Category Category { get; set; } = null!;

    // YENİ EKLEYECEĞİN KISIM:
    // Bu ürünün hangi sipariş detaylarında geçtiğini tutan liste
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}