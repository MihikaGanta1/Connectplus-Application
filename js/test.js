console.log('🔍 Running diagnostic...');
console.log('API_CONFIG:', window.API_CONFIG ? '✅' : '❌');
console.log('api:', window.api ? '✅' : '❌');
console.log('utils:', window.utils ? '✅' : '❌');
console.log('customerService:', window.customerService ? '✅' : '❌');
console.log('ticketService:', window.ticketService ? '✅' : '❌');

if (!window.API_CONFIG) {
    alert('❌ CRITICAL ERROR: API_CONFIG not loaded!\n\nCheck script order in index.html');
}