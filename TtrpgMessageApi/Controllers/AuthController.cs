using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using TtrpgMessageApi.Data;
using TtrpgMessageApi.DTOs;
using TtrpgMessageApi.Models;
using TtrpgMessageApi.Services;

namespace TtrpgMessageApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TtrpgMessageDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(TtrpgMessageDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDmDto registerDmDto)
        {
            if (await _context.DMs.AnyAsync(x => x.Username == registerDmDto.Username))
            {
                return BadRequest("Username already exists");
            }

            var dm = new DM
            {
                Username = registerDmDto.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDmDto.Password)
            };

            _context.DMs.Add(dm);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDmDto loginDmDto)
        {
            var dm = await _context.DMs.SingleOrDefaultAsync(x => x.Username == loginDmDto.Username);

            if (dm == null || !BCrypt.Net.BCrypt.Verify(loginDmDto.Password, dm.Password))
            {
                return Unauthorized();
            }

            var token = _tokenService.GenerateToken(dm);

            return Ok(new TokenDto { Token = token });
        }
    }
}
