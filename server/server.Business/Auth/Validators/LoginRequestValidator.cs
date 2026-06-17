using FluentValidation;
using server.Business.Auth.Requests;

namespace server.Business.Auth.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Kullanıcı adı boş olamaz.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre boş olamaz.");
    }
}
