using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using SuplementosAPI.Data;
using SuplementosAPI.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors("PermitirFrontend");

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    SeedData(db);
}

app.Run();

static void SeedData(AppDbContext db)
{
    if (db.Productos.Any())
    {
        return;
    }

    var ahora = DateTime.UtcNow;
    db.Productos.AddRange(new[]
    {
        new Producto { Nombre = "Whey Protein Isolate", Categoria = "Proteínas", Descripcion = "Aislado de proteína de suero, 30g por porción", Precio = 1299.50m, Stock = 25, Presentacion = Presentacion.Polvo, Activo = true, FechaCreacion = ahora },
        new Producto { Nombre = "Creatina Monohidrato", Categoria = "Creatina", Descripcion = "Creatina micronizada 5g por porción, 300g", Precio = 549.00m, Stock = 40, Presentacion = Presentacion.Polvo, Activo = true, FechaCreacion = ahora },
        new Producto { Nombre = "Omega 3", Categoria = "Vitaminas", Descripcion = "120 cápsulas de ácidos grasos EPA/DHA", Precio = 389.90m, Stock = 4, Presentacion = Presentacion.Capsula, Activo = true, FechaCreacion = ahora },
        new Producto { Nombre = "Multivitamínico", Categoria = "Vitaminas", Descripcion = "Complejo multivitamínico diario, 60 tabletas", Precio = 459.00m, Stock = 18, Presentacion = Presentacion.Tableta, Activo = false, FechaCreacion = ahora },
        new Producto { Nombre = "BCAA 2:1:1", Categoria = "Aminoácidos", Descripcion = "Aminoácidos ramificados sabor fresa, 300g", Precio = 729.00m, Stock = 12, Presentacion = Presentacion.Polvo, Activo = true, FechaCreacion = ahora },
    });

    db.SaveChanges();
}