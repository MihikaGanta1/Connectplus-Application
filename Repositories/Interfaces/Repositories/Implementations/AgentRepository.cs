using Microsoft.EntityFrameworkCore;
using ConnectplusBackend.Data;
using ConnectplusBackend.Models;
using ConnectplusBackend.Models.Enums;
using ConnectplusBackend.Repositories.Interfaces;

namespace ConnectplusBackend.Repositories.Implementations
{
    public class AgentRepository : BaseRepository<Agent>, IAgentRepository
    {
        public AgentRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Agent> GetAgentByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(a => a.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<Agent>> GetActiveAgentsAsync()
        {
            return await _dbSet
                .Where(a => a.IsActive)
                .OrderBy(a => a.FullName)
                .ToListAsync();
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeAgentId = null)
        {
            var query = _dbSet.Where(a => a.Email.ToLower() == email.ToLower());
            
            if (excludeAgentId.HasValue)
            {
                query = query.Where(a => a.AgentID != excludeAgentId.Value);
            }

            return !await query.AnyAsync();
        }

        public async Task<int> GetAssignedTicketCountAsync(int agentId)
        {
            return await _context.Tickets
                .Where(t => t.AgentID == agentId && t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed)
                .CountAsync();
        }

        public async Task<int> GetResolvedTicketCountAsync(int agentId)
        {
            return await _context.Tickets
                .Where(t => t.AgentID == agentId && (t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed))
                .CountAsync();
        }

        public async Task<IEnumerable<Agent>> GetAgentsWithStatsAsync()
        {
            return await _dbSet
                .Include(a => a.Tickets)
                .OrderBy(a => a.FullName)
                .ToListAsync();
        }

        public override async Task<Agent> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(a => a.Tickets)
                .FirstOrDefaultAsync(a => a.AgentID == id);
        }
    }
}