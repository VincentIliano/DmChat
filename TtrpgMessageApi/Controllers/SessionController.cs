using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TtrpgMessageApi.Data;
using TtrpgMessageApi.Models;

namespace TtrpgMessageApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionController : ControllerBase
    {
        private readonly TtrpgMessageDbContext _context;

        public SessionController(TtrpgMessageDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateSession([FromBody] string sessionName)
        {
            try
            {
                var dmId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
                var session = new Session
                {
                    Name = sessionName,
                    DMId = dmId
                };

                _context.Sessions.Add(session);
                await _context.SaveChangesAsync();

                return Ok(new { sessionId = session.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinSession([FromBody] JoinSessionRequest request)
        {
            try
            {
                var session = await _context.Sessions.FindAsync(request.SessionId);
                if (session == null)
                {
                    return NotFound("Session not found");
                }

                // Check if a player with this character name already exists in this session
                var existingPlayer = await _context.Players
                    .Include(p => p.Character)
                    .FirstOrDefaultAsync(p => p.SessionId == request.SessionId && p.Character.Name == request.CharacterName);

                if (existingPlayer != null)
                {
                    // Check password
                    if (existingPlayer.Password != request.Password)
                    {
                        return Unauthorized("Invalid password for this character.");
                    }

                    return Ok(new { playerId = existingPlayer.Id, characterId = existingPlayer.Character.Id });
                }

                var player = new Player
                {
                    ConnectionId = "", // This will be updated by SignalR
                    SessionId = request.SessionId,
                    Password = request.Password
                };

                _context.Players.Add(player);
                // Transactional Save
                // Ideally we'd use a transaction scope, but adding to context and saving once is atomic enough for EF Core
                // IF we set up the relationships correctly.
                // However, Character needs PlayerId.
                // EF Core can handle this if we add to the Player's collection or set the navigation property.

                var character = new Character
                {
                    Name = request.CharacterName,
                    Player = player // Link via navigation property
                };

                _context.Characters.Add(character);

                // Single SaveChanges validates the entire graph
                await _context.SaveChangesAsync();

                return Ok(new { playerId = player.Id, characterId = character.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetSessions()
        {
            try
            {
                var dmId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
                var sessions = await _context.Sessions
                    .Where(s => s.DMId == dmId)
                    .ToListAsync();

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize]
        [HttpGet("{sessionId}/players")]
        public async Task<IActionResult> GetPlayers(int sessionId)
        {
            try
            {
                var dmId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
                var session = await _context.Sessions.FindAsync(sessionId);

                if (session == null)
                {
                    return NotFound("Session not found");
                }

                if (session.DMId != dmId)
                {
                    return Unauthorized("You are not the DM for this session");
                }

                var players = await _context.Players
                    .Where(p => p.SessionId == sessionId)
                    .Include(p => p.Character)
                    .Select(p => new
                    {
                        id = p.Id,
                        characterName = p.Character.Name
                    })
                    .ToListAsync();

                return Ok(players);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class JoinSessionRequest
    {
        public int SessionId { get; set; }
        public string CharacterName { get; set; }
        public string Password { get; set; }
    }
}
