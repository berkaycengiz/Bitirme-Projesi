using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace server.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;

        public UploadController(IConfiguration configuration)
        {
            var cloudName = configuration["Cloudinary:CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"];

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { isSuccess = false, message = "Lütfen geçerli bir dosya seçin." });
            }

            if (!file.ContentType.StartsWith("image/"))
            {
                return BadRequest(new { isSuccess = false, message = "Sadece resim yükleyebilirsiniz." });
            }

            try
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "restaurant_products"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                {
                    return BadRequest(new { isSuccess = false, message = uploadResult.Error.Message });
                }

                return Ok(new { isSuccess = true, url = uploadResult.SecureUrl.ToString() });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = $"Yükleme sırasında hata oluştu: {ex.Message}" });
            }
        }
    }
}
