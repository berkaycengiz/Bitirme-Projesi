using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using server.Business.User.Requests;

namespace server.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class UserController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UserController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllUsersRequest());
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RegisterUserRequest request)
        {
            var result = await _mediator.Send(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Message);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Message);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _mediator.Send(new DeleteUserRequest { Id = id });
            return result.IsSuccess ? Ok(result) : BadRequest(result.Message);
        }
    }
}
