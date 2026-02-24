/* =============================================================================
   APP.JS — Main Application Controller
   =============================================================================
   TABLE OF CONTENTS:
   1.  Class Constructor & Initialization
   2.  Event Listeners Setup
   3.  Initial Data Loading
   4.  View Router (loadView)
   5.  Dashboard View
   6.  Dashboard Charts
   7.  Customers View
   8.  Customer Row Renderer
   9.  Customer Search & Filter Methods
   10. Tickets View
   11. Ticket Row Renderer
   12. Ticket Search & Filter Methods
   13. Ticket Status Update
   14. Quick Create (Customer + Ticket) Modal
   15. Add Customer Modal
   16. Add Ticket Modal
   17. Assign Ticket Modal
   18. Filter Tickets by Status
   19. Show Filtered Results Modal
   20. Agents View
   21. Agent Modals (View / Edit / Delete / Add)
   22. Reports View
   23. Customer Actions (View / Delete)
   24. Ticket Actions (View / Quick Resolve / Quick Close)
   25. Modal Helper (showModal / submitModalForm / closeModal)
   26. Report Generator
   27. App Bootstrap
   ============================================================================= */


// =============================================================================
// 1. CLASS CONSTRUCTOR & INITIALIZATION
// =============================================================================
class App {
    constructor() {
        this.currentView        = "dashboard";
        this.customers          = [];
        this.tickets            = [];
        this.agents             = [];
        this.categories         = [];
        this.selectedItem       = null;
        this.modalSubmitHandler = null;
        this.init();
    }

    async init() {
        console.log("App initializing...");
        this.setupEventListeners();
        await this.loadInitialData();
        this.loadView("dashboard");
    }


