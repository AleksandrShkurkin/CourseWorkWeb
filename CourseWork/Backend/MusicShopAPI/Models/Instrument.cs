public class Instrument
{
    public int Id { get; set; }
    public string InstrumentName { get; set; }
    public string InstrumentBrand { get; set; }
    public float Price { get; set; }
    public string ImagePath { get; set; }

    public ICollection<ShoppingCart> ShoppingCart { get; set; }
}