using ConnectplusBackend.Models;

namespace ConnectplusBackend.Repositories.Interfaces
{
    public interface IAgentRepository : IRepository<Agent>
    {
        Task<Agent> GetAgentByEmailAsync(string email);
        Task<IEnumerable<Agent>> GetActiveAgentsAsync();
        Task<bool> IsEmailUniqueAsync(string email, int? excludeAgentId = null);
        Task<int> GetAssignedTicketCountAsync(int agentId);
        Task<int> GetResolvedTicketCountAsync(int agentId);
        Task<IEnumerable<Agent>> GetAgentsWithStatsAsync();
    }
}