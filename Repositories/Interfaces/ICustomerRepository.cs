using ConnectplusBackend.Models;

namespace ConnectplusBackend.Repositories.Interfaces
{
    public interface ICustomerRepository : IRepository<Customer>
    {
        Task<Customer> GetCustomerByEmailAsync(string email);
        Task<IEnumerable<Customer>> GetActiveCustomersAsync();
        Task<bool> IsEmailUniqueAsync(string email, int? excludeCustomerId = null);
        Task<int> GetTicketCountAsync(int customerId);
        Task<IEnumerable<Customer>> GetCustomersWithTicketsAsync();
    }
}