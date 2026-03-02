using server.Data; // ServiceRegistration'ýn olduðu namespace
using server.Business;

var builder = WebApplication.CreateBuilder(args);

// 1. Data katmanýndaki servisleri buraya kaydediyoruz
// Bu satýr appsettings.json'daki baðlantý cümlesini okur ve Context'i ayaða kaldýrýr
builder.Services.AddPersistence(builder.Configuration); // Data katmaný kayýtlarý
builder.Services.AddBusinessServices();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();