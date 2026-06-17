using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using FluentValidation;
using MediatR;
using server.Business.Behaviors;

namespace server.Business;

public static class ServiceRegistration
{
    public static void AddBusinessServices(this IServiceCollection services)
    {
        // MediatR kütüphanesine bu katmandaki (Assembly) tüm 
        // Request, Model ve Handler yapılarını otomatik tarayıp kaydetmesini söylüyoruz.
        services.AddMediatR(cfg => 
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        // Tüm FluentValidation validator'larını kaydet
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
    }
}