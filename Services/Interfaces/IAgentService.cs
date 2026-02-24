using ConnectplusBackend.DTOs;
using ConnectplusBackend.Utils;

namespace ConnectplusBackend.Services.Interfaces
{
    public interface IAgentService
    {
        Task<ApiResponse<IEnumerable<AgentResponseDto>>> GetAllAgentsAsync();
        Task<ApiResponse<AgentResponseDto>> GetAgentByIdAsync(int id);
        Task<ApiResponse<AgentResponseDto>> CreateAgentAsync(CreateAgentDto createDto);
        Task<ApiResponse<AgentResponseDto>> UpdateAgentAsync(UpdateAgentDto updateDto);
        Task<ApiResponse<bool>> DeleteAgentAsync(int id);
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetAgentTicketsAsync(int agentId);
    }
}