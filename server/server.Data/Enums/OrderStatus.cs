namespace server.Data.Enums;

public enum OrderStatus
{
    Pending = 0,    // Sipariş alındı, onay bekliyor
    Preparing = 1,  // Mutfakta hazırlanıyor
    Ready = 2,      // Hazırlandı, servise çıktı/bekliyor
    Completed = 3,  // Tamamlandı (Ödemesi alındı)
    Cancelled = 4,  // İptal edildi
    Served = 5      // Servis edildi (Masaya teslim edildi ama henüz ödenmedi)
}