using Microsoft.EntityFrameworkCore;

public class ApiDbContext : DbContext
{
    public DbSet<User> User { get; set; }
    public DbSet<Instrument> Instrument { get; set; }
    public DbSet<ShoppingCart> ShoppingCart { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 35));

        optionsBuilder.UseMySql("server=localhost;user=209_Shkurkin_Manager;password=M9aR3@L;database=music_store", serverVersion);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ShoppingCart>()
        .HasKey(cart => cart.Id);

        modelBuilder.Entity<ShoppingCart>()
        .HasOne(cart => cart.User)
        .WithMany(user => user.ShoppingCart)
        .HasForeignKey(cart => cart.UserId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ShoppingCart>()
        .HasOne(cart => cart.Instrument)
        .WithMany(instrument => instrument.ShoppingCart)
        .HasForeignKey(cart => cart.InstrumentId)
        .OnDelete(DeleteBehavior.Restrict);
    }
}