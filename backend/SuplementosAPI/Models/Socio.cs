using System.ComponentModel.DataAnnotations;

namespace SuplementosAPI.Models;

public enum PlanMembresia
{
    Mensual,
    Trimestral,
    Anual
}

public static class PlanMembresiaExtensiones
{
    public static int Dias(this PlanMembresia plan) => plan switch
    {
        PlanMembresia.Mensual => 30,
        PlanMembresia.Trimestral => 90,
        PlanMembresia.Anual => 365,
        _ => 30
    };
}

public class Socio
{
    public int Id { get; set; }

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El documento es obligatorio")]
    [StringLength(30)]
    public string Documento { get; set; } = string.Empty;

    [StringLength(30)]
    public string? Telefono { get; set; }

    [EmailAddress(ErrorMessage = "El correo no es válido")]
    [StringLength(120)]
    public string? Email { get; set; }

    public PlanMembresia Plan { get; set; } = PlanMembresia.Mensual;

    public DateTime FechaInicio { get; set; } = DateTime.UtcNow.Date;

    public DateTime FechaVencimiento { get; set; } = DateTime.UtcNow.Date.AddDays(30);

    public bool Activo { get; set; } = true;

    [StringLength(300)]
    public string? Notas { get; set; }

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime? FechaActualizacion { get; set; }
}
