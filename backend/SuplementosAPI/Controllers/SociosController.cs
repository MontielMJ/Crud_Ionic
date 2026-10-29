using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuplementosAPI.Data;
using SuplementosAPI.Models;

namespace SuplementosAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SociosController : ControllerBase
{
    /// <summary>Días de anticipación con los que se avisa que una membresía está por vencer.</summary>
    private const int DiasAvisoVencimiento = 7;

    private readonly AppDbContext _context;

    public SociosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SocioSalidaDto>>> Get(
        [FromQuery] string? buscar,
        [FromQuery] string? estado)
    {
        IQueryable<Socio> query = _context.Socios.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            string term = buscar.Trim();
            query = query.Where(s =>
                s.Nombre.Contains(term) ||
                s.Documento.Contains(term) ||
                (s.Email != null && s.Email.Contains(term)) ||
                (s.Telefono != null && s.Telefono.Contains(term)));
        }

        var hoy = DateTime.UtcNow.Date;
        var limiteAviso = hoy.AddDays(DiasAvisoVencimiento);

        switch (estado?.Trim().ToLowerInvariant())
        {
            case "vigente":
                query = query.Where(s => s.Activo && s.FechaVencimiento >= hoy);
                break;
            case "porvencer":
                query = query.Where(s => s.Activo && s.FechaVencimiento >= hoy && s.FechaVencimiento <= limiteAviso);
                break;
            case "vencido":
                query = query.Where(s => s.Activo && s.FechaVencimiento < hoy);
                break;
            case "inactivo":
                query = query.Where(s => !s.Activo);
                break;
        }

        var socios = await query
            .OrderBy(s => s.Nombre)
            .ToListAsync();

