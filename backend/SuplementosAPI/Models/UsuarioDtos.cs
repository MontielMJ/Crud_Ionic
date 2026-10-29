using System.ComponentModel.DataAnnotations;

namespace SuplementosAPI.Models;

public class UsuarioCrearDto
{
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

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [StringLength(100)]
    public string Password { get; set; } = string.Empty;
}

public class UsuarioActualizarDto
{
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

    /// <summary>Si viene vacío se conserva la contraseña actual.</summary>
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [StringLength(100)]
    public string? Password { get; set; }
}

public class UsuarioSalidaDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
}
