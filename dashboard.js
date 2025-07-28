/**
 * This script fetches and displays application data on the dashboard.
 * It now correctly handles the paginated API response from the server.
 */
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('applicationsTableBody');
    const summaryPending = document.getElementById('summary-pending');
    const summaryInspection = document.getElementById('summary-inspection');
    const summaryApprovedMonth = document.getElementById('summary-approved-month');
    const newApplicationBtn = document.getElementById('new-application-dropdown-btn');
    const newApplicationMenu = document.getElementById('new-application-dropdown-menu');
    
    const API_URL = 'https://lgu-building-permit.onrender.com/api/applications';

    /**
     * Renders the status pill based on the application status text.
     */
    function getStatusPill(status) {
        let pillClass = '';
        switch (status.toLowerCase()) {
            case 'for evaluation': pillClass = 'status-evaluation'; break;
            case 'for inspection': pillClass = 'status-inspection'; break;
            case 'approved': pillClass = 'status-approved'; break;
            case 'permit released': pillClass = 'status-released'; break;
            case 'rejected': pillClass = 'status-rejected'; break;
            default: pillClass = 'bg-gray-200 text-gray-800';
        }
        return `<span class="status-pill ${pillClass}">${status}</span>`;
    }

    /**
     * Calculates and displays the summary statistics.
     */
    function updateDashboardSummary(applications) {
        if (!Array.isArray(applications)) return; // Safety check
        let pendingCount = 0;
        let inspectionCount = 0;
        let approvedThisMonthCount = 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        applications.forEach(app => {
            if (app.status === 'For Inspection') inspectionCount++;
            if (app.status === 'For Evaluation' || app.status === 'For Inspection') pendingCount++;
            
            const appDate = new Date(app.dateFiled);
            if ((app.status === 'Approved' || app.status === 'Permit Released') && 
                appDate.getMonth() === currentMonth && 
                appDate.getFullYear() === currentYear) {
                approvedThisMonthCount++;
            }
        });

        if (summaryPending) summaryPending.textContent = pendingCount;
        if (summaryInspection) summaryInspection.textContent = inspectionCount;
        if (summaryApprovedMonth) summaryApprovedMonth.textContent = approvedThisMonthCount;
    }

    /**
     * Fetches application data from the server and populates the table.
     */
    async function populateTable() {
        if (!tableBody) return;

        try {
            const response = await fetch(API_URL, { headers: getAuthHeaders() });

            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // UPDATED: Destructure the response to get the 'applications' array
            const { applications } = await response.json();

            // Pass the array to the summary function
            updateDashboardSummary(applications);

            if (applications.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-gray-500">No applications found in the database.</td></tr>`;
                return;
            }

            let tableContent = '';
            applications.forEach(app => {
                const formattedDate = new Date(app.dateFiled).toISOString().split('T')[0];
                tableContent += `
                    <tr class="hover:bg-gray-50">
                        <td class="p-4 text-sm text-gray-700 font-medium">${app.permitNo}</td>
                        <td class="p-4 text-sm text-gray-700">${app.applicant}</td>
                        <td class="p-4 text-sm text-gray-500">${app.location}</td>
                        <td class="p-4 text-sm text-gray-500">${formattedDate}</td>
                        <td class="p-4 text-sm">${getStatusPill(app.status)}</td>
                        <td class="p-4 text-sm">
                            <a href="building-permit-details.html?id=${app._id}" class="text-blue-600 hover:text-blue-800 mr-2" title="View Details"><i class="fas fa-eye"></i></a>
                            <a href="edit-building-permit.html?id=${app._id}" class="text-green-600 hover:text-green-800" title="Edit"><i class="fas fa-pencil-alt"></i></a>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = tableContent;

        } catch (error) {
            console.error('Failed to fetch applications:', error);
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-red-500">Error loading data. Please ensure the server is running.</td></tr>`;
        }
    }

    // --- EVENT LISTENERS ---
 // UPDATED: Added logic to toggle the "New Application" dropdown menu
    if (newApplicationBtn && newApplicationMenu) {
        newApplicationBtn.addEventListener('click', () => {
            newApplicationMenu.classList.toggle('hidden');
        });

        // Close the dropdown if the user clicks outside of it
        window.addEventListener('click', (event) => {
            if (!newApplicationBtn.contains(event.target) && !newApplicationMenu.contains(event.target)) {
                newApplicationMenu.classList.add('hidden');
            }
        });
    }

    populateTable();
});
