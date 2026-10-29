using System.ComponentModel.DataAnnotations;

namespace SuplementosAPI.Models;

public enum MetodoPago
{
    Efectivo,
    Tarjeta,
    Transferencia
}

public class Venta
{
    public int Id { get; set; }

    [Required(ErrorMessage = "El cliente es obligatorio")]
    [StringLength(120)]
    public string Cliente { get; set; } = string.Empty;

    public MetodoPago MetodoPago { get; set; } = MetodoPago.Efectivo;

    [StringLength(300)]
    public string? Notas { get; set; }

    public decimal Total { get; set; }

    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public List<DetalleVenta> Detalles { get; set; } = new();
}

public class DetalleVenta
{
    public int Id { get; set; }

    public int VentaId { get; set; }

    public Venta? Venta { get; set; }

    public int ProductoId { get; set; }

    public Producto? Producto { get; set; }

    [Range(1, 10_000, ErrorMessage = "La cantidad debe ser al menos 1")]
    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }
}
