namespace server.Business.Order.Models;

public class UpdateOrderStatusModel
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
    public string UpdatedStatus { get; set; } = string.Empty;
    public int OrderId { get; set; }
}