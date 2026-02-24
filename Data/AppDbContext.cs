using Microsoft.EntityFrameworkCore;
using ConnectplusBackend.Models;
using ConnectplusBackend.Models.Enums;

namespace ConnectplusBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Agent> Agents { get; set; }
        public DbSet<TicketCategory> TicketCategories { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Customer configurations
            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Email)
                .IsUnique();

            modelBuilder.Entity<Customer>()
                .Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Customer>()
                .Property(c => c.IsActive)
                .HasDefaultValue(true);

            // Agent configurations
            modelBuilder.Entity<Agent>()
                .HasIndex(a => a.Email)
                .IsUnique();

            modelBuilder.Entity<Agent>()
                .Property(a => a.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Agent>()
                .Property(a => a.IsActive)
                .HasDefaultValue(true);

            modelBuilder.Entity<Agent>()
                .Property(a => a.Role)
                .HasDefaultValue("Agent");

            // TicketCategory configurations
            modelBuilder.Entity<TicketCategory>()
                .Property(tc => tc.IsActive)
                .HasDefaultValue(true);

            // Ticket configurations - ENUM CONVERSION
            modelBuilder.Entity<Ticket>()
                .Property(t => t.Status)
                .HasConversion<int>();  // Store enum as int in database

            modelBuilder.Entity<Ticket>()
                .Property(t => t.Priority)
                .HasConversion<int>();  // Store enum as int in database

            modelBuilder.Entity<Ticket>()
                .Property(t => t.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Indexes
            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.CustomerID);

            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.AgentID);

            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.Status);

            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.CreatedAt);

            // Relationships
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Customer)
                .WithMany(c => c.Tickets)
                .HasForeignKey(t => t.CustomerID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Agent)
                .WithMany(a => a.Tickets)
                .HasForeignKey(t => t.AgentID)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Category)
                .WithMany(c => c.Tickets)
                .HasForeignKey(t => t.CategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed TicketCategories
            modelBuilder.Entity<TicketCategory>().HasData(
                new TicketCategory { CategoryID = 1, CategoryName = "Technical Support", Description = "Hardware, software, network issues", IsActive = true },
                new TicketCategory { CategoryID = 2, CategoryName = "Billing", Description = "Invoice, payment, subscription queries", IsActive = true },
                new TicketCategory { CategoryID = 3, CategoryName = "General Enquiry", Description = "General questions and information", IsActive = true },
                new TicketCategory { CategoryID = 4, CategoryName = "Complaint", Description = "Customer complaints and escalations", IsActive = true },
                new TicketCategory { CategoryID = 5, CategoryName = "Service Request", Description = "New service setup or changes", IsActive = true }
            );

            // Seed Agents
            modelBuilder.Entity<Agent>().HasData(
                new Agent { AgentID = 1, FullName = "Alice Johnson", Email = "alice@connectplus.com", Department = "Support", Role = "Agent", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Agent { AgentID = 2, FullName = "Bob Smith", Email = "bob@connectplus.com", Department = "Support", Role = "Agent", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Agent { AgentID = 3, FullName = "Carol White", Email = "carol@connectplus.com", Department = "Support", Role = "Supervisor", IsActive = true, CreatedAt = DateTime.UtcNow }
            );

            // Seed Customers
            modelBuilder.Entity<Customer>().HasData(
                new Customer { CustomerID = 1, FullName = "John Doe", Email = "john@email.com", Phone = "9000000001", Address = "Hyderabad", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Customer { CustomerID = 2, FullName = "Jane Roe", Email = "jane@email.com", Phone = "9000000002", Address = "Bangalore", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Customer { CustomerID = 3, FullName = "Raj Kumar", Email = "raj@email.com", Phone = "9000000003", Address = "Mumbai", IsActive = true, CreatedAt = DateTime.UtcNow }
            );

            // Seed Tickets - USING ENUM VALUES (integers)
            modelBuilder.Entity<Ticket>().HasData(
                new Ticket 
                { 
                    TicketID = 1, 
                    CustomerID = 1, 
                    AgentID = 1, 
                    CategoryID = 1, 
                    Subject = "Laptop not starting", 
                    Description = "Laptop shows black screen on boot.", 
                    Status = TicketStatus.Open,        // 0
                    Priority = TicketPriority.High,    // 2
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Ticket 
                { 
                    TicketID = 2, 
                    CustomerID = 2, 
                    AgentID = 2, 
                    CategoryID = 2, 
                    Subject = "Invoice mismatch", 
                    Description = "Charged extra for last month.", 
                    Status = TicketStatus.InProgress,  // 1
                    Priority = TicketPriority.Medium,  // 1
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Ticket 
                { 
                    TicketID = 3, 
                    CustomerID = 3, 
                    AgentID = null, 
                    CategoryID = 3, 
                    Subject = "Service inquiry", 
                    Description = "Want to know about premium plan.", 
                    Status = TicketStatus.Open,        // 0
                    Priority = TicketPriority.Low,     // 0
                    CreatedAt = DateTime.UtcNow.AddHours(-5)
                }
            );
        }
    }
}