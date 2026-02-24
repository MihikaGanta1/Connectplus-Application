using System.ComponentModel.DataAnnotations;

namespace ConnectplusBackend.DTOs
{
    public class CreateCustomerDto
    {
        [Required(ErrorMessage = "Full name is required")]
        [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(150, ErrorMessage = "Email cannot exceed 150 characters")]
        public string Email { get; set; }

        [MaxLength(20, ErrorMessage = "Phone cannot exceed 20 characters")]
        public string Phone { get; set; }

        [MaxLength(255, ErrorMessage = "Address cannot exceed 255 characters")]
        public string Address { get; set; }
    }

    public class UpdateCustomerDto
    {
        [Required(ErrorMessage = "Customer ID is required")]
        public int CustomerID { get; set; }

        [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string FullName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(150, ErrorMessage = "Email cannot exceed 150 characters")]
        public string Email { get; set; }

        [MaxLength(20, ErrorMessage = "Phone cannot exceed 20 characters")]
        public string Phone { get; set; }

        [MaxLength(255, ErrorMessage = "Address cannot exceed 255 characters")]
        public string Address { get; set; }

        public bool? IsActive { get; set; }
    }

    public class CustomerResponseDto
    {
        public int CustomerID { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int TicketCount { get; set; }
    }
}