using Microsoft.EntityFrameworkCore;
using SuplementosAPI.Models;

namespace SuplementosAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<DetalleVenta> DetallesVenta => Set<DetalleVenta>();
    public DbSet<Socio> Socios => Set<Socio>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("Productos");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(120);
            entity.Property(p => p.Categoria).IsRequired().HasMaxLength(60);
            entity.Property(p => p.Descripcion).HasMaxLength(500);
            entity.Property(p => p.Precio).HasPrecision(18, 2);
            entity.Property(p => p.Presentacion).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(p => p.Nombre);
            entity.HasIndex(p => p.Categoria);
        });

        modelBuilder.Entity<Venta>(entity =>
        {
            entity.ToTable("Ventas");
            entity.HasKey(v => v.Id);
            entity.Property(v => v.Cliente).IsRequired().HasMaxLength(120);
            entity.Property(v => v.MetodoPago).HasConversion<string>().HasMaxLength(20);
            entity.Property(v => v.Notas).HasMaxLength(300);
            entity.Property(v => v.Total).HasPrecision(18, 2);
            entity.HasIndex(v => v.Fecha);
            entity.HasIndex(v => v.Cliente);
            entity.HasMany(v => v.Detalles)
                  .WithOne(d => d.Venta)
                  .HasForeignKey(d => d.VentaId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DetalleVenta>(entity =>
        {
            entity.ToTable("DetallesVenta");
            entity.HasKey(d => d.Id);
            entity.Property(d => d.PrecioUnitario).HasPrecision(18, 2);
            entity.Property(d => d.Subtotal).HasPrecision(18, 2);
            entity.HasOne(d => d.Producto)
                  .WithMany()
                  .HasForeignKey(d => d.ProductoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Socio>(entity =>
        {
            entity.ToTable("Socios");
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Nombre).IsRequired().HasMaxLength(120);
            entity.Property(s => s.Documento).IsRequired().HasMaxLength(30);
            entity.Property(s => s.Telefono).HasMaxLength(30);
            entity.Property(s => s.Email).HasMaxLength(120);
            entity.Property(s => s.Plan).HasConversion<string>().HasMaxLength(20);
            entity.Property(s => s.Notas).HasMaxLength(300);
            entity.HasIndex(s => s.Documento).IsUnique();
            entity.HasIndex(s => s.Nombre);
            entity.HasIndex(s => s.FechaVencimiento);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("Usuarios");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Nombre).IsRequired().HasMaxLength(120);
            entity.Property(u => u.NombreUsuario).IsRequired().HasMaxLength(60);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(120);
            entity.Property(u => u.Rol).HasConversion<string>().HasMaxLength(20);
            entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(200);
            entity.HasIndex(u => u.NombreUsuario).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
        });
    }
}
