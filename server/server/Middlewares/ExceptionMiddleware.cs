using System.Net;
using System.Text.Json;
using FluentValidation;

namespace server.Api.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sunucuda beklenmeyen bir hata oluştu.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var responseCode = HttpStatusCode.InternalServerError;
        object responseBody;

        if (exception is ValidationException validationException)
        {
            responseCode = HttpStatusCode.BadRequest;
            responseBody = new
            {
                IsSuccess = false,
                Message = "Doğrulama hatası oluştu.",
                Errors = validationException.Errors.Select(e => new
                {
                    Field = e.PropertyName,
                    Message = e.ErrorMessage
                })
            };
        }
        else
        {
            responseBody = new
            {
                IsSuccess = false,
                Message = exception.Message // Geliştirme ortamı için detaylı mesaj
            };
        }

        context.Response.StatusCode = (int)responseCode;

        var json = JsonSerializer.Serialize(responseBody);
        return context.Response.WriteAsync(json);
    }
}
