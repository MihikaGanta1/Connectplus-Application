using ConnectplusBackend.Models;
using ConnectplusBackend.Models.Enums;

namespace ConnectplusBackend.Repositories.Interfaces
{
    public interface ITicketRepository : IRepository<Ticket>
    {
        Task<IEnumerable<Ticket>> GetTicketsWithDetailsAsync();
        Task<Ticket> GetTicketWithDetailsAsync(int ticketId);  // This was missing
        Task<IEnumerable<Ticket>> GetTicketsByCustomerAsync(int customerId);
        Task<IEnumerable<Ticket>> GetTicketsByAgentAsync(int agentId);
        Task<IEnumerable<Ticket>> GetTicketsByStatusAsync(TicketStatus status);
        Task<IEnumerable<Ticket>> GetTicketsByPriorityAsync(TicketPriority priority);
        Task<IEnumerable<Ticket>> GetTicketsByDateRangeAsync(DateTime fromDate, DateTime toDate);
        Task<bool> IsDuplicateTicketAsync(int customerId, string subject);
        Task<IEnumerable<Ticket>> GetTicketsForSLAReportAsync();
        Task<int> GetTicketCountByStatusAsync(TicketStatus status);
        Task<Dictionary<TicketStatus, int>> GetTicketStatusSummaryAsync();
        Task<IEnumerable<Ticket>> GetOpenTicketsAsync();
        Task<IEnumerable<Ticket>> GetResolvedTicketsAsync();
        Task<IEnumerable<Ticket>> SearchTicketsAsync(string searchTerm);
        // In ITicketRepository.cs
Task UpdateTicketAsync(Ticket entity);
    }
}