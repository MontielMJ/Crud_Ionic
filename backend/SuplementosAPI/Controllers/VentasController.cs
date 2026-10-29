using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuplementosAPI.Data;
using SuplementosAPI.Models;

namespace SuplementosAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VentasController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<VentasController> _logger;

    public VentasController(AppDbContext context, ILogger<VentasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VentaSalidaDto>>> Get(
        [FromQuery] string? buscar,
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
    {
        IQueryable<Venta> query = _context.Ventas
            .AsNoTracking()
            .Include(v => v.Detalles)
            .ThenInclude(d => d.Producto);

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            string term = buscar.Trim();
            query = query.Where(v =>
                v.Cliente.Contains(term) ||
                v.Notas != null && v.Notas.Contains(term) ||
                v.Detalles.Any(d => d.Producto != null && d.Producto.Nombre.Contains(term)));
        }

        if (desde.HasValue)
        {
            query = query.Where(v => v.Fecha >= desde.Value);
        }

        if (hasta.HasValue)
        {
            query = query.Where(v => v.Fecha <= hasta.Value);
        }

        var ventas = await query
            .OrderByDescending(v => v.Fecha)
            .ToListAsync();

        return Ok(ventas.Select(MapToSalida));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VentaSalidaDto>> GetById(int id)
    {
        var venta = await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Detalles)
            .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (venta is null)
        {
            return NotFound(new { mensaje = $"Venta {id} no encontrada" });
        }

        return Ok(MapToSalida(venta));
    }

    [HttpPost]
    public async Task<ActionResult<VentaSalidaDto>> Create([FromBody] VentaDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (dto.Detalles.Count == 0)
        {
            return BadRequest(new { mensaje = "La venta debe tener al menos un producto." });
        }

        // Un mismo producto puede venir repetido: se agrupa para validar el stock total solicitado.
        var solicitados = dto.Detalles
            .GroupBy(d => d.ProductoId)
            .Select(g => new { ProductoId = g.Key, Cantidad = g.Sum(x => x.Cantidad) })
            .ToList();

        var ids = solicitados.Select(s => s.ProductoId).ToList();
        var productos = await _context.Productos
            .Where(p => ids.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        var errores = new List<string>();

        foreach (var item in solicitados)
        {
            if (!productos.TryGetValue(item.ProductoId, out var producto))
            {
                errores.Add($"El producto {item.ProductoId} no existe.");
                continue;
            }

            if (!producto.Activo)
            {
                errores.Add($"El producto \"{producto.Nombre}\" no está activo.");
            }

            if (producto.Stock < item.Cantidad)
            {
                errores.Add(
                    $"Stock insuficiente de \"{producto.Nombre}\": disponible {producto.Stock}, solicitado {item.Cantidad}.");
            }
        }

        if (errores.Count > 0)
        {
            return BadRequest(new { mensaje = string.Join(" ", errores) });
        }

        var ahora = DateTime.UtcNow;
        var venta = new Venta
        {
            Cliente = dto.Cliente.Trim(),
            MetodoPago = dto.MetodoPago,
            Notas = string.IsNullOrWhiteSpace(dto.Notas) ? null : dto.Notas.Trim(),
            Fecha = ahora
        };

        foreach (var item in solicitados)
        {
            var producto = productos[item.ProductoId];

            venta.Detalles.Add(new DetalleVenta
            {
                ProductoId = producto.Id,
                Cantidad = item.Cantidad,
                PrecioUnitario = producto.Precio,
                Subtotal = producto.Precio * item.Cantidad
            });

            producto.Stock -= item.Cantidad;
            producto.FechaActualizacion = ahora;
        }

        venta.Total = venta.Detalles.Sum(d => d.Subtotal);

        _context.Ventas.Add(venta);
        await _context.SaveChangesAsync();

        var salida = await ObtenerSalida(venta.Id);
        return CreatedAtAction(nameof(GetById), new { id = venta.Id }, salida);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var venta = await _context.Ventas
            .Include(v => v.Detalles)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (venta is null)
        {
            return NotFound(new { mensaje = $"Venta {id} no encontrada" });
        }

        // Cancelar una venta devuelve las unidades al stock.
        var productoIds = venta.Detalles.Select(d => d.ProductoId).Distinct().ToList();
        var productos = await _context.Productos
            .Where(p => productoIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        var ahora = DateTime.UtcNow;
        foreach (var detalle in venta.Detalles)
        {
            if (productos.TryGetValue(detalle.ProductoId, out var producto))
            {
                producto.Stock += detalle.Cantidad;
                producto.FechaActualizacion = ahora;
            }
        }

        _context.Ventas.Remove(venta);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Venta {VentaId} cancelada; stock restaurado.", id);
        return NoContent();
    }

    private async Task<VentaSalidaDto> ObtenerSalida(int id)
    {
        var venta = await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Detalles)
            .ThenInclude(d => d.Producto)
            .FirstAsync(v => v.Id == id);

        return MapToSalida(venta);
    }

    private static VentaSalidaDto MapToSalida(Venta v) => new()
    {
        Id = v.Id,
        Cliente = v.Cliente,
        MetodoPago = v.MetodoPago,
        Notas = v.Notas,
        Fecha = v.Fecha,
        Total = v.Total,
        Detalles = v.Detalles
            .OrderBy(d => d.Id)
            .Select(d => new DetalleVentaSalidaDto
            {
                ProductoId = d.ProductoId,
                ProductoNombre = d.Producto?.Nombre ?? $"Producto {d.ProductoId}",
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                Subtotal = d.Subtotal
            })
            .ToList()
    };
}
