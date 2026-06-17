using MediatR;
using Microsoft.AspNetCore.Mvc;
using server.Business.Table.Requests;

namespace server.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TableController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TableController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetRestaurantTablesRequest());
            return Ok(result);
        }

        [HttpPatch("{tableNumber}/status")]
        public async Task<IActionResult> UpdateStatus(int tableNumber, [FromBody] bool isOccupied)
        {
            var result = await _mediator.Send(new UpdateTableStatusRequest 
            { 
                TableNumber = tableNumber, 
                IsOccupied = isOccupied 
            });

            return result.IsSuccess ? Ok(result) : BadRequest(result.Message);
        }

        [HttpPost("{tableNumber}/service-request")]
        public async Task<IActionResult> SendRequest(int tableNumber, [FromBody] string requestType)
        {
            var result = await _mediator.Send(new SendServiceRequest 
            { 
                TableNumber = tableNumber, 
                RequestType = requestType 
            });

            return result.IsSuccess ? Ok(result) : BadRequest(result.Message);
        }
    }
}
