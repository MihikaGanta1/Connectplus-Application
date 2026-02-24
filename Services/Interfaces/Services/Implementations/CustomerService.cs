using ConnectplusBackend.DTOs;
using ConnectplusBackend.Models;
using ConnectplusBackend.Models.Enums;
using ConnectplusBackend.Repositories.Interfaces;
using ConnectplusBackend.Services.Interfaces;
using ConnectplusBackend.Utils;

namespace ConnectplusBackend.Services.Implementations
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ITicketRepository _ticketRepository;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(
            ICustomerRepository customerRepository,
            ITicketRepository ticketRepository,
            ILogger<CustomerService> logger)
        {
            _customerRepository = customerRepository;
            _ticketRepository = ticketRepository;
            _logger = logger;
        }

        // GET ALL CUSTOMERS
        public async Task<ApiResponse<IEnumerable<CustomerResponseDto>>> GetAllCustomersAsync()
        {
            try
            {
                var customers = await _customerRepository.GetAllAsync();
                var responseDtos = new List<CustomerResponseDto>();

                foreach (var customer in customers)
                {
                    var ticketCount = await _customerRepository.GetTicketCountAsync(customer.CustomerID);
                    responseDtos.Add(MapToResponseDto(customer, ticketCount));
                }

                return ApiResponse<IEnumerable<CustomerResponseDto>>.SuccessResponse(
                    responseDtos.OrderBy(c => c.FullName),
                    "Customers retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all customers");
                return ApiResponse<IEnumerable<CustomerResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving customers");
            }
        }

        // GET CUSTOMER BY ID
        public async Task<ApiResponse<CustomerResponseDto>> GetCustomerByIdAsync(int id)
        {
            try
            {
                var customer = await _customerRepository.GetByIdAsync(id);
                if (customer == null)
                {
                    return ApiResponse<CustomerResponseDto>.ErrorResponse(
                        $"Customer with ID {id} not found", 404);
                }

                var ticketCount = await _customerRepository.GetTicketCountAsync(id);
                return ApiResponse<CustomerResponseDto>.SuccessResponse(
                    MapToResponseDto(customer, ticketCount),
                    "Customer retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer with ID: {CustomerId}", id);
                return ApiResponse<CustomerResponseDto>.ErrorResponse(
                    "An error occurred while retrieving the customer");
            }
        }

        // CREATE CUSTOMER
        public async Task<ApiResponse<CustomerResponseDto>> CreateCustomerAsync(CreateCustomerDto createDto)
        {
            try
            {
                // Check for duplicate email
                var isEmailUnique = await _customerRepository.IsEmailUniqueAsync(createDto.Email);
                if (!isEmailUnique)
                {
                    return ApiResponse<CustomerResponseDto>.ErrorResponse(
                        $"Customer with email {createDto.Email} already exists", 409);
                }

                // Create customer
                var customer = new Customer
                {
                    FullName = createDto.FullName.Trim(),
                    Email = createDto.Email.ToLower().Trim(),
                    Phone = createDto.Phone?.Trim(),
                    Address = createDto.Address?.Trim(),
                    IsActive = true
                };

                var created = await _customerRepository.AddAsync(customer);
                _logger.LogInformation("Created new customer with ID: {CustomerId}", created.CustomerID);

                return await GetCustomerByIdAsync(created.CustomerID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating customer");
                return ApiResponse<CustomerResponseDto>.ErrorResponse(
                    "An error occurred while creating the customer");
            }
        }

        // UPDATE CUSTOMER
        public async Task<ApiResponse<CustomerResponseDto>> UpdateCustomerAsync(UpdateCustomerDto updateDto)
        {
            try
            {
                var existingCustomer = await _customerRepository.GetByIdAsync(updateDto.CustomerID);
                if (existingCustomer == null)
                {
                    return ApiResponse<CustomerResponseDto>.ErrorResponse(
                        $"Customer with ID {updateDto.CustomerID} not found", 404);
                }

                // Check email uniqueness if changed
                if (!string.IsNullOrWhiteSpace(updateDto.Email) && 
                    existingCustomer.Email.ToLower() != updateDto.Email.ToLower())
                {
                    var isEmailUnique = await _customerRepository.IsEmailUniqueAsync(
                        updateDto.Email, updateDto.CustomerID);
                    if (!isEmailUnique)
                    {
                        return ApiResponse<CustomerResponseDto>.ErrorResponse(
                            $"Customer with email {updateDto.Email} already exists", 409);
                    }
                    existingCustomer.Email = updateDto.Email.ToLower().Trim();
                }

                // Update fields if provided
                if (!string.IsNullOrWhiteSpace(updateDto.FullName))
                    existingCustomer.FullName = updateDto.FullName.Trim();

                if (updateDto.Phone != null)
                    existingCustomer.Phone = string.IsNullOrWhiteSpace(updateDto.Phone) ? null : updateDto.Phone.Trim();

                if (updateDto.Address != null)
                    existingCustomer.Address = string.IsNullOrWhiteSpace(updateDto.Address) ? null : updateDto.Address.Trim();

                if (updateDto.IsActive.HasValue)
                    existingCustomer.IsActive = updateDto.IsActive.Value;

                await _customerRepository.UpdateAsync(existingCustomer);
                _logger.LogInformation("Updated customer with ID: {CustomerId}", existingCustomer.CustomerID);

                return await GetCustomerByIdAsync(existingCustomer.CustomerID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer with ID: {CustomerId}", updateDto.CustomerID);
                return ApiResponse<CustomerResponseDto>.ErrorResponse(
                    "An error occurred while updating the customer");
            }
        }

        // DELETE CUSTOMER (Soft Delete)
        public async Task<ApiResponse<bool>> DeleteCustomerAsync(int id)
        {
            try
            {
                var customer = await _customerRepository.GetByIdAsync(id);
                if (customer == null)
                {
                    return ApiResponse<bool>.ErrorResponse(
                        $"Customer with ID {id} not found", 404);
                }

                // Soft delete - just deactivate
                customer.IsActive = false;
                await _customerRepository.UpdateAsync(customer);
                
                _logger.LogInformation("Deactivated customer with ID: {CustomerId}", id);
                return ApiResponse<bool>.SuccessResponse(true, "Customer deactivated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting customer with ID: {CustomerId}", id);
                return ApiResponse<bool>.ErrorResponse("An error occurred while deleting the customer");
            }
        }

        // GET CUSTOMER TICKETS
        public async Task<ApiResponse<IEnumerable<TicketResponseDto>>> GetCustomerTicketsAsync(int customerId)
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
                var responseDtos = tickets.Select(MapToTicketResponseDto);

                return ApiResponse<IEnumerable<TicketResponseDto>>.SuccessResponse(
                    responseDtos, "Customer tickets retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tickets for customer ID: {CustomerId}", customerId);
                return ApiResponse<IEnumerable<TicketResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving customer tickets");
            }
        }

        // GET ACTIVE CUSTOMERS
        public async Task<ApiResponse<IEnumerable<CustomerResponseDto>>> GetActiveCustomersAsync()
        {
            try
            {
                var customers = await _customerRepository.GetActiveCustomersAsync();
                var responseDtos = new List<CustomerResponseDto>();

                foreach (var customer in customers)
                {
                    var ticketCount = await _customerRepository.GetTicketCountAsync(customer.CustomerID);
                    responseDtos.Add(MapToResponseDto(customer, ticketCount));
                }

                return ApiResponse<IEnumerable<CustomerResponseDto>>.SuccessResponse(
                    responseDtos, "Active customers retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active customers");
                return ApiResponse<IEnumerable<CustomerResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving active customers");
            }
        }

        // CHECK IF EMAIL EXISTS
        public async Task<ApiResponse<bool>> CheckEmailExistsAsync(string email)
        {
            try
            {
                var customer = await _customerRepository.GetCustomerByEmailAsync(email);
                return ApiResponse<bool>.SuccessResponse(
                    customer != null, "Email check completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking email: {Email}", email);
                return ApiResponse<bool>.ErrorResponse(
                    "An error occurred while checking email");
            }
        }

        // GET CUSTOMER BY EMAIL
        public async Task<ApiResponse<CustomerResponseDto>> GetCustomerByEmailAsync(string email)
        {
            try
            {
                var customer = await _customerRepository.GetCustomerByEmailAsync(email);
                if (customer == null)
                {
                    return ApiResponse<CustomerResponseDto>.ErrorResponse(
                        $"Customer with email {email} not found", 404);
                }

                var ticketCount = await _customerRepository.GetTicketCountAsync(customer.CustomerID);
                return ApiResponse<CustomerResponseDto>.SuccessResponse(
                    MapToResponseDto(customer, ticketCount),
                    "Customer retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer by email: {Email}", email);
                return ApiResponse<CustomerResponseDto>.ErrorResponse(
                    "An error occurred while retrieving the customer");
            }
        }

        // GET CUSTOMERS WITH TICKET COUNT
        public async Task<ApiResponse<IEnumerable<CustomerResponseDto>>> GetCustomersWithTicketCountAsync()
        {
            try
            {
                var customers = await _customerRepository.GetCustomersWithTicketsAsync();
                var responseDtos = new List<CustomerResponseDto>();

                foreach (var customer in customers)
                {
                    var ticketCount = customer.Tickets?.Count ?? 0;
                    responseDtos.Add(MapToResponseDto(customer, ticketCount));
                }

                return ApiResponse<IEnumerable<CustomerResponseDto>>.SuccessResponse(
                    responseDtos.OrderByDescending(c => c.TicketCount),
                    "Customers with ticket count retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customers with ticket count");
                return ApiResponse<IEnumerable<CustomerResponseDto>>.ErrorResponse(
                    "An error occurred while retrieving customers");
            }
        }

        // Helper method to map Customer to CustomerResponseDto
        private CustomerResponseDto MapToResponseDto(Customer customer, int ticketCount)
        {
            return new CustomerResponseDto
            {
                CustomerID = customer.CustomerID,
                FullName = customer.FullName,
                Email = customer.Email,
                Phone = customer.Phone,
                Address = customer.Address,
                CreatedAt = customer.CreatedAt,
                IsActive = customer.IsActive,
                TicketCount = ticketCount
            };
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