/* =============================================================================
   TICKET.JS — Ticket API Service
   =============================================================================
   TABLE OF CONTENTS:
   1.  Get All Tickets
   2.  Get Ticket By ID
   3.  Create Ticket
   4.  Update Ticket Status
   5.  Assign Ticket
   6.  Get Tickets By Customer
   7.  Get Tickets By Agent
   8.  Get Tickets By Status
   9.  Get Open Tickets
   10. Get Resolved Tickets
   11. Get Tickets By Date Range
   12. Search Tickets
   13. Get Ticket Summary      (dashboard)
   14. Get Dashboard Stats     (dashboard)
   15. Calculate SLA           (helper)
   16. Get Priority Distribution
   17. Get Category Distribution
   18. Get Agent Performance
   19. Get Weekly Trend
   20. Get SLA Report
   ============================================================================= */

console.log('📦 Loading Ticket Service...');

const ticketService = {

    // =========================================================================
    // 1. GET ALL TICKETS
    // =========================================================================
    async getAllTickets() {
        try {
            console.log('Fetching all tickets...');
            const response = await window.api.get('/tickets');
            return response.data || [];
        } catch (error) {
            console.error('Error fetching tickets:', error);
            if (window.utils) window.utils.showToast(error.message || 'Failed to fetch tickets', 'danger');
            return [];
        }
    },


    // =========================================================================
    // 2. GET TICKET BY ID
    // =========================================================================
    async getTicketById(id) {
        try {
            const response = await window.api.get(`/tickets/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket:', error);
            return null;
        }
    },


    // =========================================================================
    // 3. CREATE TICKET
    // =========================================================================
    async createTicket(ticketData) {
        try {
            console.log('Creating ticket with data:', ticketData);
            const response = await window.api.post('/tickets', ticketData);
            console.log('Create ticket response:', response);
            if (window.utils) window.utils.showToast('Ticket created successfully!', 'success');
            return response.data;
        } catch (error) {
            console.error('Error creating ticket:', error);
            if (window.utils) {
                const errorMsg = error.message || error.errors?.[0] || 'Failed to create ticket';
                window.utils.showToast(errorMsg, 'danger');
            }
            return null;
        }
    },


    // =========================================================================
    // 4. UPDATE TICKET STATUS
    // =========================================================================
    async updateTicketStatus(ticketId, statusData) {
        try {
            console.log('Updating ticket status:', ticketId, statusData);
            const response = await window.api.put(`/tickets/${ticketId}/status`, statusData);
            console.log('Update status response:', response);
            if (window.utils) window.utils.showToast('Ticket status updated!', 'success');
            return response.data;
        } catch (error) {
            console.error('Error updating ticket status:', error);
            if (window.utils) {
                // Prefer the first item in errors array, else fall back to message
                const errorMsg = error.errors?.length ? error.errors[0] : error.message || 'Failed to update status';
                window.utils.showToast(errorMsg, 'danger');
            }
            return null;
        }
    },


    // =========================================================================
    // 5. ASSIGN TICKET
    // =========================================================================
    async assignTicket(ticketId, assignData) {
        try {
            const response = await window.api.put(`/tickets/${ticketId}/assign`, assignData);
            if (window.utils) window.utils.showToast('Ticket assigned successfully!', 'success');
            return response.data;
        } catch (error) {
            console.error('Error assigning ticket:', error);
            return null;
        }
    },


    // =========================================================================
    // 6. GET TICKETS BY CUSTOMER
    // =========================================================================
    async getTicketsByCustomer(customerId) {
        try {
            const response = await window.api.get(`/tickets/customer/${customerId}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching customer tickets:', error);
            return [];
        }
    },


    // =========================================================================
    // 7. GET TICKETS BY AGENT
    // =========================================================================
    async getTicketsByAgent(agentId) {
        try {
            const response = await window.api.get(`/tickets/agent/${agentId}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching agent tickets:', error);
            return [];
        }
    },


    // =========================================================================
    // 8. GET TICKETS BY STATUS
    // =========================================================================
    async getTicketsByStatus(status) {
        try {
            const response = await window.api.get(`/tickets/status/${status}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching tickets by status:', error);
            return [];
        }
    },


    // =========================================================================
    // 9. GET OPEN TICKETS
    // =========================================================================
    async getOpenTickets() {
        try {
            const response = await window.api.get('/tickets/open');
            return response.data || [];
        } catch (error) {
            console.error('Error fetching open tickets:', error);
            // Fallback: filter locally
            const tickets = await this.getAllTickets();
            return tickets.filter((t) => t.status === 'Open' || t.status === 'InProgress');
        }
    },


    // =========================================================================
    // 10. GET RESOLVED TICKETS
    // =========================================================================
    async getResolvedTickets() {
        try {
            const response = await window.api.get('/tickets/resolved');
            return response.data || [];
        } catch (error) {
            console.error('Error fetching resolved tickets:', error);
            // Fallback: filter locally
            const tickets = await this.getAllTickets();
            return tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
        }
    },


    // =========================================================================
    // 11. GET TICKETS BY DATE RANGE
    // =========================================================================
    async getTicketsByDateRange(fromDate, toDate) {
        try {
            const response = await window.api.get(`/tickets/daterange?fromDate=${fromDate}&toDate=${toDate}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching tickets by date range:', error);
            return [];
        }
    },


    // =========================================================================
    // 12. SEARCH TICKETS
    // =========================================================================
    async searchTickets(searchTerm) {
        try {
            const response = await window.api.get(`/tickets/search?term=${encodeURIComponent(searchTerm)}`);
            return response.data || [];
        } catch (error) {
            console.error('Error searching tickets:', error);
            // Fallback: client-side search
            const tickets = await this.getAllTickets();
            const term    = searchTerm.toLowerCase();
            return tickets.filter((t) =>
                t.subject.toLowerCase().includes(term)                              ||
                t.description.toLowerCase().includes(term)                          ||
                (t.customerName && t.customerName.toLowerCase().includes(term))
            );
        }
    },


    // =========================================================================
    // 13. GET TICKET SUMMARY  (used by dashboard charts)
    // =========================================================================
    async getTicketSummary() {
        try {
            console.log('🔍 Fetching fresh ticket summary...');

            // ── Try the dedicated API endpoint first ──
            try {
                const response = await window.api.get('/tickets/summary');
                console.log('✅ Summary from API:', response.data);

                // Ensure all expected status keys are present
                const summary = {
                    Open:       response.data['Open']       || 0,
                    InProgress: response.data['InProgress'] || 0,
                    OnHold:     response.data['OnHold']     || 0,
                    Resolved:   response.data['Resolved']   || 0,
                    Closed:     response.data['Closed']     || 0,
                };

                console.log('📊 Processed summary:', summary);
                return summary;

            } catch (apiError) {
                // ── Fallback: calculate counts from the full ticket list ──
                console.log('⚠️ Summary API not available, calculating from tickets');

                const tickets = await this.getAllTickets();
                console.log('📋 All tickets:', tickets.length);

                const summary = { Open: 0, InProgress: 0, OnHold: 0, Resolved: 0, Closed: 0 };

                tickets.forEach((t) => {
                    const status = t.status;
                    console.log(`Ticket ${t.ticketID} status:`, status);

                    if      (summary.hasOwnProperty(status)) summary[status]++;
                    else if (status === 'In Progress')        summary.InProgress++;
                    else if (status === 'On Hold')            summary.OnHold++;
                    else                                      console.log('⚠️ Unknown status:', status);
                });

                console.log('📊 Calculated summary:', summary);
                return summary;
            }

        } catch (error) {
            console.error('❌ Error getting ticket summary:', error);
            return { Open: 0, InProgress: 0, OnHold: 0, Resolved: 0, Closed: 0 };
        }
    },


    // =========================================================================
    // 14. GET DASHBOARD STATS  (KPI cards)
    // =========================================================================
    async getDashboardStats() {
        try {
            const [tickets, customers] = await Promise.all([
                this.getAllTickets(),
                window.customerService.getAllCustomers(),
            ]);

            // Count tickets per status
            const openTickets       = tickets.filter((t) => t.status === 'Open').length;
            const inProgressTickets = tickets.filter((t) => t.status === 'InProgress').length;
            const onHoldTickets     = tickets.filter((t) => t.status === 'OnHold').length;
            const resolvedTickets   = tickets.filter((t) => t.status === 'Resolved').length;
            const closedTickets     = tickets.filter((t) => t.status === 'Closed').length;

            // Average resolution time (only tickets that have a recorded resolutionHours)
            const resolvedWithTime = tickets.filter((t) => t.resolutionHours);
            const avgResolution    = resolvedWithTime.length > 0
                ? (resolvedWithTime.reduce((sum, t) => sum + (t.resolutionHours || 0), 0) / resolvedWithTime.length).toFixed(1)
                : 0;

            return {
                totalTickets:       tickets.length,
                totalCustomers:     customers.length,
                openTickets,
                inProgressTickets,
                onHoldTickets,
                resolvedTickets,
                closedTickets,
                avgResolutionTime:  avgResolution,
                slaAdherence:       this.calculateSLA(tickets),
            };

        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            return {
                totalTickets: 0, totalCustomers: 0,
                openTickets: 0,  inProgressTickets: 0, onHoldTickets: 0,
                resolvedTickets: 0, closedTickets: 0,
                avgResolutionTime: 0, slaAdherence: 0,
            };
        }
    },


    // =========================================================================
    // 15. CALCULATE SLA  (helper used by getDashboardStats)
    // =========================================================================
    // Returns the percentage of resolved/closed tickets that were resolved within 24 hours
    calculateSLA(tickets) {
        const resolvedTickets = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
        if (resolvedTickets.length === 0) return 100;

        const withinSLA = resolvedTickets.filter((t) => (t.resolutionHours || 0) <= 24).length;
        return Math.round((withinSLA / resolvedTickets.length) * 100);
    },


    // =========================================================================
    // 16. GET PRIORITY DISTRIBUTION
    // =========================================================================
    async getPriorityDistribution() {
        try {
            const tickets      = await this.getAllTickets();
            const distribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };

            tickets.forEach((t) => {
                if (distribution[t.priority] !== undefined) distribution[t.priority]++;
            });

            return distribution;
        } catch (error) {
            console.error('Error getting priority distribution:', error);
            return { Low: 0, Medium: 0, High: 0, Critical: 0 };
        }
    },


    // =========================================================================
    // 17. GET CATEGORY DISTRIBUTION
    // =========================================================================
    async getCategoryDistribution() {
        try {
            const tickets      = await this.getAllTickets();
            const distribution = {};

            tickets.forEach((t) => {
                const cat          = t.categoryName || 'Uncategorized';
                distribution[cat]  = (distribution[cat] || 0) + 1;
            });

            return distribution;
        } catch (error) {
            console.error('Error getting category distribution:', error);
            return {};
        }
    },


    // =========================================================================
    // 18. GET AGENT PERFORMANCE
    // =========================================================================
    async getAgentPerformance() {
        try {
            const [tickets, agentsResponse] = await Promise.all([
                this.getAllTickets(),
                window.api.get('/agents').catch(() => ({ data: [] })),
            ]);

            const agents = agentsResponse.data || [];

            // ── No agents from API: build stats from ticket.agentName ──
            if (agents.length === 0) {
                const agentMap = {};

                tickets.forEach((t) => {
                    const name = t.agentName;
                    if (!name || name === 'Unassigned' || name === 'Unknown') return;

                    if (!agentMap[name]) {
                        agentMap[name] = { name, assigned: 0, resolved: 0, pending: 0, totalHours: 0 };
                    }

                    agentMap[name].assigned++;

                    if (t.status === 'Resolved' || t.status === 'Closed') {
                        agentMap[name].resolved++;
                        if (t.resolutionHours) agentMap[name].totalHours += t.resolutionHours;
                    } else {
                        agentMap[name].pending++;
                    }
                });

                return Object.values(agentMap).map((agent) => ({
                    name:              agent.name,
                    assigned:          agent.assigned,
                    resolved:          agent.resolved,
                    pending:           agent.pending,
                    avgResolutionTime: agent.resolved > 0
                        ? (agent.totalHours / agent.resolved).toFixed(1)
                        : 0,
                })).sort((a, b) => b.resolved - a.resolved);
            }

            // ── Agents available from API: cross-reference with tickets ──
            return agents.map((agent) => {
                const agentTickets = tickets.filter((t) => t.agentID === agent.agentID);
                const resolved     = agentTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
                const pending      = agentTickets.filter((t) => t.status === 'Open'     || t.status === 'InProgress').length;
                const totalHours   = agentTickets
                    .filter((t) => t.resolutionHours)
                    .reduce((sum, t) => sum + (t.resolutionHours || 0), 0);

                return {
                    name:              agent.fullName,
                    assigned:          agentTickets.length,
                    resolved,
                    pending,
                    avgResolutionTime: resolved > 0 ? (totalHours / resolved).toFixed(1) : 0,
                };
            }).sort((a, b) => b.resolved - a.resolved);

        } catch (error) {
            console.error('Error getting agent performance:', error);
            return [];
        }
    },


    // =========================================================================
    // 19. GET WEEKLY TREND  (last 7 days ticket count per day)
    // =========================================================================
    async getWeeklyTrend() {
        try {
            const tickets  = await this.getAllTickets();
            const today    = new Date();
            const last7Days = [];

            for (let i = 6; i >= 0; i--) {
                const date    = new Date(today);
                date.setDate(date.getDate() - i);

                const dayTickets = tickets.filter((t) => {
                    return new Date(t.createdAt).toDateString() === date.toDateString();
                });

                last7Days.push({
                    day:   date.toLocaleDateString('en-US', { weekday: 'short' }),
                    count: dayTickets.length,
                    date:  date.toDateString(),
                });
            }

            return last7Days;
        } catch (error) {
            console.error('Error getting weekly trend:', error);
            return [];
        }
    },


    // =========================================================================
    // 20. GET SLA REPORT
    // =========================================================================
    async getSLAReport() {
        try {
            console.log('Fetching SLA report...');

            // ── Try the dedicated API endpoint first ──
            try {
                const response = await window.api.get('/tickets/sla-report');
                return response.data || [];
            } catch (apiError) {
                // ── Fallback: calculate SLA status locally ──
                console.log('SLA API not available, calculating locally');

                const tickets = await this.getAllTickets();
                const now     = new Date();

                return tickets
                    .filter((t) => t.status === 'Open' || t.status === 'InProgress')
                    .map((t) => {
                        const hoursOld = (now - new Date(t.createdAt)) / (1000 * 60 * 60);
                        const slaStatus = hoursOld > 48 ? 'BREACHED'
                                        : hoursOld > 40 ? 'At Risk'
                                        : 'OK';

                        return {
                            ticketID:        t.ticketID,
                            subject:         t.subject,
                            customerName:    t.customerName,
                            priority:        t.priority,
                            status:          t.status,
                            resolutionHours: Math.round(hoursOld * 10) / 10,
                            slaStatus,
                        };
                    })
                    .sort((a, b) => b.resolutionHours - a.resolutionHours);
            }

        } catch (error) {
            console.error('Error generating SLA report:', error);
            return [];
        }
    },
};


// Make globally available
window.ticketService = ticketService;
console.log('✅ Ticket Service loaded with all dashboard methods');