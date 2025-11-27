namespace TtrpgMessageApi.Models;

public class Message
{
    public int Id { get; set; }
    public string Content { get; set; }
    public bool IsFromDm { get; set; }
    public string SenderName { get; set; }
    public int PlayerId { get; set; } // The conversation thread (Player-DM)
    public Player Player { get; set; }
    public int SessionId { get; set; }
    public Session Session { get; set; }
    public DateTime Timestamp { get; set; }
}
