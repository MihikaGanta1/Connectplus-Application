using Microsoft.AspNetCore.Mvc;
using ConnectplusBackend.DTOs;              // Changed
using ConnectplusBackend.Services.Interfaces; // Changed
using ConnectplusBackend.Utils;               // Changed

namespace ConnectplusBackend.Controllers       // Changed
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgentsController : ControllerBase
    {
        private readonly IAgentService _agentService;

        public AgentsController(IAgentService agentService)
        {
            _agentService = agentService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<AgentResponseDto>>>> GetAllAgents()
        {
            var response = await _agentService.GetAllAgentsAsync();
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<AgentResponseDto>>> GetAgentById(int id)
        {
            var response = await _agentService.GetAgentByIdAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<AgentResponseDto>>> CreateAgent([FromBody] CreateAgentDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _agentService.CreateAgentAsync(createDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<AgentResponseDto>>> UpdateAgent(int id, [FromBody] UpdateAgentDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            updateDto.AgentID = id;
            var response = await _agentService.UpdateAgentAsync(updateDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteAgent(int id)
        {
            var response = await _agentService.DeleteAgentAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("{id}/tickets")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetAgentTickets(int id)
        {
            var response = await _agentService.GetAgentTicketsAsync(id);
            return StatusCode(response.StatusCode, response);
        }
    }
}