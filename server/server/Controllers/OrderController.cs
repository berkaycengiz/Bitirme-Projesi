using MediatR;
using Microsoft.AspNetCore.Mvc;
using server.Business.Order.Requests; // Senin kurduğun klasör yapısına göre

namespace server.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OrderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            // MediatR, CreateOrderRequest'i görür görmez 
            // arkadaki CreateOrderHandler'ı bulup çalıştıracak.
            var result = await _mediator.Send(request);

            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
    }
}