using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuplementosAPI.Data;
using SuplementosAPI.Models;

namespace SuplementosAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<Usuario> _hasher;

    public UsuariosController(AppDbContext context, IPasswordHasher<Usuario> hasher)
    {
        _context = context;
        _hasher = hasher;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioSalidaDto>>> Get(
        [FromQuery] string? buscar,
        [FromQuery] string? rol)
    {
        IQueryable<Usuario> query = _context.Usuarios.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            string term = buscar.Trim();
            query = query.Where(u =>
                u.Nombre.Contains(term) ||
                u.NombreUsuario.Contains(term) ||
                u.Email.Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(rol) && Enum.TryParse<RolUsuario>(rol.Trim(), true, out var rolFiltro))
        {
            query = query.Where(u => u.Rol == rolFiltro);
        }

        var usuarios = await query
            .OrderBy(u => u.Nombre)
            .ToListAsync();

        return Ok(usuarios.Select(MapToSalida));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioSalidaDto>> GetById(int id)
    {
        var usuario = await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (usuario is null)
        {
            return NotFound(new { mensaje = $"Usuario {id} no encontrado" });
        }

        return Ok(MapToSalida(usuario));
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioSalidaDto>> Create([FromBody] UsuarioCrearDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        string nombreUsuario = dto.NombreUsuario.Trim();
        string email = dto.Email.Trim();

        var duplicado = await BuscarDuplicado(nombreUsuario, email, null);
        if (duplicado is not null)
        {
            return Conflict(new { mensaje = duplicado });
        }

        var usuario = new Usuario
        {
            Nombre = dto.Nombre.Trim(),
            NombreUsuario = nombreUsuario,
            Email = email,
            Rol = dto.Rol,
            Activo = dto.Activo,
            FechaCreacion = DateTime.UtcNow
        };

        usuario.PasswordHash = _hasher.HashPassword(usuario, dto.Password);

        _context.Usuarios.Add(usuario);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { mensaje = "Ya existe un usuario con ese nombre de usuario o correo." });
        }

        return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, MapToSalida(usuario));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UsuarioSalidaDto>> Update(int id, [FromBody] UsuarioActualizarDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
        if (usuario is null)
        {
            return NotFound(new { mensaje = $"Usuario {id} no encontrado" });
        }

        string nombreUsuario = dto.NombreUsuario.Trim();
        string email = dto.Email.Trim();

        var duplicado = await BuscarDuplicado(nombreUsuario, email, id);
        if (duplicado is not null)
        {
            return Conflict(new { mensaje = duplicado });
        }

        // Un administrador activo no puede quedarse sin permisos si es el último que queda.
        bool dejaDeSerAdminActivo = usuario.Rol == RolUsuario.Administrador && usuario.Activo
            && (dto.Rol != RolUsuario.Administrador || !dto.Activo);

        if (dejaDeSerAdminActivo && !await ExisteOtroAdminActivo(id))
        {
            return Conflict(new { mensaje = "Debe existir al menos un administrador activo." });
        }

        usuario.Nombre = dto.Nombre.Trim();
        usuario.NombreUsuario = nombreUsuario;
        usuario.Email = email;
        usuario.Rol = dto.Rol;
        usuario.Activo = dto.Activo;
        usuario.FechaActualizacion = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            usuario.PasswordHash = _hasher.HashPassword(usuario, dto.Password);
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { mensaje = "Ya existe un usuario con ese nombre de usuario o correo." });
        }

        return Ok(MapToSalida(usuario));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
        if (usuario is null)
        {
            return NotFound(new { mensaje = $"Usuario {id} no encontrado" });
        }

        if (usuario.Rol == RolUsuario.Administrador && usuario.Activo && !await ExisteOtroAdminActivo(id))
        {
            return Conflict(new { mensaje = "Debe existir al menos un administrador activo." });
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> ExisteOtroAdminActivo(int excluirId) =>
        await _context.Usuarios.AnyAsync(u =>
            u.Id != excluirId && u.Activo && u.Rol == RolUsuario.Administrador);

    private async Task<string?> BuscarDuplicado(string nombreUsuario, string email, int? excluirId)
    {
        if (await _context.Usuarios.AnyAsync(u =>
                u.NombreUsuario == nombreUsuario && (excluirId == null || u.Id != excluirId)))
        {
            return $"Ya existe un usuario con el nombre de usuario \"{nombreUsuario}\".";
        }

        if (await _context.Usuarios.AnyAsync(u =>
                u.Email == email && (excluirId == null || u.Id != excluirId)))
        {
            return $"Ya existe un usuario con el correo \"{email}\".";
        }

        return null;
    }

    private static UsuarioSalidaDto MapToSalida(Usuario u) => new()
    {
        Id = u.Id,
        Nombre = u.Nombre,
        NombreUsuario = u.NombreUsuario,
        Email = u.Email,
        Rol = u.Rol,
        Activo = u.Activo,
        FechaCreacion = u.FechaCreacion,
        FechaActualizacion = u.FechaActualizacion
    };
}
