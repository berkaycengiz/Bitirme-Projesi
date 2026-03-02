using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace server.Business;

public static class ServiceRegistration
{
    public static void AddBusinessServices(this IServiceCollection services)
    {
        // MediatR kütüphanesine bu katmandaki (Assembly) tüm 
        // Request, Model ve Handler yapılarını otomatik tarayıp kaydetmesini söylüyoruz.
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        // İleride buraya FluentValidation veya AutoMapper gibi 
        // Business katmanına özel diğer servisleri de ekleyebilirsin.
    }
}