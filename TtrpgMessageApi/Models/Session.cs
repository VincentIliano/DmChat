namespace TtrpgMessageApi.Models;

public class Session
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int DMId { get; set; }
    public DM DM { get; set; }
    public ICollection<Player> Players { get; set; }
}