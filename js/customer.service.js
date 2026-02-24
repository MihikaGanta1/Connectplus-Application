/* =============================================================================
   CUSTOMER.JS — Customer API Service
   =============================================================================
   TABLE OF CONTENTS:
   1.  Validation Helpers  (isValidEmail, isValidIndianPhone, cleanPhoneNumber)
   2.  Get All Customers
   3.  Get Customer By ID
   4.  Create Customer
   5.  Update Customer
   6.  Delete Customer
   7.  Get Customer Tickets
   ============================================================================= */

console.log('📦 Loading Customer Service...');

const customerService = {

    // =========================================================================
    // 1. VALIDATION HELPERS
    // =========================================================================

    // Checks that the email follows a standard format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validates Indian mobile numbers
    // Accepted formats: 9876543210 | 09876543210 | +919876543210 | 919876543210
    isValidIndianPhone(phone) {
        if (!phone || phone.trim() === '') return true;   // Phone is optional

        const phoneRegex = /^(\+91|91|0)?[6789]\d{9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));  // Strip spaces before testing
    },

    // Normalises a phone number to a consistent format before saving
    cleanPhoneNumber(phone) {
        if (!phone) return '';

        let cleaned = phone.replace(/[^\d+]/g, '');  // Keep digits and leading '+'

        if      (cleaned.startsWith('+91'))                       return cleaned;           // Already has +91
        else if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;  // Add leading +
        else                                                       return cleaned.slice(-10); // Keep last 10 digits
    },


    // =========================================================================
    // 2. GET ALL CUSTOMERS
    // =========================================================================
    async getAllCustomers() {
        try {
            console.log('Fetching all customers...');
            const response = await window.api.get('/customers');
            return response.data || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            if (window.utils) window.utils.showToast(error.message || 'Failed to fetch customers', 'danger');
            return [];
        }
    },


    // =========================================================================
    // 3. GET CUSTOMER BY ID
    // =========================================================================
    async getCustomerById(id) {
        try {
            const response = await window.api.get(`/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer:', error);
            return null;
        }
    },


    // =========================================================================
    // 4. CREATE CUSTOMER
    // =========================================================================
    async createCustomer(customerData) {

        // Validate email
        if (!this.isValidEmail(customerData.email)) {
            const errorMsg = 'Please enter a valid email address (e.g., name@domain.com)';
            console.error('Email validation failed:', customerData.email);
            if (window.utils) window.utils.showToast(errorMsg, 'danger');
            return null;
        }

        // Validate phone (only if provided)
        if (customerData.phone && !this.isValidIndianPhone(customerData.phone)) {
            const errorMsg = 'Please enter a valid Indian phone number (e.g., 9876543210, +919876543210)';
            console.error('Phone validation failed:', customerData.phone);
            if (window.utils) window.utils.showToast(errorMsg, 'danger');
            return null;
        }

        // Normalise phone before sending to API
        if (customerData.phone) {
            customerData.phone = this.cleanPhoneNumber(customerData.phone);
        }

        try {
            console.log('Creating customer:', customerData);
            const response = await window.api.post('/customers', customerData);
            console.log('Create response:', response);
            if (window.utils) window.utils.showToast('Customer created successfully!', 'success');
            return response.data;
        } catch (error) {
            console.error('Error creating customer:', error);

            const isDuplicate = error.status === 409 || (error.message && error.message.includes('already exists'));
            const errorMsg    = isDuplicate
                ? 'Customer with this email already exists'
                : error.message || 'Failed to create customer';

            if (window.utils) window.utils.showToast(errorMsg, 'danger');
            return null;
        }
    },


    // =========================================================================
    // 5. UPDATE CUSTOMER
    // =========================================================================
    async updateCustomer(id, customerData) {

        // Validate email (only if it's being changed)
        if (customerData.email && !this.isValidEmail(customerData.email)) {
            const errorMsg = 'Please enter a valid email address (e.g., name@domain.com)';
            console.error('Email validation failed:', customerData.email);
            if (window.utils) window.utils.showToast(errorMsg, 'danger');
            return null;
        }

        // Validate phone (only if provided)
        if (customerData.phone && !this.isValidIndianPhone(customerData.phone)) {
            const errorMsg = 'Please enter a valid Indian phone number (e.g., 9876543210, +919876543210)';
            console.error('Phone validation failed:', customerData.phone);
            if (window.utils) window.utils.showToast(errorMsg, 'danger');
            return null;
        }

        // Normalise phone before sending to API
        if (customerData.phone) {
            customerData.phone = this.cleanPhoneNumber(customerData.phone);
        }

        try {
            const response = await window.api.put(`/customers/${id}`, customerData);
            if (window.utils) window.utils.showToast('Customer updated successfully!', 'success');
            return response.data;
        } catch (error) {
            console.error('Error updating customer:', error);

            const isDuplicate = error.status === 409 || (error.message && error.message.includes('already exists'));
            const errorMsg    = isDuplicate
                ? 'Email already in use by another customer'
                : error.message || 'Failed to update customer';

            if (window.utils) window.utils.showToast(errorMsg, 'danger');
            return null;
        }
    },


    // =========================================================================
    // 6. DELETE CUSTOMER
    // =========================================================================
    async deleteCustomer(id) {
        try {
            await window.api.delete(`/customers/${id}`);
            if (window.utils) window.utils.showToast('Customer deactivated successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting customer:', error);
            if (window.utils) window.utils.showToast(error.message || 'Failed to delete customer', 'danger');
            return false;
        }
    },


    // =========================================================================
    // 7. GET CUSTOMER TICKETS
    // =========================================================================
    async getCustomerTickets(customerId) {
        try {
            const response = await window.api.get(`/tickets/customer/${customerId}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching customer tickets:', error);
            return [];
        }
    },
};

window.customerService = customerService;
console.log('✅ Customer Service loaded');