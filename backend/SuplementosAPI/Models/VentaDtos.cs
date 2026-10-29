using System.ComponentModel.DataAnnotations;

namespace SuplementosAPI.Models;

public class DetalleVentaDto
{
    [Range(1, int.MaxValue, ErrorMessage = "El producto es obligatorio")]
    public int ProductoId { get; set; }

    [Range(1, 10_000, ErrorMessage = "La cantidad debe estar entre 1 y 10,000")]
    public int Cantidad { get; set; }
}

public class VentaDto
{
    [Required(ErrorMessage = "El cliente es obligatorio")]
    [StringLength(120)]
    public string Cliente { get; set; } = string.Empty;

    public MetodoPago MetodoPago { get; set; } = MetodoPago.Efectivo;

    [StringLength(300)]
    public string? Notas { get; set; }

    [Required(ErrorMessage = "La venta debe tener al menos un producto")]
    public List<DetalleVentaDto> Detalles { get; set; } = new();
}

public class DetalleVentaSalidaDto
{
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class VentaSalidaDto
{
    public int Id { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public MetodoPago MetodoPago { get; set; }
    public string? Notas { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Total { get; set; }
    public List<DetalleVentaSalidaDto> Detalles { get; set; } = new();
}
