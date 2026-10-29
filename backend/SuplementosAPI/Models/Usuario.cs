using System.ComponentModel.DataAnnotations;

namespace SuplementosAPI.Models;

public enum RolUsuario
{
    Administrador,
    Recepcionista,
    Entrenador
}

public class Usuario
{
    public int Id { get; set; }

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El usuario es obligatorio")]
    [StringLength(60)]
    public string NombreUsuario { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress(ErrorMessage = "El correo no es válido")]
    [StringLength(120)]
    public string Email { get; set; } = string.Empty;

    public RolUsuario Rol { get; set; } = RolUsuario.Recepcionista;

    public bool Activo { get; set; } = true;

    /// <summary>Hash PBKDF2 generado con PasswordHasher; nunca se expone en la API.</summary>
    [Required]
    [StringLength(200)]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime? FechaActualizacion { get; set; }
}
