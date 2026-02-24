using System.ComponentModel.DataAnnotations;

namespace ConnectplusBackend.DTOs
{
    public class CreateAgentDto
    {
        [Required(ErrorMessage = "Full name is required")]
        [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(150, ErrorMessage = "Email cannot exceed 150 characters")]
        public string Email { get; set; }

        [MaxLength(100, ErrorMessage = "Department cannot exceed 100 characters")]
        public string Department { get; set; }

        [MaxLength(50, ErrorMessage = "Role cannot exceed 50 characters")]
        public string Role { get; set; }
    }

    public class UpdateAgentDto
    {
        [Required(ErrorMessage = "Agent ID is required")]
        public int AgentID { get; set; }

        [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string FullName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(150, ErrorMessage = "Email cannot exceed 150 characters")]
        public string Email { get; set; }

        [MaxLength(100, ErrorMessage = "Department cannot exceed 100 characters")]
        public string Department { get; set; }

        [MaxLength(50, ErrorMessage = "Role cannot exceed 50 characters")]
        public string Role { get; set; }

        public bool? IsActive { get; set; }
    }

    public class AgentResponseDto
    {
        public int AgentID { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int AssignedTickets { get; set; }
        public int ResolvedTickets { get; set; }
    }
}