using ConnectplusBackend.DTOs;
using ConnectplusBackend.Models;
using ConnectplusBackend.Repositories.Interfaces;
using ConnectplusBackend.Services.Interfaces;
using ConnectplusBackend.Utils;

namespace ConnectplusBackend.Services.Implementations
{
    public class AgentService : IAgentService
    {
        private readonly IAgentRepository _agentRepository;
        private readonly ITicketRepository _ticketRepository;
        private readonly ILogger<AgentService> _logger;

        public AgentService(
            IAgentRepository agentRepository,
            ITicketRepository ticketRepository,
            ILogger<AgentService> logger)
        {
            _agentRepository = agentRepository;
            _ticketRepository = ticketRepository;
            _logger = logger;
        }

        // GET ALL AGENTS
        public async Task<ApiResponse<IEnumerable<AgentResponseDto>>> GetAllAgentsAsync()
{
    try
    {
        var agents = await _agentRepository.GetAllAsync();
        var responseDtos = agents.Select(a => new AgentResponseDto
        {
            AgentID = a.AgentID,
            FullName = a.FullName,
            Email = a.Email,
            Department = a.Department,
            Role = a.Role,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt
        });

        return ApiResponse<IEnumerable<AgentResponseDto>>.SuccessResponse(
            responseDtos, "Agents retrieved successfully");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting agents");
        return ApiResponse<IEnumerable<AgentResponseDto>>.ErrorResponse(
            "An error occurred while retrieving agents");
    }
}

        // GET AGENT BY ID
        public async Task<ApiResponse<AgentResponseDto>> GetAgentByIdAsync(int id)
        {
            try
            {
                var agent = await _agentRepository.GetByIdAsync(id);
                if (agent == null)
                {
                    return ApiResponse<AgentResponseDto>.ErrorResponse(
                        $"Agent with ID {id} not found", 404);
                }

                var assignedCount = await _agentRepository.GetAssignedTicketCountAsync(id);
                var resolvedCount = await _agentRepository.GetResolvedTicketCountAsync(id);

                var responseDto = new AgentResponseDto
                {
                    AgentID = agent.AgentID,
                    FullName = agent.FullName,
                    Email = agent.Email,
                    Department = agent.Department,
                    Role = agent.Role,
                    IsActive = agent.IsActive,
                    CreatedAt = agent.CreatedAt,
                    AssignedTickets = assignedCount,
                    ResolvedTickets = resolvedCount
                };

                return ApiResponse<AgentResponseDto>.SuccessResponse(
                    responseDto, "Agent retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting agent with ID: {AgentId}", id);
                return ApiResponse<AgentResponseDto>.ErrorResponse(
                    "An error occurred while retrieving the agent");
            }
        }

