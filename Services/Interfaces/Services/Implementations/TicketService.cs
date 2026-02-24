using ConnectplusBackend.DTOs;
using ConnectplusBackend.Models;
using ConnectplusBackend.Models.Enums;
using ConnectplusBackend.Repositories.Interfaces;
using ConnectplusBackend.Services.Interfaces;
using ConnectplusBackend.Utils;

namespace ConnectplusBackend.Services.Implementations
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IAgentRepository _agentRepository;
        private readonly ILogger<TicketService> _logger;

        public TicketService(
            ITicketRepository ticketRepository,
            ICustomerRepository customerRepository,
            IAgentRepository agentRepository,
            ILogger<TicketService> logger)
        {
            _ticketRepository = ticketRepository;
            _customerRepository = customerRepository;
            _agentRepository = agentRepository;
            _logger = logger;
        }

        // ================ GET ALL TICKETS ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetAllTicketsAsync()
        {
            try
            {
                _logger.LogInformation("Getting all tickets from repository");
                
                var tickets = await _ticketRepository.GetTicketsWithDetailsAsync();
                
                _logger.LogInformation("Retrieved {Count} tickets", tickets?.Count() ?? 0);
                
                if (tickets == null || !tickets.Any())
                {
                    return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                        new List<TicketResponseDto>(), "No tickets found");
                }
                
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Tickets retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllTicketsAsync: {Message}", ex.Message);
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    $"An error occurred while retrieving tickets: {ex.Message}", 400);
            }
        }

        // ================ GET TICKET BY ID ================
        public async Task<ApiResponse<TicketResponseDto>> GetTicketByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Getting ticket with ID: {TicketId}", id);
                
                var ticket = await _ticketRepository.GetTicketWithDetailsAsync(id);
                if (ticket == null)
                {
                    return ApiResponse<TicketResponseDto>.ErrorResponse(
                        $"Ticket with ID {id} not found", 404);
                }

                return ApiResponse<TicketResponseDto>.SuccessResponse(
                    MapToTicketResponseDto(ticket), "Ticket retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ticket with ID: {TicketId}", id);
                return ApiResponse<TicketResponseDto>.ErrorResponse(
                    "An error occurred while retrieving the ticket", 400);
            }
        }

        // ================ CREATE TICKET ================
        public async Task<ApiResponse<TicketResponseDto>> CreateTicketAsync(CreateTicketDto createDto)
        {
            try
            {
                _logger.LogInformation("Creating ticket for customer ID: {CustomerId}", createDto.CustomerID);

                // Validate customer exists
                var customer = await _customerRepository.GetByIdAsync(createDto.CustomerID);
                if (customer == null)
                {
                    return ApiResponse<TicketResponseDto>.ErrorResponse(
                        $"Customer with ID {createDto.CustomerID} not found", 404);
                }

                // Check for duplicate ticket
                var isDuplicate = await _ticketRepository.IsDuplicateTicketAsync(
                    createDto.CustomerID, createDto.Subject);
                
                if (isDuplicate)
                {
                    return ApiResponse<TicketResponseDto>.ErrorResponse(
                        "Duplicate ticket: Same customer already has an open ticket with similar subject within 24 hours", 409);
                }

                // Validate agent if provided
                if (createDto.AgentID.HasValue)
                {
                    var agent = await _agentRepository.GetByIdAsync(createDto.AgentID.Value);
                    if (agent == null)
                    {
                        return ApiResponse<TicketResponseDto>.ErrorResponse(
                            $"Agent with ID {createDto.AgentID} not found", 404);
                    }
                }

                // Create ticket
                var ticket = new Ticket
                {
                    CustomerID = createDto.CustomerID,
                    AgentID = createDto.AgentID,
                    CategoryID = createDto.CategoryID,
                    Subject = createDto.Subject.Trim(),
                    Description = createDto.Description.Trim(),
                    Status = TicketStatus.Open,
                    Priority = createDto.Priority,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _ticketRepository.AddAsync(ticket);
                _logger.LogInformation("Created new ticket with ID: {TicketId}", created.TicketID);

                return await GetTicketByIdAsync(created.TicketID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ticket");
                return ApiResponse<TicketResponseDto>.ErrorResponse(
                    "An error occurred while creating the ticket", 400);
            }
        }

        // ================ GET TICKETS BY CUSTOMER ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByCustomerAsync(int customerId)
        {
            try
            {
                var customer = await _customerRepository.GetByIdAsync(customerId);
                if (customer == null)
                {
                    return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                        $"Customer with ID {customerId} not found", 404);
                }

                var tickets = await _ticketRepository.GetTicketsByCustomerAsync(customerId);
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Customer tickets retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tickets for customer ID: {CustomerId}", customerId);
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving customer tickets", 400);
            }
        }

        // ================ GET TICKETS BY AGENT ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByAgentAsync(int agentId)
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
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Agent tickets retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tickets for agent ID: {AgentId}", agentId);
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving agent tickets", 400);
            }
        }

        // ================ GET TICKETS BY STATUS ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByStatusAsync(TicketStatus status)
        {
            try
            {
                var tickets = await _ticketRepository.GetTicketsByStatusAsync(status);
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, $"Tickets with status {status} retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tickets by status: {Status}", status);
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving tickets", 400);
            }
        }

        // ================ GET TICKETS BY PRIORITY ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByPriorityAsync(TicketPriority priority)
        {
            try
            {
                var tickets = await _ticketRepository.GetTicketsByPriorityAsync(priority);
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, $"Tickets with priority {priority} retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tickets by priority: {Priority}", priority);
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving tickets", 400);
            }
        }

        // ================ GET TICKETS BY DATE RANGE ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetTicketsByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var tickets = await _ticketRepository.GetTicketsByDateRangeAsync(fromDate, toDate);
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Tickets retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tickets by date range");
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving tickets", 400);
            }
        }

        // ================ UPDATE TICKET STATUS (FIXED VERSION) ================
        public async Task<ApiResponse<TicketResponseDto>> UpdateTicketStatusAsync(int ticketId, UpdateTicketStatusDto statusDto)
        {
            try
            {
                _logger.LogInformation("Updating ticket {TicketId} status to {NewStatus}", ticketId, statusDto.NewStatus);

                // Get the ticket
                var ticket = await _ticketRepository.GetTicketWithDetailsAsync(ticketId);
                if (ticket == null)
                {
                    return ApiResponse<TicketResponseDto>.ErrorResponse(
                        $"Ticket with ID {ticketId} not found", 404);
                }

                // Validate status transition
                if (!IsValidStatusTransition(ticket.Status, statusDto.NewStatus))
                {
                    return ApiResponse<TicketResponseDto>.ErrorResponse(
                        $"Invalid status transition from {ticket.Status} to {statusDto.NewStatus}", 400);
                }

                // Store old status for logging
                var oldStatus = ticket.Status;
                
                // Update status
                ticket.Status = statusDto.NewStatus;

                // If ticket is being resolved or closed, set ResolvedAt
                if (statusDto.NewStatus == TicketStatus.Resolved || 
                    statusDto.NewStatus == TicketStatus.Closed)
                {
                    ticket.ResolvedAt = DateTime.UtcNow;
                    _logger.LogInformation("Ticket {TicketId} {Action} at {Time}", 
                        ticketId, 
                        statusDto.NewStatus == TicketStatus.Resolved ? "resolved" : "closed",
                        ticket.ResolvedAt);
                }

                // Save changes - UpdatedAt will be set in the repository
                await _ticketRepository.UpdateAsync(ticket);
                
                _logger.LogInformation("Successfully updated ticket {TicketId} status from {OldStatus} to {NewStatus}", 
                    ticketId, oldStatus, statusDto.NewStatus);

                // Return updated ticket
                return await GetTicketByIdAsync(ticketId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ticket status for ID: {TicketId}", ticketId);
                return ApiResponse<TicketResponseDto>.ErrorResponse(
                    $"Error updating ticket status: {ex.Message}", 400);
            }
        }

        // ================ ASSIGN TICKET TO AGENT ================
        public async Task<ApiResponse<TicketResponseDto>> AssignTicketAsync(int ticketId, AssignTicketDto assignDto)
        {
            try
            {
                _logger.LogInformation("Assigning ticket {TicketId} to agent {AgentId}", ticketId, assignDto.AgentID);

                var ticket = await _ticketRepository.GetTicketWithDetailsAsync(ticketId);
                if (ticket == null)
                {
                    return ApiResponse<TicketResponseDto>.ErrorResponse(
                        $"Ticket with ID {ticketId} not found", 404);
                }

                // Validate agent exists
                var agent = await _agentRepository.GetByIdAsync(assignDto.AgentID);
                if (agent == null)
                {
                    return ApiResponse<TicketResponseDto>.ErrorResponse(
                        $"Agent with ID {assignDto.AgentID} not found", 404);
                }

                // Assign agent
                ticket.AgentID = assignDto.AgentID;
                
                // If ticket was Open, change to InProgress when assigned
                if (ticket.Status == TicketStatus.Open)
                {
                    ticket.Status = TicketStatus.InProgress;
                }

                await _ticketRepository.UpdateAsync(ticket);
                _logger.LogInformation("Assigned ticket {TicketId} to agent {AgentId}", 
                    ticketId, assignDto.AgentID);

                return await GetTicketByIdAsync(ticketId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning ticket ID: {TicketId} to agent", ticketId);
                return ApiResponse<TicketResponseDto>.ErrorResponse(
                    "An error occurred while assigning the ticket", 400);
            }
        }

        // ================ GET TICKET SUMMARY ================
        public async Task<ApiResponse<Dictionary<string, int>>> GetTicketSummaryAsync()
        {
            try
            {
                var summary = await _ticketRepository.GetTicketStatusSummaryAsync();
                var stringSummary = summary.ToDictionary(
                    kvp => kvp.Key.ToString(), 
                    kvp => kvp.Value);

                return ApiResponse<Dictionary<string, int>>.SuccessResponse(
                    stringSummary, "Ticket summary retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ticket summary");
                return ApiResponse<Dictionary<string, int>>.ErrorResponse(
                    "An error occurred while retrieving ticket summary", 400);
            }
        }

        // ================ GET SLA REPORT ================
        public async Task<ApiResponse<IEnumerable<object>>> GetSLAReportAsync()
        {
            try
            {
                var tickets = await _ticketRepository.GetTicketsForSLAReportAsync();
                
                var reportData = tickets.Select(t => new
                {
                    t.TicketID,
                    t.Subject,
                    CustomerName = t.Customer?.FullName,
                    AgentName = t.Agent?.FullName,
                    Status = t.Status.ToString(),
                    Priority = t.Priority.ToString(),
                    t.CreatedAt,
                    ResolutionHours = Math.Round((DateTime.UtcNow - t.CreatedAt).TotalHours, 2),
                    SLAStatus = (DateTime.UtcNow - t.CreatedAt).TotalHours > 48 ? "BREACHED" : "OK"
                });

                return ApiResponse<IEnumerable<object>>.SuccessResponse(
                    reportData, "SLA report generated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SLA report");
                return ApiResponse<IEnumerable<object>>.ErrorResponse(
                    "An error occurred while generating SLA report", 400);
            }
        }

        // ================ GET OPEN TICKETS ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetOpenTicketsAsync()
        {
            try
            {
                var tickets = await _ticketRepository.GetOpenTicketsAsync();
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Open tickets retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting open tickets");
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving open tickets", 400);
            }
        }

        // ================ GET RESOLVED TICKETS ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetResolvedTicketsAsync()
        {
            try
            {
                var tickets = await _ticketRepository.GetResolvedTicketsAsync();
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Resolved tickets retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resolved tickets");
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving resolved tickets", 400);
            }
        }

        // ================ SEARCH TICKETS ================
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> SearchTicketsAsync(string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                        new List<TicketResponseDto>(), "No search term provided");
                }

                var tickets = await _ticketRepository.SearchTicketsAsync(searchTerm);
                var responseDtos = tickets.Select(t => MapToTicketResponseDto(t)).ToList();

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Search completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching tickets with term: {SearchTerm}", searchTerm);
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while searching tickets", 400);
            }
        }

        // ================ HELPER: VALIDATE STATUS TRANSITION ================
        private bool IsValidStatusTransition(TicketStatus currentStatus, TicketStatus newStatus)
        {
            // Same status is always valid (no change)
            if (currentStatus == newStatus)
                return true;
            
            // Define valid transitions
            return (currentStatus, newStatus) switch
            {
                // From Open
                (TicketStatus.Open, TicketStatus.InProgress) => true,
                (TicketStatus.Open, TicketStatus.OnHold) => true,
                (TicketStatus.Open, TicketStatus.Resolved) => true,  // Allow direct resolve
                (TicketStatus.Open, TicketStatus.Closed) => true,     // Allow direct close
                
                // From InProgress
                (TicketStatus.InProgress, TicketStatus.OnHold) => true,
                (TicketStatus.InProgress, TicketStatus.Resolved) => true,
                (TicketStatus.InProgress, TicketStatus.Closed) => true,
                
                // From OnHold
                (TicketStatus.OnHold, TicketStatus.InProgress) => true,
                (TicketStatus.OnHold, TicketStatus.Resolved) => true,
                (TicketStatus.OnHold, TicketStatus.Closed) => true,
                
                // From Resolved
                (TicketStatus.Resolved, TicketStatus.Closed) => true,
                (TicketStatus.Resolved, TicketStatus.InProgress) => true, // Reopen
                
                // From Closed
                (TicketStatus.Closed, TicketStatus.InProgress) => true, // Reopen
                
                // All other transitions are invalid
                _ => false
            };
        }

        // ================ HELPER: MAP TICKET TO DTO ================
        private TicketResponseDto MapToTicketResponseDto(Ticket ticket)
        {
            try
            {
                return new TicketResponseDto
                {
                    TicketID = ticket.TicketID,
                    CustomerID = ticket.CustomerID,
                    CustomerName = ticket.Customer?.FullName ?? "Unknown",
                    CustomerEmail = ticket.Customer?.Email,
                    AgentID = ticket.AgentID,
                    AgentName = ticket.Agent?.FullName ?? "Unassigned",
                    AgentDepartment = ticket.Agent?.Department,
                    CategoryID = ticket.CategoryID,
                    CategoryName = ticket.Category?.CategoryName ?? "Unknown",
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error mapping ticket {TicketId}: {Message}", ticket.TicketID, ex.Message);
                throw;
            }
        }
    }
}