namespace server.Business.Order.Models;

public class CreateOrderModel
{
    public bool IsSuccess { get; set; }
    public int OrderId { get; set; }
    public string Message { get; set; }
}