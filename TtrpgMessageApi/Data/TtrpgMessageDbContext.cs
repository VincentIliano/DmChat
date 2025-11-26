using Microsoft.EntityFrameworkCore;
using TtrpgMessageApi.Models;

namespace TtrpgMessageApi.Data
{
    public class TtrpgMessageDbContext : DbContext
    {
        public TtrpgMessageDbContext(DbContextOptions<TtrpgMessageDbContext> options) : base(options)
        {
        }

        public DbSet<DM> DMs { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Character> Characters { get; set; }
        public DbSet<Message> Messages { get; set; }
    }
}