        // CREATE AGENT
        public async Task<ApiResponse<AgentResponseDto>> CreateAgentAsync(CreateAgentDto createDto)
        {
            try
            {
                // Check for duplicate email
                var isEmailUnique = await _agentRepository.IsEmailUniqueAsync(createDto.Email);
                if (!isEmailUnique)
                {
                    return ApiResponse<AgentResponseDto>.ErrorResponse(
                        $"Agent with email {createDto.Email} already exists", 409);
                }

                // Create agent
                var agent = new Agent
                {
                    FullName = createDto.FullName.Trim(),
                    Email = createDto.Email.ToLower().Trim(),
                    Department = createDto.Department?.Trim(),
                    Role = createDto.Role ?? "Agent",
                    IsActive = true
                };

                var created = await _agentRepository.AddAsync(agent);
                _logger.LogInformation("Created new agent with ID: {AgentId}", created.AgentID);

                return await GetAgentByIdAsync(created.AgentID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating agent");
                return ApiResponse<AgentResponseDto>.ErrorResponse(
                    "An error occurred while creating the agent");
            }
        }

        // UPDATE AGENT
        public async Task<ApiResponse<AgentResponseDto>> UpdateAgentAsync(UpdateAgentDto updateDto)
        {
            try
            {
                var existingAgent = await _agentRepository.GetByIdAsync(updateDto.AgentID);
                if (existingAgent == null)
                {
                    return ApiResponse<AgentResponseDto>.ErrorResponse(
                        $"Agent with ID {updateDto.AgentID} not found", 404);
                }

                // Check email uniqueness if changed
                if (!string.IsNullOrWhiteSpace(updateDto.Email) && 
                    existingAgent.Email.ToLower() != updateDto.Email.ToLower())
                {
                    var isEmailUnique = await _agentRepository.IsEmailUniqueAsync(
                        updateDto.Email, updateDto.AgentID);
                    if (!isEmailUnique)
                    {
                        return ApiResponse<AgentResponseDto>.ErrorResponse(
                            $"Agent with email {updateDto.Email} already exists", 409);
                    }
                    existingAgent.Email = updateDto.Email.ToLower().Trim();
                }

                // Update fields if provided
                if (!string.IsNullOrWhiteSpace(updateDto.FullName))
                    existingAgent.FullName = updateDto.FullName.Trim();

                if (updateDto.Department != null)
                    existingAgent.Department = string.IsNullOrWhiteSpace(updateDto.Department) ? null : updateDto.Department.Trim();

                if (updateDto.Role != null)
                    existingAgent.Role = string.IsNullOrWhiteSpace(updateDto.Role) ? "Agent" : updateDto.Role.Trim();

                if (updateDto.IsActive.HasValue)
                    existingAgent.IsActive = updateDto.IsActive.Value;

                await _agentRepository.UpdateAsync(existingAgent);
                _logger.LogInformation("Updated agent with ID: {AgentId}", existingAgent.AgentID);

                return await GetAgentByIdAsync(existingAgent.AgentID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating agent with ID: {AgentId}", updateDto.AgentID);
                return ApiResponse<AgentResponseDto>.ErrorResponse(
                    "An error occurred while updating the agent");
            }
        }

        // DELETE AGENT (Soft Delete)
        public async Task<ApiResponse<bool>> DeleteAgentAsync(int id)
        {
            try
            {
                var agent = await _agentRepository.GetByIdAsync(id);
                if (agent == null)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        $"Agent with ID {id} not found", 404);
                }

                // Soft delete - just deactivate
                agent.IsActive = false;
                await _agentRepository.UpdateAsync(agent);
                
                _logger.LogInformation("Deactivated agent with ID: {AgentId}", id);
                return ApiResponse<bool>.SuccessResponse(true, "Agent deactivated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting agent with ID: {AgentId}", id);
                return ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the agent");
            }
        }

        // GET AGENT TICKETS
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetAgentTicketsAsync(int agentId)
        {
            try
            {
                var agent = await _agentRepository.GetByIdAsync(agentId);
                if (agent == null)
                {
                    return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                        $"Agent with ID {agentId} not found", 404);
                }

                var tickets = await _ticketRepository.GetTicketsByAgentAsync(agentId);
                var responseDtos = tickets.Select(MapToTicketResponseDto);

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Agent tickets retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tickets for agent ID: {AgentId}", agentId);
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving agent tickets");
            }
        }

        // Helper method to map Ticket to TicketResponseDto
        private TicketResponseDto MapToTicketResponseDto(Ticket ticket)
        {
            return new TicketResponseDto
            {
                TicketID = ticket.TicketID,
                CustomerID = ticket.CustomerID,
                CustomerName = ticket.Customer?.FullName,
                CustomerEmail = ticket.Customer?.Email,
                AgentID = ticket.AgentID,
                AgentName = ticket.Agent?.FullName,
                AgentDepartment = ticket.Agent?.Department,
                CategoryID = ticket.CategoryID,
                CategoryName = ticket.Category?.CategoryName,
                Subject = ticket.Subject,
                Description = ticket.Description,
                Status = ticket.Status.ToString(),
                StatusValue = (int)ticket.Status,
                Priority = ticket.Priority.ToString(),
                PriorityValue = (int)ticket.Priority,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                ResolvedAt = ticket.ResolvedAt,
                ResolutionHours = ticket.ResolvedAt.HasValue
                    ? Math.Round((ticket.ResolvedAt.Value - ticket.CreatedAt).TotalHours, 2)
                    : null
            };
        }
    }
}