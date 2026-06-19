namespace server.Business.Table.Models;

public class CreateTableModel
{
    public int TableID { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
}
