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

                var player = new Player
                {
                    ConnectionId = "", // This will be updated by SignalR
                    SessionId = request.SessionId
                };

                _context.Players.Add(player);
                await _context.SaveChangesAsync();

                var character = new Character
                {
                    Name = request.CharacterName,
                    PlayerId = player.Id
                };

                _context.Characters.Add(character);
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
    }

    public class JoinSessionRequest
    {
        public int SessionId { get; set; }
        public string CharacterName { get; set; }
    }
}
