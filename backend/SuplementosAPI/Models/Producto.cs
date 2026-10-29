using System.ComponentModel.DataAnnotations;

namespace SuplementosAPI.Models;

public enum Presentacion
{
    Capsula,
    Tableta,
    Polvo,
    Liquido,
    Barrita,
    Gomitas,
    Otro
}

public class Producto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es obligatoria")]
    [StringLength(60)]
    public string Categoria { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    [Range(0, 1_000_000, ErrorMessage = "El precio debe estar entre 0 y 1,000,000")]
    public decimal Precio { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo")]
    public int Stock { get; set; }

    public Presentacion Presentacion { get; set; } = Presentacion.Capsula;

    public bool Activo { get; set; } = true;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime? FechaActualizacion { get; set; }
}