    // =============================================================================
    // 2. EVENT LISTENERS SETUP
    // =============================================================================
    setupEventListeners() {
        console.log("Setting up event listeners...");

        // Handle regular navigation clicks (Dashboard, Customers, Tickets, Agents)
        document.querySelectorAll(".nav-link[data-view]").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const view = link.getAttribute("data-view");
                console.log("Navigation clicked:", view);

                // Update active class
                document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
                link.classList.add("active");

                this.loadView(view);
            });
        });

        // Handle Create Ticket button separately (it opens a modal, not a view)
        const createBtn = document.getElementById("createTicketBtn");
        if (createBtn) {
            createBtn.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Create Ticket button clicked");

                // Remove active class from all nav links
                document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));

                this.showQuickCreateTicketModal();
            });
        } else {
            console.error("Create Ticket button not found!");
        }
    }


    // =============================================================================
    // 3. INITIAL DATA LOADING
    // =============================================================================
    async loadInitialData() {
        try {
            console.log("Loading initial data...");

            // Load all customers
            this.customers = await window.customerService.getAllCustomers();
            console.log("Customers loaded:", this.customers.length);

            // Load all tickets
            this.tickets = await window.ticketService.getAllTickets();
            console.log("Tickets loaded:", this.tickets.length);

            // Try to load agents (endpoint may not always be available)
            try {
                const agentResponse = await window.api.get("/agents");
                this.agents = agentResponse.data || [];
                console.log("Agents loaded:", this.agents.length);
            } catch (error) {
                console.log("Agents endpoint not available");
                this.agents = [];
            }

            // Set default categories
            this.categories = [
                { categoryID: 1, categoryName: "Technical Support" },
                { categoryID: 2, categoryName: "Billing"           },
                { categoryID: 3, categoryName: "General Enquiry"   },
                { categoryID: 4, categoryName: "Complaint"         },
                { categoryID: 5, categoryName: "Service Request"   },
            ];

            console.log("Initial data loaded successfully");
        } catch (error) {
            console.error("Error loading initial data:", error);
            if (window.utils) {
                window.utils.showToast("Failed to load initial data", "danger");
            }
        }
    }


    // =============================================================================
    // 4. VIEW ROUTER
    // =============================================================================
    async loadView(viewName) {
        this.currentView = viewName;
        const mainContent = document.getElementById("mainContent");

        if (!mainContent) return;

        // Show loading spinner while view is being fetched
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary"></div>
                <p>Loading...</p>
            </div>
        `;

        try {
            switch (viewName) {
                case "dashboard": await this.renderDashboard(mainContent); break;
                case "customers": await this.renderCustomers(mainContent); break;
                case "tickets":   await this.renderTickets(mainContent);   break;
                case "agents":    await this.renderAgents(mainContent);    break;
                default:
                    console.log("Unknown view:", viewName);
                    mainContent.innerHTML = '<h1 class="text-center mt-5">404 - View Not Found</h1>';
            }
        } catch (error) {
            console.error(`Error loading view ${viewName}:`, error);
            mainContent.innerHTML = `<div class="alert alert-danger">Error loading view: ${error.message}</div>`;
        }
    }


    // =============================================================================
    // 5. DASHBOARD VIEW
    // =============================================================================
    async renderDashboard(container) {
        try {
            console.log("Rendering dashboard...");

            // Fetch all dashboard data in parallel
            const [stats, summary, priorityDist, categoryDist, tickets] = await Promise.all([
                window.ticketService.getDashboardStats(),
                window.ticketService.getTicketSummary(),
                window.ticketService.getPriorityDistribution(),
                window.ticketService.getCategoryDistribution(),
                window.ticketService.getAllTickets(),
            ]);

            console.log("Dashboard data loaded:", { stats, summary, priorityDist, categoryDist });

            container.innerHTML = `
                <div class="fade-in">
                    <h2 class="mb-4">
                        <i class="fas fa-chart-pie me-2"></i>ConnectPlus Support Services
                    </h2>

                    <!-- ── KPI Cards Row ── -->
                    <div class="row mb-3">

                        <div class="col-md-3 col-sm-6 mb-2">
                            <div class="dashboard-card">
                                <div class="d-flex align-items-center">
                                    <div class="icon-circle bg-primary text-white me-3">
                                        <i class="fas fa-ticket-alt"></i>
                                    </div>
                                    <div>
                                        <div class="small-label">TOTAL TICKETS</div>
                                        <div class="large-value">${stats.totalTickets}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3 col-sm-6 mb-2">
                            <div class="dashboard-card">
                                <div class="d-flex align-items-center">
                                    <div class="icon-circle bg-success text-white me-3">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <div>
                                        <div class="small-label">TOTAL CUSTOMERS</div>
                                        <div class="large-value">${stats.totalCustomers}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3 col-sm-6 mb-2">
                            <div class="dashboard-card">
                                <div class="d-flex align-items-center">
                                    <div class="icon-circle bg-info text-white me-3">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                    <div>
                                        <div class="small-label">AVG RESOLUTION</div>
                                        <div class="large-value">${stats.avgResolutionTime}h</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3 col-sm-6 mb-2">
                            <div class="dashboard-card">
                                <div class="d-flex align-items-center">
                                    <div class="icon-circle bg-warning text-dark me-3">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <div>
                                        <div class="small-label">SLA ADHERENCE</div>
                                        <div class="large-value">${stats.slaAdherence}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- ── Status Cards Row ── -->
                    <div class="row mb-4">

                        <div class="col-md-3 col-sm-6 mb-3">
                            <div class="status-card open" onclick="app.filterTicketsByStatus('Open')" style="cursor: pointer;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="status-label">OPEN</div>
                                        <div class="status-value">${stats.openTickets}</div>
                                    </div>
                                    <div class="status-icon">
                                        <i class="fas fa-exclamation-circle"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3 col-sm-6 mb-3">
                            <div class="status-card progress" onclick="app.filterTicketsByStatus('InProgress')" style="cursor: pointer;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="status-label">IN PROGRESS</div>
                                        <div class="status-value">${stats.inProgressTickets}</div>
                                    </div>
                                    <div class="status-icon">
                                        <i class="fas fa-spinner"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3 col-sm-6 mb-3">
                            <div class="status-card resolved" onclick="app.filterTicketsByStatus('Resolved')" style="cursor: pointer;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="status-label">RESOLVED</div>
                                        <div class="status-value">${stats.resolvedTickets}</div>
                                    </div>
                                    <div class="status-icon">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3 col-sm-6 mb-3">
                            <div class="status-card closed" onclick="app.filterTicketsByStatus('Closed')" style="cursor: pointer;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="status-label">CLOSED</div>
                                        <div class="status-value">${stats.closedTickets}</div>
                                    </div>
                                    <div class="status-icon">
                                        <i class="fas fa-archive"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- ── Charts Row ── -->
                    <div class="row mb-4">

                        <div class="col-md-4 mb-4">
                            <div class="card h-100">
                                <div class="card-header">
                                    <i class="fas fa-chart-pie me-2"></i>Status Distribution
                                </div>
                                <div class="card-body">
                                    <canvas id="statusChart" height="250"></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4 mb-4">
                            <div class="card h-100">
                                <div class="card-header">
                                    <i class="fas fa-chart-bar me-2"></i>Priority Distribution
                                </div>
                                <div class="card-body">
                                    <canvas id="priorityChart" height="250"></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4 mb-4">
                            <div class="card h-100">
                                <div class="card-header">
                                    <i class="fas fa-chart-pie me-2"></i>Category Distribution
                                </div>
                                <div class="card-body">
                                    <canvas id="categoryChart" height="250"></canvas>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- ── Recent Tickets Table ── -->
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-history me-2"></i>Recent Tickets
                        </div>
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Customer</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Priority</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tickets.slice(0, 5).map((ticket) => `
                                            <tr>
                                                <td>#${ticket.ticketID}</td>
                                                <td>${ticket.customerName || "N/A"}</td>
                                                <td>${ticket.subject}</td>
                                                <td><span class="badge ${window.utils.getStatusBadgeClass(ticket.status)}">${ticket.status}</span></td>
                                                <td><span class="badge ${window.utils.getPriorityBadgeClass(ticket.priority)}">${ticket.priority}</span></td>
                                                <td>${window.utils.formatDate(ticket.createdAt)}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-primary" onclick="app.viewTicket(${ticket.ticketID})">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            `;

            // Initialize charts after DOM has updated
            setTimeout(() => {
                this.initDashboardCharts(summary, priorityDist, categoryDist);
            }, 200);

        } catch (error) {
            console.error("Error rendering dashboard:", error);
            container.innerHTML = `<div class="alert alert-danger">Error loading dashboard: ${error.message}</div>`;
        }
    }


    // =============================================================================
    // 6. DASHBOARD CHARTS
    // =============================================================================
    initDashboardCharts(summary, priorityDist, categoryDist) {
        console.log("Initializing charts with data:", { summary, priorityDist, categoryDist });

        if (typeof Chart === "undefined") {
            console.error("Chart.js is not loaded!");
            return;
        }

        // Helper: safely destroy an existing chart before recreating it
        const destroyChart = (chartRef) => {
            try {
                if (chartRef && typeof chartRef.destroy === "function") {
                    chartRef.destroy();
                }
            } catch (e) {
                console.log("Error destroying chart:", e);
            }
            return null;
        };

        // ── Status Doughnut Chart ──
        const statusCtx = document.getElementById("statusChart")?.getContext("2d");
        if (statusCtx) {
            window.statusChart = destroyChart(window.statusChart);

            const statusData = [
                Number(summary["Open"]       || 0),
                Number(summary["InProgress"] || 0),
                Number(summary["OnHold"]     || 0),
                Number(summary["Resolved"]   || 0),
                Number(summary["Closed"]     || 0),
            ];

            console.log("Creating status chart with data:", statusData);

            try {
                window.statusChart = new Chart(statusCtx, {
                    type: "doughnut",
                    data: {
                        labels:   ["Open", "In Progress", "On Hold", "Resolved", "Closed"],
                        datasets: [{
                            data:            statusData,
                            backgroundColor: ["#0d6efd", "#ffc107", "#fd7e14", "#198754", "#6c757d"],
                            borderWidth:     1,
                        }],
                    },
                    options: {
                        responsive:          true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: "bottom",
                                labels:   { font: { size: 10 } },
                            },
                        },
                    },
                });
                console.log("Status chart created successfully");
            } catch (error) {
                console.error("Error creating status chart:", error);
            }
        } else {
            console.error("Status chart canvas not found");
        }

        // ── Priority Bar Chart ──
        const priorityCtx = document.getElementById("priorityChart")?.getContext("2d");
        if (priorityCtx) {
            window.priorityChart = destroyChart(window.priorityChart);

            const priorityData = [
                Number(priorityDist.Low      || 0),
                Number(priorityDist.Medium   || 0),
                Number(priorityDist.High     || 0),
                Number(priorityDist.Critical || 0),
            ];

            try {
                window.priorityChart = new Chart(priorityCtx, {
                    type: "bar",
                    data: {
                        labels:   ["Low", "Medium", "High", "Critical"],
                        datasets: [{
                            data:            priorityData,
                            backgroundColor: ["#0dcaf0", "#ffc107", "#fd7e14", "#dc3545"],
                        }],
                    },
                    options: {
                        responsive:          true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },   // Hides the colour-block legend above the chart
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks:       { stepSize: 1 },
                            },
                        },
                    },
                });
                console.log("Priority chart created");
            } catch (error) {
                console.error("Error creating priority chart:", error);
            }
        }

        // ── Category Pie Chart ──
        const categoryCtx = document.getElementById("categoryChart")?.getContext("2d");
        if (categoryCtx) {
            window.categoryChart = destroyChart(window.categoryChart);

            const categories   = Object.keys(categoryDist).length   ? Object.keys(categoryDist)   : ["No Data"];
            const categoryData = Object.values(categoryDist).length ? Object.values(categoryDist) : [1];

            try {
                window.categoryChart = new Chart(categoryCtx, {
                    type: "pie",
                    data: {
                        labels:   categories,
                        datasets: [{
                            data:            categoryData,
                            backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6c757d"],
                        }],
                    },
                    options: {
                        responsive:          true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: "bottom" },
                        },
                    },
                });
                console.log("Category chart created");
            } catch (error) {
                console.error("Error creating category chart:", error);
            }
        }
    }


    // =============================================================================
    // 7. CUSTOMERS VIEW
    // =============================================================================
    async renderCustomers(container) {
        try {
            console.log("Rendering customers view with search...");

            const customers = await window.customerService.getAllCustomers();

            container.innerHTML = `
                <div class="fade-in">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2><i class="fas fa-users me-2"></i>Customer Management</h2>
                    </div>

                    <!-- Global Search Box -->
                    <div class="row mb-4">
                        <div class="col-md-8 mx-auto">
                            <div class="input-group">
                                <span class="input-group-text bg-white">
                                    <i class="fas fa-search text-primary"></i>
                                </span>
                                <input type="text"
                                       class="form-control form-control-lg"
                                       id="customerGlobalSearch"
                                       placeholder="Search by ID, name, email, phone, or status..."
                                       onkeyup="app.searchAllCustomers()">
                                <button class="btn btn-outline-secondary" type="button" onclick="app.clearCustomerSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Results Count -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-info" id="customerCount">${customers.length} customers found</span>
                    </div>

                    <!-- Customers Table -->
                    <div class="table-container">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Tickets</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="customersTableBody">
                                ${this.renderCustomerRows(customers)}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Store customers so search methods can reference them
            this.allCustomers = customers;
            console.log("Customers stored for search:", this.allCustomers.length);

        } catch (error) {
            console.error("Error rendering customers:", error);
            container.innerHTML = `<div class="alert alert-danger">Error loading customers: ${error.message}</div>`;
        }
    }


    // =============================================================================
    // 8. CUSTOMER ROW RENDERER
    // =============================================================================
    renderCustomerRows(customers) {
        if (!customers || customers.length === 0) {
            return '<tr><td colspan="7" class="text-center py-4">No customers found</td></tr>';
        }

        return customers.map((customer) => {
            console.log("Rendering customer:", customer.fullName);
            return `
                <tr>
                    <td>#${customer.customerID}</td>
                    <td>${customer.fullName}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone || "N/A"}</td>
                    <td><span class="badge bg-info">${customer.ticketCount || 0}</span></td>
                    <td>
                        <span class="badge ${customer.isActive ? "bg-success" : "bg-secondary"}">
                            ${customer.isActive ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info"    onclick="app.viewCustomer(${customer.customerID})"   title="View">   <i class="fas fa-eye"></i>   </button>
                        <button class="btn btn-sm btn-warning" onclick="app.editCustomer(${customer.customerID})"   title="Edit">   <i class="fas fa-edit"></i>  </button>
                        <button class="btn btn-sm btn-danger"  onclick="app.deleteCustomer(${customer.customerID})" title="Delete"> <i class="fas fa-trash"></i> </button>
                    </td>
                </tr>
            `;
        }).join("");
    }


    // =============================================================================
    // 9. CUSTOMER SEARCH & FILTER METHODS
    // =============================================================================

    // Single search box — matches any field
    searchAllCustomers() {
        console.log("Searching customers...");

        const searchInput = document.getElementById("customerGlobalSearch");
        if (!searchInput) { console.error("Search input not found"); return; }

        const searchTerm = searchInput.value.toLowerCase().trim();
        console.log("Customer search term:", searchTerm);

        const tableBody = document.getElementById("customersTableBody");
        const countSpan = document.getElementById("customerCount");
        if (!tableBody || !countSpan) { console.error("Table body or count span not found"); return; }

        // Empty search → show all
        if (!searchTerm) {
            tableBody.innerHTML = this.renderCustomerRows(this.allCustomers);
            countSpan.textContent = `${this.allCustomers.length} customers found`;
            return;
        }

        // Filter: any field that matches
        const filtered = this.allCustomers.filter((customer) => {
            return (
                customer.customerID.toString().includes(searchTerm) ||
                (customer.fullName && customer.fullName.toLowerCase().includes(searchTerm)) ||
                (customer.email    && customer.email.toLowerCase().includes(searchTerm))    ||
                (customer.phone    && customer.phone.toLowerCase().includes(searchTerm))    ||
                (customer.isActive  && "active".includes(searchTerm))                       ||
                (!customer.isActive && "inactive".includes(searchTerm))
            );
        });

        console.log("Filtered customers:", filtered.length);

        if (filtered.length > 0) {
            tableBody.innerHTML = this.renderCustomerRows(filtered);
            countSpan.textContent = `${filtered.length} customers found`;
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5>No customers found matching "${searchTerm}"</h5>
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="app.clearCustomerSearch()">
                            Clear Search
                        </button>
                    </td>
                </tr>
            `;
            countSpan.textContent = `0 customers found`;
        }
    }

    // Clear the customer search box and restore full list
    clearCustomerSearch() {
        console.log("Clearing customer search");
        const searchInput = document.getElementById("customerGlobalSearch");
        if (searchInput) searchInput.value = "";

        document.getElementById("customersTableBody").innerHTML = this.renderCustomerRows(this.allCustomers);
        document.getElementById("customerCount").textContent    = `${this.allCustomers.length} customers found`;
    }

    // Sort customers by a given field
    sortCustomers(by) {
        let sorted = [...this.allCustomers];

        switch (by) {
            case "id":    sorted.sort((a, b) => a.customerID - b.customerID);                        break;
            case "name":  sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));               break;
            case "email": sorted.sort((a, b) => a.email.localeCompare(b.email));                     break;
            case "phone": sorted.sort((a, b) => (a.phone || "").localeCompare(b.phone || ""));       break;
        }

        document.getElementById("customersTableBody").innerHTML = this.renderCustomerRows(sorted);
    }

    // Filter customers by individual field inputs
    filterCustomers() {
        const searchName   = document.getElementById("searchName")?.value.toLowerCase()  || "";
        const searchEmail  = document.getElementById("searchEmail")?.value.toLowerCase() || "";
        const searchPhone  = document.getElementById("searchPhone")?.value               || "";
        const filterStatus = document.getElementById("filterStatus")?.value              || "";

        let filtered = [...this.allCustomers];

        if (searchName)   filtered = filtered.filter((c) => c.fullName.toLowerCase().includes(searchName));
        if (searchEmail)  filtered = filtered.filter((c) => c.email.toLowerCase().includes(searchEmail));
        if (searchPhone)  filtered = filtered.filter((c) => c.phone && c.phone.includes(searchPhone));
        if (filterStatus) filtered = filtered.filter((c) => c.isActive === (filterStatus === "Active"));

        document.getElementById("customersTableBody").innerHTML = this.renderCustomerRows(filtered);
        document.getElementById("customerCount").textContent    = `${filtered.length} customers found`;
    }

    // Clear individual field filters
    clearCustomerFilters() {
        document.getElementById("searchName").value    = "";
        document.getElementById("searchEmail").value   = "";
        document.getElementById("searchPhone").value   = "";
        document.getElementById("filterStatus").value  = "";

        document.getElementById("customersTableBody").innerHTML = this.renderCustomerRows(this.allCustomers);
        document.getElementById("customerCount").textContent    = `${this.allCustomers.length} customers found`;
    }


    // =============================================================================
    // 10. TICKETS VIEW
    // =============================================================================
    async renderTickets(container) {
        try {
            console.log("Rendering tickets view with search...");

            const tickets = await window.ticketService.getAllTickets();

            container.innerHTML = `
                <div class="fade-in">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2><i class="fas fa-ticket-alt me-2"></i>Ticket Management</h2>
                    </div>

                    <!-- Global Search Box -->
                    <div class="row mb-4">
                        <div class="col-md-8 mx-auto">
                            <div class="input-group">
                                <span class="input-group-text bg-white">
                                    <i class="fas fa-search text-primary"></i>
                                </span>
                                <input type="text"
                                       class="form-control form-control-lg"
                                       id="ticketGlobalSearch"
                                       placeholder="Search by ID, customer, subject, status, priority, or agent..."
                                       onkeyup="app.searchAllTickets()">
                                <button class="btn btn-outline-secondary" type="button" onclick="app.clearTicketSearch()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Results Count -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-info" id="ticketCount">${tickets.length} tickets found</span>
                    </div>

                    <!-- Tickets Table -->
                    <div class="table-container">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Agent</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="ticketsTableBody">
                                ${this.renderTicketRows(tickets)}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Store tickets so search methods can reference them
            this.allTickets = tickets;

        } catch (error) {
            console.error("Error rendering tickets:", error);
            container.innerHTML = `<div class="alert alert-danger">Error loading tickets: ${error.message}</div>`;
        }
    }


    // =============================================================================
    // 11. TICKET ROW RENDERER
    // =============================================================================
    renderTicketRows(tickets) {
        if (!tickets || tickets.length === 0) {
            return '<tr><td colspan="8" class="text-center py-4">No tickets found</td></tr>';
        }

        return tickets.map((ticket) => `
            <tr>
                <td>#${ticket.ticketID}</td>
                <td>${ticket.customerName || "N/A"}</td>
                <td>${ticket.subject.length > 50 ? ticket.subject.substring(0, 50) + "..." : ticket.subject}</td>
                <td><span class="badge ${window.utils.getStatusBadgeClass(ticket.status)}">${ticket.status}</span></td>
                <td><span class="badge ${window.utils.getPriorityBadgeClass(ticket.priority)}">${ticket.priority}</span></td>
                <td>${ticket.agentName || "Unassigned"}</td>
                <td>${window.utils.formatDate(ticket.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-info"    onclick="app.viewTicket(${ticket.ticketID})"         title="View">          <i class="fas fa-eye"></i>       </button>
                    <button class="btn btn-sm btn-warning" onclick="app.updateTicketStatus(${ticket.ticketID})" title="Update Status"> <i class="fas fa-sync"></i>      </button>
                    <button class="btn btn-sm btn-success" onclick="app.assignTicket(${ticket.ticketID})"       title="Assign">        <i class="fas fa-user-plus"></i> </button>
                </td>
            </tr>
        `).join("");
    }


    // =============================================================================
    // 12. TICKET SEARCH & FILTER METHODS
    // =============================================================================

    // Single search box — matches any ticket field
    searchAllTickets() {
        const searchTerm = document.getElementById("ticketGlobalSearch")?.value.toLowerCase().trim();

        // Empty search → restore full list
        if (!searchTerm) {
            document.getElementById("ticketsTableBody").innerHTML = this.renderTicketRows(this.allTickets);
            document.getElementById("ticketCount").textContent    = `${this.allTickets.length} tickets found`;
            return;
        }

        const filtered = this.allTickets.filter((ticket) => {
            return (
                ticket.ticketID.toString().includes(searchTerm)                                       ||
                (ticket.customerName && ticket.customerName.toLowerCase().includes(searchTerm))       ||
                (ticket.subject      && ticket.subject.toLowerCase().includes(searchTerm))            ||
                (ticket.status       && ticket.status.toLowerCase().includes(searchTerm))             ||
                (ticket.priority     && ticket.priority.toLowerCase().includes(searchTerm))           ||
                (ticket.agentName    && ticket.agentName.toLowerCase().includes(searchTerm))          ||
                (ticket.description  && ticket.description.toLowerCase().includes(searchTerm))
            );
        });

        if (filtered.length > 0) {
            document.getElementById("ticketsTableBody").innerHTML = this.renderTicketRows(filtered);
            document.getElementById("ticketCount").textContent    = `${filtered.length} tickets found`;
        } else {
            document.getElementById("ticketsTableBody").innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5>No tickets found matching "${searchTerm}"</h5>
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="app.clearTicketSearch()">
                            Clear Search
                        </button>
                    </td>
                </tr>
            `;
            document.getElementById("ticketCount").textContent = `0 tickets found`;
        }
    }

    // Clear ticket search box and restore full list
    clearTicketSearch() {
        document.getElementById("ticketGlobalSearch").value      = "";
        document.getElementById("ticketsTableBody").innerHTML    = this.renderTicketRows(this.allTickets);
        document.getElementById("ticketCount").textContent       = `${this.allTickets.length} tickets found`;
    }

    // Sort tickets by a given field
    sortTickets(by) {
        let sorted = [...this.allTickets];

        switch (by) {
            case "id":       sorted.sort((a, b) => a.ticketID - b.ticketID);                                          break;
            case "customer": sorted.sort((a, b) => (a.customerName || "").localeCompare(b.customerName || ""));       break;
            case "subject":  sorted.sort((a, b) => a.subject.localeCompare(b.subject));                               break;
            case "status":   sorted.sort((a, b) => a.status.localeCompare(b.status));                                 break;
            case "priority": sorted.sort((a, b) => b.priorityValue - a.priorityValue);                                break;
            case "agent":    sorted.sort((a, b) => (a.agentName || "").localeCompare(b.agentName || ""));             break;
            case "created":  sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));                    break;
        }

        document.getElementById("ticketsTableBody").innerHTML = this.renderTicketRows(sorted);
    }

    // Clear individual field filters (resets input values only)
    clearTicketFilters() {
        document.getElementById("ticketIdFilter").value       = "";
        document.getElementById("ticketCustomerFilter").value = "";
        document.getElementById("ticketSubjectFilter").value  = "";
        document.getElementById("ticketStatusFilter").value   = "";
        document.getElementById("ticketPriorityFilter").value = "";
        document.getElementById("ticketAgentFilter").value    = "";
        document.getElementById("ticketFromDate").value       = "";
        document.getElementById("ticketToDate").value         = "";
    }


    // =============================================================================
    // 13. TICKET STATUS UPDATE
    // =============================================================================

    // Opens a modal to choose a new status for a ticket
    async updateTicketStatus(ticketId) {
        console.log("Opening status update for ticket:", ticketId);

        const ticket = this.tickets.find((t) => t.ticketID === ticketId);
        if (!ticket) { console.error("Ticket not found:", ticketId); return; }

        const statuses = [
            { value: 0, name: "Open",       display: "Open",        color: "primary"   },
            { value: 1, name: "InProgress", display: "In Progress", color: "info"      },
            { value: 2, name: "OnHold",     display: "On Hold",     color: "warning"   },
            { value: 3, name: "Resolved",   display: "Resolved",    color: "success"   },
            { value: 4, name: "Closed",     display: "Closed",      color: "secondary" },
        ];

        const currentStatus  = statuses.find((s) => s.name === ticket.status) || statuses[0];
        const statusOptions  = statuses.map((status) => {
            const selected    = status.name === ticket.status ? "selected" : "";
            return `<option value="${status.value}" ${selected}>${status.display || status.name}</option>`;
        }).join("");

        const content = `
            <form id="modalForm">
                <div class="alert alert-info">
                    <strong>Ticket:</strong> ${ticket.subject}<br>
                    <strong>Current Status:</strong>
                    <span class="badge bg-${currentStatus.color}">${currentStatus.display || currentStatus.name}</span>
                </div>

                <div class="mb-3">
                    <label class="form-label">New Status *</label>
                    <select class="form-select" name="newStatus" required>
                        ${statusOptions}
                    </select>
                    <small class="text-muted">Select the new status for this ticket</small>
                </div>

                <div class="mb-3">
                    <label class="form-label">Resolution Notes (Optional)</label>
                    <textarea class="form-control" name="notes" rows="3"
                        placeholder="Add notes about this status change..."></textarea>
                </div>
            </form>
        `;

        this.showModal(`Update Status - Ticket #${ticketId}`, content, async (formData) => {
            console.log("Updating ticket status:", formData);

            if (formData.newStatus === undefined) { alert("Please select a status"); return; }

            const statusData = {
                newStatus: parseInt(formData.newStatus),
                notes:     formData.notes || "",
            };

            console.log("Sending status update:", statusData);

            const result = await window.ticketService.updateTicketStatus(ticketId, statusData);

            if (result) {
                console.log("Status update successful:", result);
                await this.loadInitialData();

                if (this.currentView === "dashboard") {
                    await this.renderDashboard(document.getElementById("mainContent"));
                } else {
                    await this.loadView(this.currentView);
                }

                if (window.utils) {
                    window.utils.showToast("Ticket status updated successfully!", "success");
                }

                const modal = document.getElementById("dynamicModal");
                if (modal) {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                }
            }
        });
    }

    // Quick resolve — skips the modal, goes straight to status 3
    async quickResolveTicket(ticketId) {
        if (confirm("Mark this ticket as Resolved?")) {
            await this.updateTicketStatusDirect(ticketId, 3, "Ticket resolved");
        }
    }

    // Quick close — skips the modal, goes straight to status 4
    async quickCloseTicket(ticketId) {
        if (confirm("Close this ticket?")) {
            await this.updateTicketStatusDirect(ticketId, 4, "Ticket closed");
        }
    }

    // Direct status update (no modal)
    async updateTicketStatusDirect(ticketId, newStatus, notes = "") {
        console.log(`Quick updating ticket ${ticketId} to status ${newStatus}`);

        const result = await window.ticketService.updateTicketStatus(ticketId, {
            newStatus,
            notes,
        });

        if (result) {
            await this.loadInitialData();

            if (this.currentView === "dashboard") {
                await this.renderDashboard(document.getElementById("mainContent"));
            } else {
                await this.loadView(this.currentView);
            }

            if (window.utils) {
                window.utils.showToast("Ticket updated successfully!", "success");
            }
        }
    }


    // =============================================================================
    // 14. QUICK CREATE (CUSTOMER + TICKET) MODAL
    // =============================================================================
    showQuickCreateTicketModal() {
        console.log("Opening quick create ticket modal");

        const content = `
            <form id="modalForm" novalidate>

                <!-- Customer Information -->
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="fas fa-user me-2"></i>Customer Information</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Full Name *</label>
                                <input type="text" class="form-control" name="fullName" id="fullName" required>
                                <div class="invalid-feedback">Please enter full name</div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Email *</label>
                                <input type="email" class="form-control" name="email" id="email"
                                       pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                                       title="Please enter a valid email (e.g., name@domain.com)" required>
                                <div class="invalid-feedback">Please enter a valid email address</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Phone</label>
                                <input type="tel" class="form-control" name="phone" id="phone"
                                       pattern="(\\+91|91|0)?[6-9]\\d{9}"
                                       title="Enter valid Indian number: 9876543210, +919876543210">
                                <div class="invalid-feedback">Please enter a valid Indian phone number</div>
                                <small class="text-muted">Indian mobile number (10 digits starting with 6-9)</small>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Address</label>
                                <input type="text" class="form-control" name="address">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ticket Information -->
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="fas fa-ticket-alt me-2"></i>Ticket Information</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Category *</label>
                            <select class="form-select" name="categoryID" id="categoryID" required>
                                <option value="">Select Category</option>
                                ${this.categories.map((c) => `<option value="${c.categoryID}">${c.categoryName}</option>`).join("")}
                            </select>
                            <div class="invalid-feedback">Please select a category</div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Subject *</label>
                            <input type="text" class="form-control" name="subject" id="subject" required>
                            <div class="invalid-feedback">Please enter subject</div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description *</label>
                            <textarea class="form-control" name="description" id="description" rows="3" required></textarea>
                            <div class="invalid-feedback">Please enter description</div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Priority *</label>
                                <select class="form-select" name="priority" id="priority" required>
                                    <option value="0">Low</option>
                                    <option value="1" selected>Medium</option>
                                    <option value="2">High</option>
                                    <option value="3">Critical</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Assign To (Optional)</label>
                                <select class="form-select" name="agentID">
                                    <option value="">Unassigned</option>
                                    ${this.agents.map((a) => `<option value="${a.agentID}">${a.fullName}</option>`).join("")}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        `;

        this.showModal("Quick Create: New Customer + Ticket", content, async (formData) => {
            console.log("Quick create form data:", formData);

            // ── Validation ──
            const errors = [];

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.push("Please enter a valid email address");
                document.getElementById("email")?.classList.add("is-invalid");
            } else {
                document.getElementById("email")?.classList.remove("is-invalid");
            }

            if (formData.phone && formData.phone.trim() !== "") {
                const phoneRegex  = /^(\+91|91|0)?[6-9]\d{9}$/;
                const cleanPhone  = formData.phone.replace(/\s/g, "");
                if (!phoneRegex.test(cleanPhone)) {
                    errors.push("Please enter a valid Indian phone number (10 digits starting with 6-9)");
                    document.getElementById("phone")?.classList.add("is-invalid");
                } else {
                    document.getElementById("phone")?.classList.remove("is-invalid");
                    // Normalise to a consistent format
                    if      (cleanPhone.startsWith("+91"))                      formData.phone = cleanPhone;
                    else if (cleanPhone.startsWith("91") && cleanPhone.length === 12) formData.phone = "+" + cleanPhone;
                    else                                                         formData.phone = cleanPhone.slice(-10);
                }
            }

            if (!formData.fullName)    { errors.push("Full name is required");   document.getElementById("fullName")?.classList.add("is-invalid");    }
            if (!formData.categoryID)  { errors.push("Category is required");    document.getElementById("categoryID")?.classList.add("is-invalid");  }
            if (!formData.subject)     { errors.push("Subject is required");     document.getElementById("subject")?.classList.add("is-invalid");     }
            if (!formData.description) { errors.push("Description is required"); document.getElementById("description")?.classList.add("is-invalid"); }

            // Stop submission if there are errors
            if (errors.length > 0) {
                window.utils
                    ? window.utils.showToast(errors[0], "danger")
                    : alert(errors.join("\n"));
                return;
            }

            // ── Create Customer & Ticket ──
            try {
                // Disable save button while creating
                const saveBtn = document.querySelector("#dynamicModal .btn-primary");
                if (saveBtn) {
                    saveBtn.disabled   = true;
                    saveBtn.innerHTML  = '<span class="spinner-border spinner-border-sm"></span> Creating...';
                }

                // Step 1: Create customer
                const customerData = {
                    fullName: formData.fullName,
                    email:    formData.email.toLowerCase().trim(),
                    phone:    formData.phone || "",
                    address:  formData.address || "",
                };

                console.log("Creating customer:", customerData);
                const customerResponse = await window.customerService.createCustomer(customerData);
                if (!customerResponse) throw new Error("Failed to create customer");
                console.log("Customer created:", customerResponse);

                // Step 2: Create ticket for that customer
                const ticketData = {
                    customerID:  customerResponse.customerID,
                    categoryID:  parseInt(formData.categoryID),
                    subject:     formData.subject.trim(),
                    description: formData.description.trim(),
                    priority:    parseInt(formData.priority),
                    agentID:     formData.agentID ? parseInt(formData.agentID) : null,
                };

                console.log("Creating ticket:", ticketData);
                const ticketResponse = await window.ticketService.createTicket(ticketData);
                if (!ticketResponse) throw new Error("Ticket created but failed to get response");
                console.log("Ticket created:", ticketResponse);

                await this.loadInitialData();

                // Close modal
                const modal = document.getElementById("dynamicModal");
                if (modal) {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                }

                if (window.utils) window.utils.showToast("Customer and ticket created successfully!", "success");

                this.loadView("tickets");

            } catch (error) {
                console.error("Error in quick create:", error);

                const saveBtn = document.querySelector("#dynamicModal .btn-primary");
                if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = "Save"; }

                if (window.utils) window.utils.showToast(error.message || "Failed to create customer and ticket", "danger");
            }
        });
    }


    // =============================================================================
    // 15. ADD CUSTOMER MODAL
    // =============================================================================
    showAddCustomerModal() {
        console.log("Opening add customer modal");

        const content = `
            <form id="modalForm">
                <div class="mb-3">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-control" name="fullName" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" name="email" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Phone</label>
                    <input type="tel" class="form-control" name="phone"
                           pattern="(\\+91|91|0)?[6-9]\\d{9}"
                           title="Enter valid Indian number: 9876543210, 09876543210, +919876543210"
                           placeholder="e.g., 9876543210 or +919876543210">
                    <small class="text-muted">Indian mobile number (10 digits starting with 6-9)</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Address</label>
                    <textarea class="form-control" name="address" rows="2"></textarea>
                </div>
            </form>
        `;

        this.showModal("Add New Customer", content, async (formData) => {
            console.log("Creating customer:", formData);

            const result = await window.customerService.createCustomer(formData);

            if (result) {
                await this.loadInitialData();
                this.loadView("customers");

                const modal = document.getElementById("dynamicModal");
                if (modal) {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                }
            }
        });
    }


    // =============================================================================
    // 16. ADD TICKET MODAL
    // =============================================================================
    showAddTicketModal() {
        console.log("Opening add ticket modal");

        if (this.customers.length === 0) {
            alert("No customers available. Please add a customer first.");
            return;
        }

        const categoryOptions = this.categories
            .map((c) => `<option value="${c.categoryID}">${c.categoryName}</option>`)
            .join("");

        const agentOptions = this.agents
            .map((a) => `<option value="${a.agentID}">${a.fullName}</option>`)
            .join("");

        const content = `
            <form id="modalForm">
                <div class="mb-3">
                    <label class="form-label">Customer *</label>
                    <select class="form-select" name="customerID" required>
                        <option value="">Select Customer</option>
                        ${this.customers.map((c) => `<option value="${c.customerID}">${c.fullName} (${c.email})</option>`).join("")}
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Category *</label>
                    <select class="form-select" name="categoryID" required>
                        <option value="">Select Category</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Subject *</label>
                    <input type="text" class="form-control" name="subject" placeholder="Brief summary of the issue" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Description *</label>
                    <textarea class="form-control" name="description" rows="4" placeholder="Detailed description of the issue" required></textarea>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Priority *</label>
                        <select class="form-select" name="priority" required>
                            <option value="0">🐢 Low</option>
                            <option value="1" selected>⚡ Medium</option>
                            <option value="2">🔥 High</option>
                            <option value="3">🚨 Critical</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Assign To (Optional)</label>
                        <select class="form-select" name="agentID">
                            <option value="">Unassigned</option>
                            ${agentOptions}
                        </select>
                    </div>
                </div>
            </form>
        `;

        this.showModal("Create New Ticket", content, async (formData) => {
            console.log("Creating ticket with data:", formData);

            if (!formData.customerID || !formData.categoryID || !formData.subject || !formData.description) {
                alert("Please fill all required fields");
                return;
            }

            const ticketData = {
                customerID:  parseInt(formData.customerID),
                categoryID:  parseInt(formData.categoryID),
                subject:     formData.subject.trim(),
                description: formData.description.trim(),
                priority:    parseInt(formData.priority),
                agentID:     formData.agentID ? parseInt(formData.agentID) : null,
            };

            console.log("Sending ticket data:", ticketData);

            const result = await window.ticketService.createTicket(ticketData);

            if (result) {
                await this.loadInitialData();
                this.loadView("tickets");
                if (window.utils) window.utils.showToast("Ticket created successfully!", "success");
            }
        });
    }


    // =============================================================================
    // 17. ASSIGN TICKET MODAL
    // =============================================================================
    async assignTicket(ticketId) {
        const ticket = this.tickets.find((t) => t.ticketID === ticketId);

        const content = `
            <form id="modalForm">
                <p><strong>Ticket:</strong> ${ticket.subject}</p>
                <p><strong>Current Agent:</strong> ${ticket.agentName || "Unassigned"}</p>
                <div class="mb-3">
                    <label class="form-label">Assign to Agent *</label>
                    <select class="form-select" name="agentID" required>
                        <option value="">Select Agent</option>
                        ${this.agents.map((a) => `<option value="${a.agentID}">${a.fullName}</option>`).join("")}
                    </select>
                </div>
            </form>
        `;

        this.showModal("Assign Ticket", content, async (formData) => {
            const result = await window.ticketService.assignTicket(ticketId, {
                agentID: parseInt(formData.agentID),
            });
            if (result) {
                await this.loadInitialData();
                this.loadView("tickets");
            }
        });
    }


    // =============================================================================
    // 18. FILTER TICKETS BY STATUS
    // =============================================================================

    // Called from status cards on the dashboard
    async filterTicketsByStatus(status) {
        console.log(`Filtering tickets by status: ${status}`);

        try {
            const filteredTickets = status === "all"
                ? this.tickets
                : this.tickets.filter((t) => t.status === status);

            this.showFilteredResults(`Tickets with Status: ${status}`, filteredTickets);
        } catch (error) {
            console.error("Error filtering tickets:", error);
            if (window.utils) window.utils.showToast("Error filtering tickets", "danger");
        }
    }

    // Generic filter by type key
    async filterTickets(filterType) {
        console.log(`Filtering tickets by: ${filterType}`);

        const map = {
            all:        { tickets: this.tickets,                                              title: "All Tickets"         },
            open:       { tickets: this.tickets.filter((t) => t.status === "Open"),          title: "Open Tickets"        },
            inProgress: { tickets: this.tickets.filter((t) => t.status === "InProgress"),    title: "In Progress Tickets" },
            resolved:   { tickets: this.tickets.filter((t) => t.status === "Resolved"),      title: "Resolved Tickets"    },
            closed:     { tickets: this.tickets.filter((t) => t.status === "Closed"),        title: "Closed Tickets"      },
        };

        const { tickets, title } = map[filterType] || map.all;
        this.showFilteredResults(title, tickets);
    }


    // =============================================================================
    // 19. SHOW FILTERED RESULTS MODAL
    // =============================================================================
    showFilteredResults(title, tickets) {
        if (tickets.length === 0) {
            if (window.utils) window.utils.showToast("No tickets found", "info");
            return;
        }

        const content = `
            <div class="filtered-results">
                <h6 class="mb-3">${title} (${tickets.length})</h6>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tickets.map((t) => `
                                <tr>
                                    <td>#${t.ticketID}</td>
                                    <td>${t.customerName || "N/A"}</td>
                                    <td>${t.subject.substring(0, 30)}${t.subject.length > 30 ? "..." : ""}</td>
                                    <td><span class="badge ${window.utils.getStatusBadgeClass(t.status)}">${t.status}</span></td>
                                    <td><span class="badge ${window.utils.getPriorityBadgeClass(t.priority)}">${t.priority}</span></td>
                                    <td>${window.utils.formatDate(t.createdAt)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="app.viewTicket(${t.ticketID})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.showModal(title, content, null, true);
    }


    // =============================================================================
    // 20. AGENTS VIEW
    // =============================================================================
    async renderAgents(container) {
        try {
            console.log("Rendering agents view...");

            // Fetch agents (fall back to mock data if endpoint unavailable)
            let agents = [];
            try {
                const response = await window.api.get("/agents");
                agents = response.data || [];
                console.log("Agents data from API:", agents);
            } catch (error) {
                console.log("Agents API not available, using mock data");
                agents = [
                    { agentID: 1, fullName: "Alice Johnson", email: "alice@connectplus.com", department: "Support", role: "Agent",      isActive: true },
                    { agentID: 2, fullName: "Bob Smith",     email: "bob@connectplus.com",   department: "Support", role: "Agent",      isActive: true },
                    { agentID: 3, fullName: "Carol White",   email: "carol@connectplus.com", department: "Support", role: "Supervisor", isActive: true },
                ];
            }

            // Build agent stats from ticket data
            const tickets    = await window.ticketService.getAllTickets();
            const agentStats = {};

            tickets.forEach((ticket) => {
                if (ticket.agentID) {
                    if (!agentStats[ticket.agentID]) agentStats[ticket.agentID] = { assigned: 0, resolved: 0 };
                    agentStats[ticket.agentID].assigned++;
                    if (ticket.status === "Resolved" || ticket.status === "Closed") {
                        agentStats[ticket.agentID].resolved++;
                    }
                }
            });

            console.log("Calculated agent stats:", agentStats);

            container.innerHTML = `
                <div class="fade-in">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2><i class="fas fa-user-tie me-2"></i>Agent Management</h2>
                        <button class="btn btn-primary" onclick="app.showAddAgentModal()">
                            <i class="fas fa-plus me-2"></i>Add Agent
                        </button>
                    </div>

                    <!-- Agent Cards Grid -->
                    <div class="row">
                        ${agents.map((agent) => {
                            const stats          = agentStats[agent.agentID] || { assigned: 0, resolved: 0 };
                            const isSupervisor   = agent.role === "Supervisor";
                            return `
                                <div class="col-md-4 mb-4">
                                    <div class="card agent-card h-100">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center mb-3">
                                                <div class="agent-avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                                    ${agent.fullName.charAt(0)}
                                                </div>
                                                <div class="ms-3">
                                                    <h5 class="mb-0">${agent.fullName}</h5>
                                                    <span class="badge ${isSupervisor ? "bg-warning text-dark" : "bg-info"}">
                                                        ${agent.role || "Agent"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="agent-info mb-3">
                                                <p class="mb-2"><i class="fas fa-envelope me-2 text-primary"></i>${agent.email}</p>
                                                <p class="mb-2"><i class="fas fa-building me-2 text-primary"></i>${agent.department || "Support"}</p>
                                                <p class="mb-0">
                                                    <i class="fas fa-circle me-2 ${agent.isActive ? "text-success" : "text-secondary"}"></i>
                                                    <span class="badge ${agent.isActive ? "bg-success" : "bg-secondary"}">
                                                        ${agent.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </p>
                                            </div>

                                            <div class="agent-stats">
                                                <div class="row text-center">
                                                    <div class="col-6 border-end">
                                                        <div class="stats-value">${stats.assigned}</div>
                                                        <div class="stats-label">Assigned</div>
                                                    </div>
                                                    <div class="col-6">
                                                        <div class="stats-value">${stats.resolved}</div>
                                                        <div class="stats-label">Resolved</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="mt-3 d-flex justify-content-end">
                                                <button class="btn btn-sm btn-outline-info me-2"    onclick="app.viewAgent(${agent.agentID})"   title="View Details"> <i class="fas fa-eye"></i>   </button>
                                                <button class="btn btn-sm btn-outline-warning me-2" onclick="app.editAgent(${agent.agentID})"   title="Edit Agent">   <i class="fas fa-edit"></i>  </button>
                                                <button class="btn btn-sm btn-outline-danger"        onclick="app.deleteAgent(${agent.agentID})" title="Delete Agent"> <i class="fas fa-trash"></i> </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>

                    <!-- Agent Performance Table -->
                    <div class="card mt-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-chart-line me-2"></i>Agent Performance Summary
                        </div>
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Agent</th>
                                            <th>Department</th>
                                            <th>Role</th>
                                            <th>Assigned</th>
                                            <th>Resolved</th>
                                            <th>Resolution Rate</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${agents.map((agent) => {
                                            const stats          = agentStats[agent.agentID] || { assigned: 0, resolved: 0 };
                                            const resolutionRate = stats.assigned > 0
                                                ? Math.round((stats.resolved / stats.assigned) * 100)
                                                : 0;
                                            return `
                                                <tr>
                                                    <td><i class="fas fa-user-circle me-2 text-primary"></i>${agent.fullName}</td>
                                                    <td>${agent.department || "Support"}</td>
                                                    <td>${agent.role || "Agent"}</td>
                                                    <td><span class="badge bg-info rounded-pill">${stats.assigned}</span></td>
                                                    <td><span class="badge bg-success rounded-pill">${stats.resolved}</span></td>
                                                    <td style="width: 150px;">
                                                        <div class="progress" style="height: 8px;">
                                                            <div class="progress-bar bg-success" style="width: ${resolutionRate}%;" role="progressbar"></div>
                                                        </div>
                                                        <small class="text-muted">${resolutionRate}%</small>
                                                    </td>
                                                    <td>
                                                        <span class="badge ${agent.isActive ? "bg-success" : "bg-secondary"}">
                                                            ${agent.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join("")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            console.log("Agents view rendered successfully");

        } catch (error) {
            console.error("Error rendering agents:", error);
            container.innerHTML = `<div class="alert alert-danger">Error loading agents: ${error.message}</div>`;
        }
    }


    // =============================================================================
    // 21. AGENT MODALS (VIEW / EDIT / DELETE / ADD)
    // =============================================================================

    // ── View Agent Details ──
    async viewAgent(agentId) {
        try {
            const response      = await window.api.get(`/agents/${agentId}`);
            const agent         = response.data;
            const tickets       = await window.ticketService.getAllTickets();
            const agentTickets  = tickets.filter((t) => t.agentID === agentId);
            const assignedCount = agentTickets.length;
            const resolvedCount = agentTickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
            const recentTickets = agentTickets.slice(0, 5);

            const content = `
                <div class="agent-detail-view">
                    <div class="text-center mb-4">
                        <div class="agent-avatar-lg mx-auto mb-3"
                             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; font-size: 2.5rem;">
                            ${agent.fullName.charAt(0)}
                        </div>
                        <h4>${agent.fullName}</h4>
                        <span class="badge ${agent.role === "Supervisor" ? "bg-warning" : "bg-info"} fs-6">
                            ${agent.role || "Agent"}
                        </span>
                    </div>

                    <div class="row mb-4">
                        <div class="col-6">
                            <div class="info-card">
                                <div class="info-label">Email</div>
                                <div class="info-value">${agent.email}</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="info-card">
                                <div class="info-label">Department</div>
                                <div class="info-value">${agent.department || "Support"}</div>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-6">
                            <div class="info-card">
                                <div class="info-label">Status</div>
                                <div class="info-value">
                                    <span class="badge ${agent.isActive ? "bg-success" : "bg-secondary"} fs-6">
                                        ${agent.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="info-card">
                                <div class="info-label">Member Since</div>
                                <div class="info-value">${agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "N/A"}</div>
                            </div>
                        </div>
                    </div>

                    <h6 class="mt-4 mb-3">Performance Statistics</h6>
                    <div class="row text-center mb-4">
                        <div class="col-4">
                            <div class="stat-circle">
                                <div class="stat-number">${assignedCount}</div>
                                <div class="stat-label">Assigned</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="stat-circle">
                                <div class="stat-number">${resolvedCount}</div>
                                <div class="stat-label">Resolved</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="stat-circle">
                                <div class="stat-number">${assignedCount > 0 ? Math.round((resolvedCount / assignedCount) * 100) : 0}%</div>
                                <div class="stat-label">Success Rate</div>
                            </div>
                        </div>
                    </div>

                    ${recentTickets.length > 0 ? `
                        <h6 class="mt-4 mb-3">Recent Tickets</h6>
                        <div class="table-container">
                            <table class="table table-sm">
                                <thead>
                                    <tr><th>ID</th><th>Subject</th><th>Status</th><th>Priority</th></tr>
                                </thead>
                                <tbody>
                                    ${recentTickets.map((t) => `
                                        <tr>
                                            <td>#${t.ticketID}</td>
                                            <td>${t.subject}</td>
                                            <td><span class="badge ${window.utils.getStatusBadgeClass(t.status)}">${t.status}</span></td>
                                            <td><span class="badge ${window.utils.getPriorityBadgeClass(t.priority)}">${t.priority}</span></td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p class="text-muted">No tickets assigned yet.</p>'}
                </div>
            `;

            // Inline styles for the agent profile view
            const style = document.createElement("style");
            style.textContent = `
                .agent-avatar-lg { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: 600; }
                .info-card       { background: #f8f9fa; padding: 1rem; border-radius: 8px; height: 100%; }
                .info-label      { font-size: 0.8rem; color: #6c757d; text-transform: uppercase; margin-bottom: 0.3rem; }
                .info-value      { font-size: 1rem; font-weight: 600; }
                .stat-circle     { text-align: center; padding: 0.5rem; }
                .stat-number     { font-size: 1.8rem; font-weight: 700; color: #0d6efd; line-height: 1.2; }
                .stat-label      { font-size: 0.8rem; color: #6c757d; text-transform: uppercase; }
            `;
            document.head.appendChild(style);

            this.showModal(`Agent Profile: ${agent.fullName}`, content, null, true);

        } catch (error) {
            console.error("Error viewing agent:", error);
            if (window.utils) window.utils.showToast("Error loading agent details", "danger");
        }
    }

    // ── Edit Agent ──
    async editAgent(agentId) {
        try {
            const response = await window.api.get(`/agents/${agentId}`);
            const agent    = response.data;

            const content = `
                <form id="modalForm">
                    <div class="mb-3">
                        <label class="form-label">Full Name *</label>
                        <input type="text" class="form-control" name="fullName" value="${agent.fullName}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email *</label>
                        <input type="email" class="form-control" name="email" value="${agent.email}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Department</label>
                        <input type="text" class="form-control" name="department" value="${agent.department || "Support"}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Role</label>
                        <select class="form-select" name="role">
                            <option value="Agent"        ${agent.role === "Agent"        ? "selected" : ""}>Agent</option>
                            <option value="Senior Agent" ${agent.role === "Senior Agent" ? "selected" : ""}>Senior Agent</option>
                            <option value="Supervisor"   ${agent.role === "Supervisor"   ? "selected" : ""}>Supervisor</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" name="isActive">
                            <option value="true"  ${agent.isActive  ? "selected" : ""}>Active</option>
                            <option value="false" ${!agent.isActive ? "selected" : ""}>Inactive</option>
                        </select>
                    </div>
                </form>
            `;

            this.showModal("Edit Agent", content, async (formData) => {
                try {
                    formData.isActive = formData.isActive === "true";
                    const updateResponse = await window.api.put(`/agents/${agentId}`, formData);
                    if (updateResponse.data) {
                        await this.loadInitialData();
                        this.loadView("agents");
                        if (window.utils) window.utils.showToast("Agent updated successfully!", "success");
                    }
                } catch (error) {
                    console.error("Error updating agent:", error);
                    if (window.utils) window.utils.showToast(error.message || "Failed to update agent", "danger");
                }
            });

        } catch (error) {
            console.error("Error loading agent for edit:", error);
            if (window.utils) window.utils.showToast("Error loading agent details", "danger");
        }
    }

    // ── Delete Agent ──
    async deleteAgent(agentId) {
        if (confirm("Are you sure you want to deactivate this agent?")) {
            try {
                await window.api.delete(`/agents/${agentId}`);
                await this.loadInitialData();
                this.loadView("agents");
                if (window.utils) window.utils.showToast("Agent deactivated successfully!", "success");
            } catch (error) {
                console.error("Error deleting agent:", error);
                if (window.utils) window.utils.showToast(error.message || "Failed to delete agent", "danger");
            }
        }
    }

    // ── Add Agent ──
    showAddAgentModal() {
        const content = `
            <form id="modalForm">
                <div class="mb-3">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-control" name="fullName" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" name="email" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Department</label>
                    <input type="text" class="form-control" name="department" value="Support">
                </div>
                <div class="mb-3">
                    <label class="form-label">Role</label>
                    <select class="form-select" name="role">
                        <option value="Agent">Agent</option>
                        <option value="Senior Agent">Senior Agent</option>
                        <option value="Supervisor">Supervisor</option>
                    </select>
                </div>
            </form>
        `;

        this.showModal("Add New Agent", content, async (formData) => {
            try {
                const response = await window.api.post("/agents", formData);
                if (response.data) {
                    await this.loadInitialData();
                    this.loadView("agents");
                    if (window.utils) window.utils.showToast("Agent added successfully!", "success");
                }
            } catch (error) {
                console.error("Error adding agent:", error);
                if (window.utils) window.utils.showToast(error.message || "Failed to add agent", "danger");
            }
        });
    }


    // =============================================================================
    // 22. REPORTS VIEW
    // =============================================================================
    async renderReports(container) {
        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4"><i class="fas fa-file-alt me-2"></i>Reports</h2>

                <div class="row">
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-header">
                                <i class="fas fa-chart-line"></i> Ticket Volume Report
                            </div>
                            <div class="card-body">
                                <p>View ticket volume trends over time</p>
                                <button class="btn btn-primary" onclick="app.generateReport('volume')">
                                    Generate Report
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-header">
                                <i class="fas fa-clock"></i> SLA Compliance Report
                            </div>
                            <div class="card-body">
                                <p>Monitor SLA adherence and at-risk tickets</p>
                                <button class="btn btn-primary" onclick="app.generateReport('sla')">
                                    Generate Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }


    // =============================================================================
    // 23. CUSTOMER ACTIONS (VIEW / DELETE)
    // =============================================================================
    async viewCustomer(customerId) {
        const customer = this.customers.find((c) => c.customerID === customerId);
        const tickets  = await window.customerService.getCustomerTickets(customerId);

        const content = `
            <div>
                <h5>${customer.fullName}</h5>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Phone:</strong> ${customer.phone || "N/A"}</p>
                <p><strong>Address:</strong> ${customer.address || "N/A"}</p>
                <p><strong>Total Tickets:</strong> ${customer.ticketCount || 0}</p>

                <h6 class="mt-4">Recent Tickets</h6>
                <div class="table-container">
                    <table class="table table-sm">
                        <thead>
                            <tr><th>ID</th><th>Subject</th><th>Status</th><th>Created</th></tr>
                        </thead>
                        <tbody>
                            ${tickets.slice(0, 5).map((t) => `
                                <tr>
                                    <td>#${t.ticketID}</td>
                                    <td>${t.subject}</td>
                                    <td><span class="badge ${window.utils.getStatusBadgeClass(t.status)}">${t.status}</span></td>
                                    <td>${window.utils.formatDate(t.createdAt)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.showModal(`Customer: ${customer.fullName}`, content, null, true);
    }

    async deleteCustomer(customerId) {
        if (confirm("Are you sure you want to deactivate this customer?")) {
            const success = await window.customerService.deleteCustomer(customerId);
            if (success) {
                await this.loadInitialData();
                this.loadView("customers");
            }
        }
    }

    // Show all customers in a modal (used from dashboard)
    async showAllCustomers() {
        const customers = await window.customerService.getAllCustomers();

        const content = `
            <div class="filtered-results">
                <h6 class="mb-3">All Customers (${customers.length})</h6>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Tickets</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            ${customers.map((c) => `
                                <tr>
                                    <td>#${c.customerID}</td>
                                    <td>${c.fullName}</td>
                                    <td>${c.email}</td>
                                    <td>${c.phone || "N/A"}</td>
                                    <td><span class="badge bg-info">${c.ticketCount || 0}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="app.viewCustomer(${c.customerID})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.showModal("All Customers", content, null, true);
    }


    // =============================================================================
    // 24. TICKET ACTIONS (VIEW)
    // =============================================================================
    async viewTicket(ticketId) {
        const ticket = this.tickets.find((t) => t.ticketID === ticketId);

        const content = `
            <div>
                <h5>${ticket.subject}</h5>
                <p><strong>Customer:</strong> ${ticket.customerName}</p>
                <p><strong>Status:</strong>   <span class="badge ${window.utils.getStatusBadgeClass(ticket.status)}">${ticket.status}</span></p>
                <p><strong>Priority:</strong> <span class="badge ${window.utils.getPriorityBadgeClass(ticket.priority)}">${ticket.priority}</span></p>
                <p><strong>Assigned To:</strong> ${ticket.agentName || "Unassigned"}</p>
                <p><strong>Created:</strong>  ${window.utils.formatDate(ticket.createdAt)}</p>
                ${ticket.resolvedAt ? `<p><strong>Resolved:</strong> ${window.utils.formatDate(ticket.resolvedAt)}</p>` : ""}

                <h6 class="mt-4">Description</h6>
                <p>${ticket.description}</p>
            </div>
        `;

        this.showModal(`Ticket #${ticketId}`, content, null, true);
    }


    // =============================================================================
    // 25. MODAL HELPER (showModal / submitModalForm / closeModal)
    // =============================================================================

    // Renders and shows a Bootstrap modal
    showModal(title, content, onSubmit = null, isReadOnly = false) {
        console.log("Showing modal:", title);

        // Remove any existing modal before adding a new one
        const existingModal = document.getElementById("dynamicModal");
        if (existingModal) existingModal.remove();

        const footerHtml = isReadOnly
            ? `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`
            : `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
               <button type="button" class="btn btn-primary" onclick="app.submitModalForm()">Save</button>`;

        document.body.insertAdjacentHTML("beforeend", `
            <div class="modal fade" id="dynamicModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">${content}</div>
                        <div class="modal-footer">${footerHtml}</div>
                    </div>
                </div>
            </div>
        `);

        this.modalSubmitHandler = onSubmit;
        const modal = new bootstrap.Modal(document.getElementById("dynamicModal"));
        modal.show();
    }

    // Validates form, collects data, and calls the stored submit handler
    async submitModalForm() {
        console.log("Submitting modal form");

        const form = document.getElementById("modalForm");
        if (!form) { console.error("Form not found"); return; }

        if (!form.checkValidity()) { form.reportValidity(); return; }

        const formData = Object.fromEntries(new FormData(form).entries());
        console.log("Form data:", formData);

        if (this.modalSubmitHandler) {
            await this.modalSubmitHandler(formData);
        }

        // Close modal after submission
        const modal = document.getElementById("dynamicModal");
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        }
    }

    // Programmatically close and remove the modal
    closeModal() {
        const modal = document.getElementById("dynamicModal");
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
            modal.remove();
        }
    }


    // =============================================================================
    // 26. REPORT GENERATOR
    // =============================================================================
    generateReport(type) {
        alert(`Report generation for ${type} - Coming soon!`);
    }
}


// =============================================================================
// 27. APP BOOTSTRAP
// =============================================================================
console.log("Starting application...");
const app   = new App();
window.app  = app;