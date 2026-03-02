public class Product
{
    public int ProductID { get; set; }
    public string ProductName { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string ImageUrl { get; set; }
    public bool IsAvailable { get; set; } // Stokta var mı?

    public int CategoryID { get; set; }
    public Category Category { get; set; }
}