using MediatR;
using Microsoft.AspNetCore.Mvc;
using server.Business.Product.Requests;

namespace server.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? categoryId)
        {
            var response = await _mediator.Send(new GetAllProductsRequest { CategoryID = categoryId });
            return Ok(response);
        }
    }
}