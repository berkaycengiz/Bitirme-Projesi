using FluentValidation;
using server.Business.Order.Requests;

namespace server.Business.Order.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.TableNumber)
            .GreaterThan(0).WithMessage("Masa numarası 0'dan büyük olmalıdır.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Sipariş en az bir ürün içermelidir.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId)
                .GreaterThan(0).WithMessage("Geçersiz ürün ID'si.");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Ürün adedi en az 1 olmalıdır.");
        });
    }
}
