using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConnectplusBackend.Models.Enums;

namespace ConnectplusBackend.Models
{
    [Table("Tickets")]
    public class Ticket
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TicketID { get; set; }

        [Required]
        public int CustomerID { get; set; }

        public int? AgentID { get; set; }

        [Required]
        public int CategoryID { get; set; }

        [Required]
        [MaxLength(200)]
        public string Subject { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public TicketStatus Status { get; set; }      // Enum type

        [Required]
        public TicketPriority Priority { get; set; }  // Enum type

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ResolvedAt { get; set; }

        // Navigation properties
        [ForeignKey("CustomerID")]
        public virtual Customer Customer { get; set; }

        [ForeignKey("AgentID")]
        public virtual Agent Agent { get; set; }

        [ForeignKey("CategoryID")]
        public virtual TicketCategory Category { get; set; }
    }
}