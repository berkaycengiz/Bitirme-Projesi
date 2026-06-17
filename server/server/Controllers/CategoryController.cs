using MediatR;
using Microsoft.AspNetCore.Mvc;
using server.Business.Category.Requests;

namespace server.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CategoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllCategoriesRequest());
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
        {
            var result = await _mediator.Send(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Message);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryRequest request)
        {
            request.CategoryID = id;
            var result = await _mediator.Send(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result.Message);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _mediator.Send(new DeleteCategoryRequest { CategoryID = id });
            return result.IsSuccess ? Ok(result) : BadRequest(result.Message);
        }
    }
}
