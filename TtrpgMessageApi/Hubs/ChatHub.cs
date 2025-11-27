using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using TtrpgMessageApi.Data;
using TtrpgMessageApi.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace TtrpgMessageApi.Hubs
{
    public class ChatHub : Hub
    {
        private readonly TtrpgMessageDbContext _context;

        public ChatHub(TtrpgMessageDbContext context)
        {
            _context = context;
        }

        public async Task JoinSession(string sessionId, int playerId)
        {
            var player = await _context.Players
                .Include(p => p.Character)
                .FirstOrDefaultAsync(p => p.Id == playerId);

            if (player != null)
            {
                player.ConnectionId = Context.ConnectionId;
                await _context.SaveChangesAsync();

                // Player joins their own private group
                var playerGroup = $"Player_{playerId}";
                await Groups.AddToGroupAsync(Context.ConnectionId, playerGroup);

                // Load history
                var messages = await _context.Messages
                    .AsNoTracking()
                    .Where(m => m.SessionId == int.Parse(sessionId) && m.PlayerId == playerId)
                    .OrderBy(m => m.Timestamp)
                    .Select(m => new {
                        user = m.SenderName,
                        message = m.Content
                    })
                    .ToListAsync();

                Console.WriteLine($"[JoinSession] Loaded {messages.Count} messages for Session {sessionId}, Player {playerId}.");

                // Send history to caller
                foreach (var msg in messages)
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", msg.user, msg.message);
                }
            }
            else
            {
                Console.WriteLine($"[JoinSession] Player {playerId} not found.");
            }
        }

        // Called by DM to listen to a session
        public async Task RegisterDmConnection(string sessionId)
        {
            // Verify if caller is DM? For now, we assume authenticated DM calls this.
            // In a real app we'd check Context.User
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Session_{sessionId}_DM");
        }

        public async Task SendMessage(string sessionId, string user, string message, int playerId, bool isDm)
        {
            int sId = int.Parse(sessionId);

            var msgEntity = new Message
            {
                Content = message,
                SessionId = sId,
                PlayerId = playerId,
                SenderName = user,
                IsFromDm = isDm,
                Timestamp = DateTime.UtcNow
            };

            _context.Messages.Add(msgEntity);
            try
            {
                await _context.SaveChangesAsync();
                Console.WriteLine($"[SendMessage] Saved message ID {msgEntity.Id} to DB.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SendMessage] Error saving to DB: {ex.Message}");
                // Log the full exception for server-side debugging
                Console.WriteLine(ex);
                throw new HubException("Failed to save message to database.");
            }

            // Routing Logic
            string playerGroup = $"Player_{playerId}";
            string dmGroup = $"Session_{sessionId}_DM";

            if (isDm)
            {
                // DM sending to Player
                // Send to Player
                await Clients.Group(playerGroup).SendAsync("ReceiveMessage", user, message);
                // Send back to DM (caller) or all DMs for this session
                await Clients.Group(dmGroup).SendAsync("ReceiveMessage", user, message);
            }
            else
            {
                // Player sending to DM
                // Send to DM group
                await Clients.Group(dmGroup).SendAsync("ReceiveMessage", user, message);
                // Send back to Player (caller)
                await Clients.Caller.SendAsync("ReceiveMessage", user, message);
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
