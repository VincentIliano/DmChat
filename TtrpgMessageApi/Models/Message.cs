namespace TtrpgMessageApi.Models;

public class Message
{
    public int Id { get; set; }
    public string Content { get; set; }
    public int SenderId { get; set; } // Can be PlayerId or DMId
    public int SessionId { get; set; }
    public Session Session { get; set; }
    public DateTime Timestamp { get; set; }
}