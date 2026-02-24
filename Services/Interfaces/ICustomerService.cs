using ConnectplusBackend.DTOs;
using ConnectplusBackend.Utils;

namespace ConnectplusBackend.Services.Interfaces
{
    public interface ICustomerService
    {
        // Basic CRUD
        Task<ApiResponse<IEnumerable<CustomerResponseDto>>> GetAllCustomersAsync();
        Task<ApiResponse<CustomerResponseDto>> GetCustomerByIdAsync(int id);
        Task<ApiResponse<CustomerResponseDto>> CreateCustomerAsync(CreateCustomerDto createDto);
        Task<ApiResponse<CustomerResponseDto>> UpdateCustomerAsync(UpdateCustomerDto updateDto);
        Task<ApiResponse<bool>> DeleteCustomerAsync(int id);
        
        // Additional methods
        Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetCustomerTicketsAsync(int customerId);
        Task<ApiResponse<IEnumerable<CustomerResponseDto>>> GetActiveCustomersAsync();
        Task<ApiResponse<bool>> CheckEmailExistsAsync(string email);
        Task<ApiResponse<CustomerResponseDto>> GetCustomerByEmailAsync(string email);
        Task<ApiResponse<IEnumerable<CustomerResponseDto>>> GetCustomersWithTicketCountAsync();
    }
}