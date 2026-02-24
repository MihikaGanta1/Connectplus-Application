using System.ComponentModel.DataAnnotations;
using ConnectplusBackend.Models.Enums;

namespace ConnectplusBackend.DTOs
{
    public class CreateTicketDto
    {
        [Required(ErrorMessage = "Customer ID is required")]
        public int CustomerID { get; set; }

        public int? AgentID { get; set; }

        [Required(ErrorMessage = "Category ID is required")]
        public int CategoryID { get; set; }

        [Required(ErrorMessage = "Subject is required")]
        [MaxLength(200, ErrorMessage = "Subject cannot exceed 200 characters")]
        public string Subject { get; set; }

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Priority is required")]
        public TicketPriority Priority { get; set; }
    }

    public class UpdateTicketStatusDto
    {
        [Required(ErrorMessage = "New status is required")]
        public TicketStatus NewStatus { get; set; }

        [MaxLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string Notes { get; set; }
    }

    public class AssignTicketDto
    {
        [Required(ErrorMessage = "Agent ID is required")]
        public int AgentID { get; set; }
    }

    public class TicketResponseDto
    {
        public int TicketID { get; set; }
        public int CustomerID { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public int? AgentID { get; set; }
        public string AgentName { get; set; }
        public string AgentDepartment { get; set; }
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int StatusValue { get; set; }
        public string Priority { get; set; }
        public int PriorityValue { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public double? ResolutionHours { get; set; }
    }
}