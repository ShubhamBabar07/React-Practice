using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MySql.Data.MySqlClient;
using System.Data;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// MySQL connection string
string connectionString = "server=localhost;user=root;password=yourpassword;database=testdb";

// Ensure table exists
using (var conn = new MySqlConnection(connectionString))
{
    conn.Open();
    var cmd = new MySqlCommand(@"
        CREATE TABLE IF NOT EXISTS Products (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(100),
            Price DECIMAL(10, 2)
        )", conn);
    cmd.ExecuteNonQuery();
}

// Create
app.MapPost("/products", async (HttpContext context) =>
{
    var form = await context.Request.ReadFromJsonAsync<Product>();
    using var conn = new MySqlConnection(connectionString);
    conn.Open();
    var cmd = new MySqlCommand("INSERT INTO Products (Name, Price) VALUES (@name, @price)", conn);
    cmd.Parameters.AddWithValue("@name", form!.Name);
    cmd.Parameters.AddWithValue("@price", form.Price);
    cmd.ExecuteNonQuery();
    context.Response.StatusCode = 201;
});

// Read all
app.MapGet("/products", () =>
{
    var products = new List<Product>();
    using var conn = new MySqlConnection(connectionString);
    conn.Open();
    var cmd = new MySqlCommand("SELECT * FROM Products", conn);
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        products.Add(new Product
        {
            Id = reader.GetInt32("Id"),
            Name = reader.GetString("Name"),
            Price = reader.GetDecimal("Price")
        });
    }
    return products;
});

// Read one
app.MapGet("/products/{id:int}", (int id) =>
{
    using var conn = new MySqlConnection(connectionString);
    conn.Open();
    var cmd = new MySqlCommand("SELECT * FROM Products WHERE Id = @id", conn);
    cmd.Parameters.AddWithValue("@id", id);
    using var reader = cmd.ExecuteReader();
    if (reader.Read())
    {
        return Results.Ok(new Product
        {
            Id = reader.GetInt32("Id"),
            Name = reader.GetString("Name"),
            Price = reader.GetDecimal("Price")
        });
    }
    return Results.NotFound();
});

// Update
app.MapPut("/products/{id:int}", async (int id, HttpContext context) =>
{
    var form = await context.Request.ReadFromJsonAsync<Product>();
    using var conn = new MySqlConnection(connectionString);
    conn.Open();
    var cmd = new MySqlCommand("UPDATE Products SET Name = @name, Price = @price WHERE Id = @id", conn);
    cmd.Parameters.AddWithValue("@name", form!.Name);
    cmd.Parameters.AddWithValue("@price", form.Price);
    cmd.Parameters.AddWithValue("@id", id);
    var rows = cmd.ExecuteNonQuery();
    return rows > 0 ? Results.Ok() : Results.NotFound();
});

// Delete
app.MapDelete("/products/{id:int}", (int id) =>
{
    using var conn = new MySqlConnection(connectionString);
    conn.Open();
    var cmd = new MySqlCommand("DELETE FROM Products WHERE Id = @id", conn);
    cmd.Parameters.AddWithValue("@id", id);
    var rows = cmd.ExecuteNonQuery();
    return rows > 0 ? Results.Ok() : Results.NotFound();
});

app.Run();

record Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}
