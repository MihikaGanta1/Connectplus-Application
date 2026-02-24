using Microsoft.AspNetCore.Mvc;
using ConnectplusBackend.DTOs;              // Changed
using ConnectplusBackend.Services.Interfaces; // Changed
using ConnectplusBackend.Utils;               // Changed

namespace ConnectplusBackend.Controllers       // Changed
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<CustomerResponseDto>>>> GetAllCustomers()
        {
            var response = await _customerService.GetAllCustomersAsync();
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CustomerResponseDto>>> GetCustomerById(int id)
        {
            var response = await _customerService.GetCustomerByIdAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<CustomerResponseDto>>> CreateCustomer([FromBody] CreateCustomerDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _customerService.CreateCustomerAsync(createDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CustomerResponseDto>>> UpdateCustomer(int id, [FromBody] UpdateCustomerDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            updateDto.CustomerID = id;
            var response = await _customerService.UpdateCustomerAsync(updateDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCustomer(int id)
        {
            var response = await _customerService.DeleteCustomerAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("{id}/tickets")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TicketResponseDto>>>> GetCustomerTickets(int id)
        {
            var response = await _customerService.GetCustomerTicketsAsync(id);
            return StatusCode(response.StatusCode, response);
        }
    }
}