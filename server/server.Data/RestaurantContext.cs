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
        public DbSet<AppUser> Users { get; set; }
        public DbSet<RestaurantTable> RestaurantTables { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // AppUser Role enumunu veritabanında string olarak sakla (Admin, Waiter, Kitchen)
            modelBuilder.Entity<AppUser>()
                .Property(u => u.Role)
                .HasConversion<string>();

            // RestaurantTable primary key (convention dışı isim olduğu için açıkça belirt)
            modelBuilder.Entity<RestaurantTable>()
                .HasKey(t => t.TableID);

            // Her masa numarası benzersiz olmalı
            modelBuilder.Entity<RestaurantTable>()
                .HasIndex(t => t.TableNumber)
                .IsUnique();

            // QR kodu da benzersiz olmalı
            modelBuilder.Entity<RestaurantTable>()
                .HasIndex(t => t.QrCode)
                .IsUnique();

            // Order -> RestaurantTable ilişkisi
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Table)
                .WithMany(t => t.Orders)
                .HasForeignKey(o => o.TableID)
                .OnDelete(DeleteBehavior.Restrict); // Masayı silince siparişleri de silme

            // Fiyatın 0'dan büyük olmasını zorunlu kılan Check Constraint
            modelBuilder.Entity<Product>()
                .ToTable(t => t.HasCheckConstraint("CK_Products_Price", "[Price] > 0"));

            // Miktarın 1 veya daha fazla olmasını zorunlu kılan Check Constraint
            modelBuilder.Entity<OrderDetail>()
                .ToTable(t =>
                {
                    t.HasCheckConstraint("CK_OrderDetails_Quantity", "[Quantity] >= 1");
                    t.HasTrigger("trg_UpdateOrderTotalPrice");
                });
        }
    }
}