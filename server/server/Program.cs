using server.Data;
using server.Business;
using server.Business.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Servis Kayıtları (Dependency Injection) ---
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddBusinessServices();

// 2. SignalR Servisini Sisteme Tanıt
builder.Services.AddSignalR();

// 3. CORS Politikası
builder.Services.AddCors(options => {
    options.AddPolicy("CorsPolicy", policy => {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed((host) => true)
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---- JWT CONFIGURATION ----
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecurityKey"]!))
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<server.Api.Middlewares.ExceptionMiddleware>();

// --- Middleware Yapılandırması ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseHttpsRedirection();

// 4. Authentication zorunludur
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 5. Hub Endpoint'ini Map'le
app.MapHub<OrderHub>("/orderHub");

app.Run();
