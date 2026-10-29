using System.ComponentModel.DataAnnotations;

namespace SuplementosAPI.Models;

public class SocioDto
{
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
}

public class RenovacionDto
{
    public PlanMembresia? Plan { get; set; }
}

public class SocioSalidaDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Documento { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public PlanMembresia Plan { get; set; }
    public string FechaInicio { get; set; } = string.Empty;
    public string FechaVencimiento { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public string? Notas { get; set; }

    /// <summary>Vigente, PorVencer, Vencido o Inactivo.</summary>
    public string Estado { get; set; } = string.Empty;

    /// <summary>Días que faltan para vencer (negativo si ya venció).</summary>
    public int DiasRestantes { get; set; }

    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
}

public class SocioResumenDto
{
    public int Total { get; set; }
    public int Activos { get; set; }
    public int PorVencer { get; set; }
    public int Vencidos { get; set; }
    public int Inactivos { get; set; }
}
