using ConnectplusBackend.Data;
using ConnectplusBackend.Repositories.Interfaces;
using ConnectplusBackend.Repositories.Implementations;
using ConnectplusBackend.Services.Interfaces;
using ConnectplusBackend.Services.Implementations;
using ConnectplusBackend.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger
// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo
//     {
//         Title = "ConnectPlus Support API",
//         Version = "v1",
//         Description = "Customer Engagement & Ticket Management API"
//     });
// });

// Configure Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Repositories
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IAgentRepository, AgentRepository>();
builder.Services.AddScoped<ITicketRepository>(provider => 
    new TicketRepository(
        provider.GetRequiredService<AppDbContext>(),
        provider.GetRequiredService<ILogger<TicketRepository>>()
    ));
// Register Services
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IAgentService, AgentService>();
builder.Services.AddScoped<ITicketService, TicketService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ConnectPlus API v1");
    });
}

// Use custom error handling middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Ensure database is created with better error handling
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Console.WriteLine("🔍 Checking database connection...");
        
        // Test connection
        if (dbContext.Database.CanConnect())
        {
            Console.WriteLine("✅ Database connection successful!");
            
            // Ensure database is created
            dbContext.Database.EnsureCreated();
            Console.WriteLine("✅ Database ensure created completed!");
            
            // Check if tables exist
            var customersExist = dbContext.Customers.Any();
            Console.WriteLine($"📊 Customers table has data: {customersExist}");
        }
        else
        {
            Console.WriteLine("❌ Cannot connect to database. Check connection string.");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Database Error: {ex.Message}");
    Console.WriteLine($"📝 Stack Trace: {ex.StackTrace}");
}

Console.WriteLine("🚀 Application is starting... Press Ctrl+C to stop.");
app.Run();