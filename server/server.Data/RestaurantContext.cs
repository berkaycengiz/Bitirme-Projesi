using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.EF; // Product, Category gibi sınıfların olduğu klasör

namespace server.Data.Context
{
    public class RestaurantContext : DbContext
    {
        public RestaurantContext(DbContextOptions<RestaurantContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        // Diğer tabloları (Table, OrderDetail vb.) buraya ekleyebilirsin
    }
}