        return Ok(socios.Select(s => MapToSalida(s, hoy)));
    }

    [HttpGet("resumen")]
    public async Task<ActionResult<SocioResumenDto>> GetResumen()
    {
        var hoy = DateTime.UtcNow.Date;
        var limiteAviso = hoy.AddDays(DiasAvisoVencimiento);

        return Ok(new SocioResumenDto
        {
            Total = await _context.Socios.CountAsync(),
            Activos = await _context.Socios.CountAsync(s => s.Activo),
            PorVencer = await _context.Socios.CountAsync(s => s.Activo && s.FechaVencimiento >= hoy && s.FechaVencimiento <= limiteAviso),
            Vencidos = await _context.Socios.CountAsync(s => s.Activo && s.FechaVencimiento < hoy),
            Inactivos = await _context.Socios.CountAsync(s => !s.Activo)
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SocioSalidaDto>> GetById(int id)
    {
        var socio = await _context.Socios.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        if (socio is null)
        {
            return NotFound(new { mensaje = $"Socio {id} no encontrado" });
        }

        return Ok(MapToSalida(socio, DateTime.UtcNow.Date));
    }

    [HttpPost]
    public async Task<ActionResult<SocioSalidaDto>> Create([FromBody] SocioDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (dto.FechaVencimiento.Date < dto.FechaInicio.Date)
        {
            return BadRequest(new { mensaje = "La fecha de vencimiento no puede ser anterior a la fecha de inicio." });
        }

        string documento = dto.Documento.Trim();
        if (await _context.Socios.AnyAsync(s => s.Documento == documento))
        {
            return Conflict(new { mensaje = $"Ya existe un socio con el documento \"{documento}\"." });
        }

        var socio = new Socio
        {
            Nombre = dto.Nombre.Trim(),
            Documento = documento,
            Telefono = TextoONulo(dto.Telefono),
            Email = TextoONulo(dto.Email),
            Plan = dto.Plan,
            FechaInicio = dto.FechaInicio.Date,
            FechaVencimiento = dto.FechaVencimiento.Date,
            Activo = dto.Activo,
            Notas = TextoONulo(dto.Notas),
            FechaCreacion = DateTime.UtcNow
        };

        _context.Socios.Add(socio);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { mensaje = $"Ya existe un socio con el documento \"{documento}\"." });
        }

        return CreatedAtAction(nameof(GetById), new { id = socio.Id }, MapToSalida(socio, DateTime.UtcNow.Date));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SocioSalidaDto>> Update(int id, [FromBody] SocioDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var socio = await _context.Socios.FirstOrDefaultAsync(s => s.Id == id);
        if (socio is null)
        {
            return NotFound(new { mensaje = $"Socio {id} no encontrado" });
        }

        if (dto.FechaVencimiento.Date < dto.FechaInicio.Date)
        {
            return BadRequest(new { mensaje = "La fecha de vencimiento no puede ser anterior a la fecha de inicio." });
        }

        string documento = dto.Documento.Trim();
        if (await _context.Socios.AnyAsync(s => s.Id != id && s.Documento == documento))
        {
            return Conflict(new { mensaje = $"Ya existe un socio con el documento \"{documento}\"." });
        }

        socio.Nombre = dto.Nombre.Trim();
        socio.Documento = documento;
        socio.Telefono = TextoONulo(dto.Telefono);
        socio.Email = TextoONulo(dto.Email);
        socio.Plan = dto.Plan;
        socio.FechaInicio = dto.FechaInicio.Date;
        socio.FechaVencimiento = dto.FechaVencimiento.Date;
        socio.Activo = dto.Activo;
        socio.Notas = TextoONulo(dto.Notas);
        socio.FechaActualizacion = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { mensaje = $"Ya existe un socio con el documento \"{documento}\"." });
        }

        return Ok(MapToSalida(socio, DateTime.UtcNow.Date));
    }

    /// <summary>
    /// Renueva la membresía: si sigue vigente extiende desde el vencimiento actual,
    /// si ya venció comienza hoy.
    /// </summary>
    [HttpPost("{id:int}/renovar")]
    public async Task<ActionResult<SocioSalidaDto>> Renovar(int id, [FromBody] RenovacionDto dto)
    {
        var socio = await _context.Socios.FirstOrDefaultAsync(s => s.Id == id);
        if (socio is null)
        {
            return NotFound(new { mensaje = $"Socio {id} no encontrado" });
        }

        if (!socio.Activo)
        {
            return BadRequest(new { mensaje = "El socio está inactivo. Actívalo antes de renovar su membresía." });
        }

        var hoy = DateTime.UtcNow.Date;
        var plan = dto.Plan ?? socio.Plan;
        var inicio = socio.FechaVencimiento.Date >= hoy ? socio.FechaVencimiento.Date : hoy;

        socio.Plan = plan;
        socio.FechaInicio = inicio;
        socio.FechaVencimiento = inicio.AddDays(plan.Dias());
        socio.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToSalida(socio, hoy));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var socio = await _context.Socios.FirstOrDefaultAsync(s => s.Id == id);
        if (socio is null)
        {
            return NotFound(new { mensaje = $"Socio {id} no encontrado" });
        }

        _context.Socios.Remove(socio);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static string? TextoONulo(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

    private static SocioSalidaDto MapToSalida(Socio s, DateTime hoy)
    {
        int dias = (s.FechaVencimiento.Date - hoy).Days;

        string estado = !s.Activo
            ? "Inactivo"
            : dias < 0
                ? "Vencido"
                : dias <= DiasAvisoVencimiento
                    ? "PorVencer"
                    : "Vigente";

        return new SocioSalidaDto
        {
            Id = s.Id,
            Nombre = s.Nombre,
            Documento = s.Documento,
            Telefono = s.Telefono,
            Email = s.Email,
            Plan = s.Plan,
            FechaInicio = s.FechaInicio.ToString("yyyy-MM-dd"),
            FechaVencimiento = s.FechaVencimiento.ToString("yyyy-MM-dd"),
            Activo = s.Activo,
            Notas = s.Notas,
            Estado = estado,
            DiasRestantes = dias,
            FechaCreacion = s.FechaCreacion,
            FechaActualizacion = s.FechaActualizacion
        };
    }
}
