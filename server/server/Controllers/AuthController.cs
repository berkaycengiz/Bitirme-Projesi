using MediatR;
using Microsoft.AspNetCore.Mvc;
using server.Business.Auth.Requests;

namespace server.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(request);
        
        if (result.IsSuccess)
            return Ok(result);
            
        return BadRequest(result);
    }
}
