namespace TtrpgMessageApi.Models;

public class Player
{
    public int Id { get; set; }
    public string ConnectionId { get; set; }
    public int SessionId { get; set; }
    public Session Session { get; set; }
    public Character Character { get; set; }
    public string Password { get; set; }
}