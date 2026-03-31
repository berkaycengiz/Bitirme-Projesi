namespace server.Data.Enums;

public enum OrderStatus
{
    Pending = 0,    // Sipariş alındı, onay bekliyor
    Preparing = 1,  // Mutfakta hazırlanıyor
    Ready = 2,      // Hazırlandı, servise çıktı/bekliyor
    Completed = 3,  // Müşteriye teslim edildi
    Cancelled = 4   // İptal edildi
}