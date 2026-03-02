using MediatR;
using server.Business.Product.Models;

namespace server.Business.Product.Requests;

public class GetAllProductsRequest : IRequest<List<GetAllProductsModel>>
{

    public int? CategoryID { get; set; } // Opsiyonel filtreleme için nullable yaptık
    // Şu an için parametreye gerek yok, ileride kategori filtresi eklenebilir.
}