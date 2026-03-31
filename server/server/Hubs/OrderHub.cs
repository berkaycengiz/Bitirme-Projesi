using Microsoft.AspNetCore.SignalR;

namespace server.Api.Hubs;

public class OrderHub : Hub
{
    // Bir istemci (örneğin mutfak tableti) bağlandığında onu "Kitchen" grubuna dahil edebiliriz.
    // Böylece her mesaj tüm dünyaya değil, sadece ilgili birimlere gider.
    public async Task JoinKitchenGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "KitchenGroup");
    }

    // İhtiyaç duyarsan bağlantı koptuğunda yapılacak işlemleri de buraya yazabilirsin.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Loglama vs. yapılabilir
        await base.OnDisconnectedAsync(exception);
    }
}