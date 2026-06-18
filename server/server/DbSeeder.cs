using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using server.Data.Context;
using server.Data.EF;
using server.Data.Enums;
using System.Collections.Generic;
using System.Linq;

namespace server.Api
{
    public static class DbSeeder
    {
        public static void Seed(RestaurantContext context)
        {
            // 1. Seed Users
            if (!context.Users.Any())
            {
                var users = new List<AppUser>
                {
                    new AppUser
                    {
                        Username = "admin",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                        Role = UserRole.Admin
                    },
                    new AppUser
                    {
                        Username = "waiter",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("waiter123"),
                        Role = UserRole.Waiter
                    },
                    new AppUser
                    {
                        Username = "chef",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("chef123"),
                        Role = UserRole.Kitchen
                    }
                };

                context.Users.AddRange(users);
                context.SaveChanges();
            }

            // 2. Seed Categories & Products
            if (!context.Categories.Any())
            {
                var anaYemekler = new Category
                {
                    CategoryName = "Ana Yemekler",
                    Description = "Nefis ve doyurucu ana yemeklerimiz."
                };

                var tatlilar = new Category
                {
                    CategoryName = "Tatlılar",
                    Description = "Yemeğin üstüne enfes tatlı alternatifleri."
                };

                var icecekler = new Category
                {
                    CategoryName = "İçecekler",
                    Description = "Sıcak ve soğuk ferahlatıcı içecekler."
                };

                context.Categories.AddRange(anaYemekler, tatlilar, icecekler);
                context.SaveChanges();

                if (!context.Products.Any())
                {
                    var products = new List<Product>
                    {
                        new Product
                        {
                            ProductName = "Özel Soslu Makarna",
                            Description = "Fesleğen, krema ve parmesan peyniri ile harmanlanmış enfes lezzet.",
                            Price = 240,
                            ImageUrl = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=500&auto=format&fit=crop&q=60",
                            IsAvailable = true,
                            CategoryID = anaYemekler.CategoryID
                        },
                        new Product
                        {
                            ProductName = "Klasik Burger Menü",
                            Description = "150g ev yapımı dana köfte, patates kızartması ve içecek.",
                            Price = 320,
                            ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
                            IsAvailable = true,
                            CategoryID = anaYemekler.CategoryID
                        },
                        new Product
                        {
                            ProductName = "Margherita Pizza",
                            Description = "İtalyan usulü ince hamur, taze mozzarella.",
                            Price = 280,
                            ImageUrl = "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&auto=format&fit=crop&q=60",
                            IsAvailable = true,
                            CategoryID = anaYemekler.CategoryID
                        },
                        new Product
                        {
                            ProductName = "Sezar Salata",
                            Description = "Özel sezar sosu, ızgara tavuk ve kıtır kruton ekmekleri.",
                            Price = 180,
                            ImageUrl = "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop&q=60",
                            IsAvailable = true,
                            CategoryID = anaYemekler.CategoryID
                        },
                        new Product
                        {
                            ProductName = "Çikolatalı Sufle",
                            Description = "Akışkan sıcak çikolata ve yanında vanilyalı top dondurma.",
                            Price = 150,
                            ImageUrl = "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60",
                            IsAvailable = true,
                            CategoryID = tatlilar.CategoryID
                        },
                        new Product
                        {
                            ProductName = "Buzlu Latte",
                            Description = "Taze kavrulmuş espresso çekirdekleri ve soğuk süt.",
                            Price = 90,
                            ImageUrl = "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60",
                            IsAvailable = true,
                            CategoryID = icecekler.CategoryID
                        }
                    };

                    context.Products.AddRange(products);
                    context.SaveChanges();
                }
            }

            // 3. Seed Tables
            if (!context.RestaurantTables.Any())
            {
                var tables = new List<RestaurantTable>();

                // Masalar (1 to 7)
                for (int i = 1; i <= 7; i++)
                {
                    tables.Add(new RestaurantTable
                    {
                        TableNumber = i,
                        QrCode = $"http://localhost:5173/?table={i}",
                        IsOccupied = false
                    });
                }

                // Bahçe Masaları (8 and 9)
                tables.Add(new RestaurantTable
                {
                    TableNumber = 8,
                    QrCode = "http://localhost:5173/?table=8",
                    IsOccupied = false
                });

                tables.Add(new RestaurantTable
                {
                    TableNumber = 9,
                    QrCode = "http://localhost:5173/?table=9",
                    IsOccupied = false
                });

                context.RestaurantTables.AddRange(tables);
                context.SaveChanges();
            }
        }
    }
}
