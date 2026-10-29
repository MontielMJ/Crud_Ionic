using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuplementosAPI.Data;
using SuplementosAPI.Models;

namespace SuplementosAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductoSalidaDto>>> Get([FromQuery] string? buscar, [FromQuery] bool? activo)
    {
        IQueryable<Producto> query = _context.Productos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            string term = buscar.Trim();
            query = query.Where(p =>
                p.Nombre.Contains(term) ||
                p.Categoria.Contains(term) ||
                (p.Descripcion != null && p.Descripcion.Contains(term)));
        }

        if (activo.HasValue)
        {
            query = query.Where(p => p.Activo == activo.Value);
        }

        var productos = await query
            .OrderBy(p => p.Nombre)
            .Select(p => MapToSalida(p))
            .ToListAsync();

        return Ok(productos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductoSalidaDto>> GetById(int id)
    {
        var producto = await _context.Productos
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (producto is null)
        {
            return NotFound(new { mensaje = $"Producto {id} no encontrado" });
        }

        return Ok(MapToSalida(producto));
    }

    [HttpPost]
    public async Task<ActionResult<ProductoSalidaDto>> Create([FromBody] ProductoDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var producto = new Producto
        {
            Nombre = dto.Nombre.Trim(),
            Categoria = dto.Categoria.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Precio = dto.Precio,
            Stock = dto.Stock,
            Presentacion = dto.Presentacion,
            Activo = dto.Activo,
            FechaCreacion = DateTime.UtcNow
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        var salida = MapToSalida(producto);
        return CreatedAtAction(nameof(GetById), new { id = producto.Id }, salida);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductoSalidaDto>> Update(int id, [FromBody] ProductoDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var producto = await _context.Productos.FirstOrDefaultAsync(p => p.Id == id);

        if (producto is null)
        {
            return NotFound(new { mensaje = $"Producto {id} no encontrado" });
        }

        producto.Nombre = dto.Nombre.Trim();
        producto.Categoria = dto.Categoria.Trim();
        producto.Descripcion = dto.Descripcion?.Trim();
        producto.Precio = dto.Precio;
        producto.Stock = dto.Stock;
        producto.Presentacion = dto.Presentacion;
        producto.Activo = dto.Activo;
        producto.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToSalida(producto));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _context.Productos.FirstOrDefaultAsync(p => p.Id == id);

        if (producto is null)
        {
            return NotFound(new { mensaje = $"Producto {id} no encontrado" });
        }

        var tieneVentas = await _context.DetallesVenta.AnyAsync(d => d.ProductoId == id);
        if (tieneVentas)
        {
            return Conflict(new
            {
                mensaje = "No se puede eliminar el producto porque tiene ventas registradas. Desactívalo en su lugar."
            });
        }

        _context.Productos.Remove(producto);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ProductoSalidaDto MapToSalida(Producto p) => new()
    {
        Id = p.Id,
        Nombre = p.Nombre,
        Categoria = p.Categoria,
        Descripcion = p.Descripcion,
        Precio = p.Precio,
        Stock = p.Stock,
        Presentacion = p.Presentacion,
        Activo = p.Activo,
        FechaCreacion = p.FechaCreacion,
        FechaActualizacion = p.FechaActualizacion
    };
}
