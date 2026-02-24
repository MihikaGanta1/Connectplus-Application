// ===== ENUMS =====
export enum TicketStatus {
    Open = 0,
    InProgress = 1,
    OnHold = 2,
    Resolved = 3,
    Closed = 4
}

export enum TicketPriority {
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

// ===== CUSTOMER INTERFACES =====
export interface Customer {
    customerID: number;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    createdAt: string;
    isActive: boolean;
    ticketCount: number;
}

export interface CreateCustomerDto {
    fullName: string;
    email: string;
    phone: string;
    address: string;
}

export interface UpdateCustomerDto {
    customerID: number;
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
}

// ===== AGENT INTERFACES =====
export interface Agent {
    agentID: number;
    fullName: string;
    email: string;
    department: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    assignedTickets: number;
    resolvedTickets: number;
}

// ===== TICKET INTERFACES =====
export interface Ticket {
    ticketID: number;
    customerID: number;
    customerName: string;
    customerEmail: string;
    agentID?: number;
    agentName?: string;
    agentDepartment?: string;
    categoryID: number;
    categoryName: string;
    subject: string;
    description: string;
    status: string;
    statusValue: number;
    priority: string;
    priorityValue: number;
    createdAt: string;
    updatedAt?: string;
    resolvedAt?: string;
    resolutionHours?: number;
}

export interface CreateTicketDto {
    customerID: number;
    agentID?: number;
    categoryID: number;
    subject: string;
    description: string;
    priority: TicketPriority;
}

export interface UpdateTicketStatusDto {
    newStatus: TicketStatus;
    notes?: string;
}

export interface AssignTicketDto {
    agentID: number;
}

// ===== CATEGORY INTERFACES =====
export interface Category {
    categoryID: number;
    categoryName: string;
    description: string;
    isActive: boolean;
}

// ===== API RESPONSE INTERFACE =====
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    statusCode: number;
    errors: string[];
}

// ===== DASHBOARD INTERFACES =====
export interface DashboardStats {
    totalCustomers: number;
    totalAgents: number;
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    avgResolutionHours: number;
    slaAdherence: number;
}

export interface TicketSummary {
    [key: string]: number;
}

// ===== FILTER INTERFACES =====
export interface TicketFilter {
    status?: TicketStatus;
    priority?: TicketPriority;
    customerID?: number;
    agentID?: number;
    categoryID?: number;
    fromDate?: string;
    toDate?: string;
}