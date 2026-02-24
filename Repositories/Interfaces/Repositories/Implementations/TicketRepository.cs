using Microsoft.EntityFrameworkCore;
using ConnectplusBackend.Data;
using ConnectplusBackend.Models;
using ConnectplusBackend.Models.Enums;
using ConnectplusBackend.Repositories.Interfaces;

namespace ConnectplusBackend.Repositories.Implementations
{
    public class TicketRepository : BaseRepository<Ticket>, ITicketRepository
    {
        // Add a logger field
        private readonly ILogger<TicketRepository> _logger;

        // Update constructor to accept logger
        public TicketRepository(AppDbContext context, ILogger<TicketRepository> logger) : base(context)
        {
            _logger = logger;
        }

        // ================ ADD THIS METHOD HERE ================
        public override async Task UpdateAsync(Ticket entity)
        {
            try
            {
                // Set UpdatedAt if not already set
                if (entity.UpdatedAt == null)
                {
                    entity.UpdatedAt = DateTime.UtcNow;
                }
                
                _dbSet.Update(entity);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Ticket {TicketId} updated successfully in database", entity.TicketID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ticket {TicketId}", entity.TicketID);
                throw;
            }
        }

        // ================ REST OF YOUR EXISTING METHODS ================
        public async Task<IEnumerable<Ticket>> GetTicketsWithDetailsAsync()
        {
            try
            {
                return await _dbSet
                    .Include(t => t.Customer)
                    .Include(t => t.Agent)
                    .Include(t => t.Category)
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetTicketsWithDetailsAsync");
                throw new Exception($"Error in GetTicketsWithDetailsAsync: {ex.Message}", ex);
            }
        }

        public async Task<Ticket> GetTicketWithDetailsAsync(int ticketId)
        {
            try
            {
                return await _dbSet
                    .Include(t => t.Customer)
                    .Include(t => t.Agent)
                    .Include(t => t.Category)
                    .FirstOrDefaultAsync(t => t.TicketID == ticketId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetTicketWithDetailsAsync for ID: {TicketId}", ticketId);
                throw new Exception($"Error in GetTicketWithDetailsAsync: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByCustomerAsync(int customerId)
        {
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => t.CustomerID == customerId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByAgentAsync(int agentId)
        {
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => t.AgentID == agentId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByStatusAsync(TicketStatus status)
        {
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => t.Status == status)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByPriorityAsync(TicketPriority priority)
        {
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => t.Priority == priority)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => t.CreatedAt >= fromDate && t.CreatedAt <= toDate)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> IsDuplicateTicketAsync(int customerId, string subject)
        {
            var cutoffTime = DateTime.UtcNow.AddHours(-24);
            
            return await _dbSet
                .AnyAsync(t => t.CustomerID == customerId &&
                              t.Subject.Contains(subject) &&
                              t.CreatedAt >= cutoffTime &&
                              t.Status != TicketStatus.Resolved &&
                              t.Status != TicketStatus.Closed);
        }

        public async Task<IEnumerable<Ticket>> GetTicketsForSLAReportAsync()
        {
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed)
                .OrderBy(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetTicketCountByStatusAsync(TicketStatus status)
        {
            return await _dbSet.CountAsync(t => t.Status == status);
        }

        public async Task<Dictionary<TicketStatus, int>> GetTicketStatusSummaryAsync()
        {
            var summary = new Dictionary<TicketStatus, int>();
            
            foreach (TicketStatus status in Enum.GetValues(typeof(TicketStatus)))
            {
                var count = await _dbSet.CountAsync(t => t.Status == status);
                summary.Add(status, count);
            }
            
            return summary;
        }

        public async Task<IEnumerable<Ticket>> GetOpenTicketsAsync()
        {
            var openStatuses = new[] { TicketStatus.Open, TicketStatus.InProgress, TicketStatus.OnHold };
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => openStatuses.Contains(t.Status))
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
// In TicketRepository.cs - Add this method
public async Task UpdateTicketAsync(Ticket entity)
{
    try
    {
        // Set UpdatedAt if not already set
        if (entity.UpdatedAt == null)
        {
            entity.UpdatedAt = DateTime.UtcNow;
        }
        
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Ticket {TicketId} updated successfully in database", entity.TicketID);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error updating ticket {TicketId}", entity.TicketID);
        throw;
    }
}
        public async Task<IEnumerable<Ticket>> GetResolvedTicketsAsync()
        {
            var resolvedStatuses = new[] { TicketStatus.Resolved, TicketStatus.Closed };
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => resolvedStatuses.Contains(t.Status))
                .OrderByDescending(t => t.ResolvedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> SearchTicketsAsync(string searchTerm)
        {
            return await _dbSet
                .Include(t => t.Customer)
                .Include(t => t.Agent)
                .Include(t => t.Category)
                .Where(t => t.Subject.Contains(searchTerm) ||
                           t.Description.Contains(searchTerm) ||
                           (t.Customer != null && t.Customer.FullName.Contains(searchTerm)))
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
    }
}