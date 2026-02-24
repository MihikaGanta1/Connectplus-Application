using Microsoft.AspNetCore.Mvc;
using ConnectplusBackend.DTOs;
using ConnectplusBackend.Services.Interfaces;
using ConnectplusBackend.Models.Enums;
using ConnectplusBackend.Utils;

namespace ConnectplusBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;
        private readonly ILogger<TicketsController> _logger;

        public TicketsController(ITicketService ticketService, ILogger<TicketsController> logger)
        {
            _ticketService = ticketService;
            _logger = logger;
        }

        // GET: api/tickets
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetAllTickets()
        {
            try
            {
                _logger.LogInformation("Fetching all tickets");
                var response = await _ticketService.GetAllTicketsAsync();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all tickets");
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TicketResponseDto>>> GetTicketById(int id)
        {
            try
            {
                _logger.LogInformation("Fetching ticket with ID: {TicketId}", id);
                var response = await _ticketService.GetTicketByIdAsync(id);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ticket with ID: {TicketId}", id);
                return StatusCode(500, ApiResponse<TicketResponseDto>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/customer/5
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetTicketsByCustomer(int customerId)
        {
            try
            {
                _logger.LogInformation("Fetching tickets for customer ID: {CustomerId}", customerId);
                var response = await _ticketService.GetTicketsByCustomerAsync(customerId);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tickets for customer ID: {CustomerId}", customerId);
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/agent/5
        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetTicketsByAgent(int agentId)
        {
            try
            {
                _logger.LogInformation("Fetching tickets for agent ID: {AgentId}", agentId);
                var response = await _ticketService.GetTicketsByAgentAsync(agentId);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tickets for agent ID: {AgentId}", agentId);
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/status/Open
        [HttpGet("status/{status}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetTicketsByStatus(string status)
        {
            try
            {
                _logger.LogInformation("Fetching tickets with status: {Status}", status);

                if (!Enum.TryParse<TicketStatus>(status, true, out var statusEnum))
                {
                    return BadRequest(ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                        "Invalid status value. Valid values: Open, InProgress, OnHold, Resolved, Closed", 400));
                }

                var response = await _ticketService.GetTicketsByStatusAsync(statusEnum);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tickets with status: {Status}", status);
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/priority/High
        [HttpGet("priority/{priority}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetTicketsByPriority(string priority)
        {
            try
            {
                _logger.LogInformation("Fetching tickets with priority: {Priority}", priority);

                if (!Enum.TryParse<TicketPriority>(priority, true, out var priorityEnum))
                {
                    return BadRequest(ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                        "Invalid priority value. Valid values: Low, Medium, High, Critical", 400));
                }

                var response = await _ticketService.GetTicketsByPriorityAsync(priorityEnum);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tickets with priority: {Priority}", priority);
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/summary
        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<Dictionary<string, int>>>> GetTicketSummary()
        {
            try
            {
                _logger.LogInformation("Fetching ticket summary");
                var response = await _ticketService.GetTicketSummaryAsync();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ticket summary");
                return StatusCode(500, ApiResponse<Dictionary<string, int>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/sla-report
        [HttpGet("sla-report")]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetSLAReport()
        {
            try
            {
                _logger.LogInformation("Generating SLA report");
                var response = await _ticketService.GetSLAReportAsync();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SLA report");
                return StatusCode(500, ApiResponse<IEnumerable<object>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/open
        [HttpGet("open")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetOpenTickets()
        {
            try
            {
                _logger.LogInformation("Fetching open tickets");
                var response = await _ticketService.GetOpenTicketsAsync();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching open tickets");
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/resolved
        [HttpGet("resolved")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetResolvedTickets()
        {
            try
            {
                _logger.LogInformation("Fetching resolved tickets");
                var response = await _ticketService.GetResolvedTicketsAsync();
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching resolved tickets");
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/daterange?from=2024-01-01&to=2024-12-31
        [HttpGet("daterange")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetTicketsByDateRange(
            [FromQuery] DateTime fromDate, 
            [FromQuery] DateTime toDate)
        {
            try
            {
                _logger.LogInformation("Fetching tickets from {FromDate} to {ToDate}", fromDate, toDate);

                if (fromDate > toDate)
                {
                    return BadRequest(ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                        "FromDate cannot be after ToDate", 400));
                }

                var response = await _ticketService.GetTicketsByDateRangeAsync(fromDate, toDate);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tickets by date range");
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // POST: api/tickets
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TicketResponseDto>>> CreateTicket([FromBody] CreateTicketDto createDto)
        {
            try
            {
                _logger.LogInformation("Creating new ticket for customer ID: {CustomerId}", createDto?.CustomerID);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<TicketResponseDto>.ErrorResponse(
                        "Invalid data", 400));
                }

                var response = await _ticketService.CreateTicketAsync(createDto);
                
                if (response.Success && response.StatusCode == 201)
                {
                    return CreatedAtAction(nameof(GetTicketById), 
                        new { id = response.Data?.TicketID }, response);
                }
                
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ticket");
                return StatusCode(500, ApiResponse<TicketResponseDto>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // PUT: api/tickets/5/status
       [HttpPut("{id}/status")]
public async Task<ActionResult<ApiResponse<TicketResponseDto>>> UpdateTicketStatus(
    int id,
    [FromBody] UpdateTicketStatusDto statusDto)
{
    try
    {
        _logger.LogInformation("Updating status for ticket ID: {TicketId} to {NewStatus}", id, statusDto?.NewStatus);

        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<TicketResponseDto>.ErrorResponse(
                "Invalid data", 400));
        }

        var response = await _ticketService.UpdateTicketStatusAsync(id, statusDto);
        return StatusCode(response.StatusCode, response);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error updating status for ticket ID: {TicketId}", id);
        return StatusCode(500, ApiResponse<TicketResponseDto>.ErrorResponse(
            ex.Message, 500));
    }
}
[HttpPost("test-update/{id}")]
public async Task<ActionResult<ApiResponse<TicketResponseDto>>> TestUpdateStatus(
    int id, 
    [FromBody] int newStatus)
{
    try
    {
        _logger.LogInformation("TEST: Updating ticket {TicketId} to status {NewStatus}", id, newStatus);
        
        var dto = new UpdateTicketStatusDto
        {
            NewStatus = (TicketStatus)newStatus,
            Notes = "Test update"
        };
        
        var response = await _ticketService.UpdateTicketStatusAsync(id, dto);
        return StatusCode(response.StatusCode, response);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "TEST: Error updating ticket");
        return StatusCode(500, ApiResponse<TicketResponseDto>.ErrorResponse(ex.Message, 500));
    }
}

        // PUT: api/tickets/5/assign
        [HttpPut("{id}/assign")]
        public async Task<ActionResult<ApiResponse<TicketResponseDto>>> AssignTicket(
            int id,
            [FromBody] AssignTicketDto assignDto)
        {
            try
            {
                _logger.LogInformation("Assigning ticket ID: {TicketId} to agent ID: {AgentId}", id, assignDto?.AgentID);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<TicketResponseDto>.ErrorResponse(
                        "Invalid data", 400));
                }

                var response = await _ticketService.AssignTicketAsync(id, assignDto);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning ticket ID: {TicketId} to agent", id);
                return StatusCode(500, ApiResponse<TicketResponseDto>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        // GET: api/tickets/search?term=help
        [HttpGet("search")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> SearchTickets([FromQuery] string term)
        {
            try
            {
                _logger.LogInformation("Searching tickets with term: {Term}", term);

                if (string.IsNullOrWhiteSpace(term))
                {
                    return BadRequest(ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                        "Search term cannot be empty", 400));
                }

                var response = await _ticketService.SearchTicketsAsync(term);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching tickets with term: {Term}", term);
                return StatusCode(500, ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    ex.Message, 500));
            }
        }
    }
}