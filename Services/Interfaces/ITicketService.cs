using ConnectplusBackend.DTOs;
using ConnectplusBackend.Models.Enums;
using ConnectplusBackend.Utils;

namespace ConnectplusBackend.Services.Interfaces
{
    public interface ITicketService
    {
        // Basic CRUD
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetAllTicketsAsync();
        Task<ApiResponse<TicketResponseDto>> GetTicketByIdAsync(int id);
        Task<ApiResponse<TicketResponseDto>> CreateTicketAsync(CreateTicketDto createDto);
        
        // Filter methods
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByCustomerAsync(int customerId);
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByAgentAsync(int agentId);
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByStatusAsync(TicketStatus status);
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByPriorityAsync(TicketPriority priority);
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByDateRangeAsync(DateTime fromDate, DateTime toDate);
        
        // Update methods
        Task<ApiResponse<TicketResponseDto>> UpdateTicketStatusAsync(int ticketId, UpdateTicketStatusDto statusDto);
        Task<ApiResponse<TicketResponseDto>> AssignTicketAsync(int ticketId, AssignTicketDto assignDto);
        
        // Report methods
        Task<ApiResponse<Dictionary<string, int>>> GetTicketSummaryAsync();
        Task<ApiResponse<IEnumerable<object>>> GetSLAReportAsync();
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetOpenTicketsAsync();
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetResolvedTicketsAsync();
        
        // Search
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> SearchTicketsAsync(string searchTerm);
    }
}