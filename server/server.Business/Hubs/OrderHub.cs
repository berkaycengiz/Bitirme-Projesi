using Microsoft.AspNetCore.SignalR;

namespace server.Business.Hubs;

public class OrderHub : Hub
{
    // Bir istemci (örneğin mutfak tableti) bağlandığında onu "Kitchen" grubuna dahil edebiliriz.
    // Böylece her mesaj tüm dünyaya değil, sadece ilgili birimlere gider.
    public async Task JoinKitchenGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "KitchenGroup");
    }

    // Garsonların bağlandığında "WaiterGroup" grubuna dahil olması için
    public async Task JoinWaiterGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "WaiterGroup");
    }

    // Garson çağırma veya hesap taleplerini garson grubuna iletmek için
    public async Task SendServiceRequest(int tableNumber, string requestType)
    {
        // Alıcı: Garson grubu. Olay: ReceiveServiceRequest.
        await Clients.Group("WaiterGroup").SendAsync("ReceiveServiceRequest", new
        {
            TableNumber = tableNumber,
            RequestType = requestType, // "CallWaiter" veya "RequestBill"
            RequestTime = DateTime.Now.ToString("HH:mm:ss")
        });
    }

    // İhtiyaç duyarsan bağlantı koptuğunda yapılacak işlemleri de buraya yazabilirsin.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Loglama vs. yapılabilir
        await base.OnDisconnectedAsync(exception);
    }
}