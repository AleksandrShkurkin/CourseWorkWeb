public class ShoppingCart
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int InstrumentId { get; set; }

    public int Quantity { get; set; }

    public User User { get; set; }

    public Instrument Instrument { get; set; }
}