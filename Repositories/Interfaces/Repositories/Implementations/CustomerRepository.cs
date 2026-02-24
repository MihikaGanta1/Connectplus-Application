using Microsoft.EntityFrameworkCore;
using ConnectplusBackend.Data;
using ConnectplusBackend.Models;
using ConnectplusBackend.Repositories.Interfaces;

namespace ConnectplusBackend.Repositories.Implementations
{
    public class CustomerRepository : BaseRepository<Customer>, ICustomerRepository
    {
        public CustomerRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Customer> GetCustomerByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<Customer>> GetActiveCustomersAsync()
        {
            return await _dbSet
                .Where(c => c.IsActive)
                .OrderBy(c => c.FullName)
                .ToListAsync();
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeCustomerId = null)
        {
            var query = _dbSet.Where(c => c.Email.ToLower() == email.ToLower());
            
            if (excludeCustomerId.HasValue)
            {
                query = query.Where(c => c.CustomerID != excludeCustomerId.Value);
            }

            return !await query.AnyAsync();
        }

        public async Task<int> GetTicketCountAsync(int customerId)
        {
            return await _context.Tickets
                .Where(t => t.CustomerID == customerId)
                .CountAsync();
        }

        public async Task<IEnumerable<Customer>> GetCustomersWithTicketsAsync()
        {
            return await _dbSet
                .Include(c => c.Tickets)
                .OrderBy(c => c.FullName)
                .ToListAsync();
        }

        public override async Task<Customer> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(c => c.Tickets)
                .FirstOrDefaultAsync(c => c.CustomerID == id);
        }
    }
}