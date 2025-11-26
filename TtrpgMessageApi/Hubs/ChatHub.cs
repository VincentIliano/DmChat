using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using TtrpgMessageApi.Data;
using Microsoft.EntityFrameworkCore;
using System;

namespace TtrpgMessageApi.Hubs
{
    public class ChatHub : Hub
    {
        private readonly TtrpgMessageDbContext _context;

        public ChatHub(TtrpgMessageDbContext context)
        {
            _context = context;
        }

        public async Task SendMessage(string sessionId, string user, string message)
        {
            await Clients.Group(sessionId).SendAsync("ReceiveMessage", user, message);
        }

        public async Task JoinSession(string sessionId, int playerId)
        {
            var player = await _context.Players.FindAsync(playerId);
            if (player != null)
            {
                player.ConnectionId = Context.ConnectionId;
                await _context.SaveChangesAsync();
                await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var player = await _context.Players.SingleOrDefaultAsync(p => p.ConnectionId == Context.ConnectionId);
            if (player != null)
            {
                player.ConnectionId = "";
                await _context.SaveChangesAsync();
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
