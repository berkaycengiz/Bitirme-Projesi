using FluentValidation;
using server.Business.Product.Requests;

namespace server.Business.Product.Validators;

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.ProductID)
            .GreaterThan(0).WithMessage("Geçersiz ürün ID'si.");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Ürün adı boş olamaz.")
            .MaximumLength(100).WithMessage("Ürün adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Fiyat 0'dan büyük olmalıdır.");

        RuleFor(x => x.CategoryID)
            .GreaterThan(0).WithMessage("Geçerli bir kategori seçilmelidir.");
    }
}
