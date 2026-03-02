using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using server.Data.Context;

public static class ServiceRegistration
{
    public static void AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        // appsettings.json'dan bağlantı cümlesini okuyoruz
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<RestaurantContext>(options =>
            options.UseSqlServer(connectionString));

        // Eğer Interface kullanacaksan (IRestaurantContext gibi) buraya ekleyebilirsin:
        // services.AddScoped<IRestaurantContext>(sp => sp.GetRequiredService<RestaurantContext>());
    }
}