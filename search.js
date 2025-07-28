/**
 * This script handles the search and filtering functionality with pagination.
 * It now correctly handles undefined statuses.
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchTermInput = document.getElementById('search-term');
    const filterStatusSelect = document.getElementById('filter-status');
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const resultsTableBody = document.getElementById('results-table-body');
    const resultsTitle = document.getElementById('results-title');
    const paginationControls = document.getElementById('pagination-controls');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    const API_URL = 'http://localhost:3001/api/applications';
    let debounceTimer;
    let currentPage = 1;
    let totalPages = 1;

    /**
     * Renders the status pill based on the application status text.
     */
    const getStatusPill = (status) => {
        // UPDATED: Added a check to handle cases where status might be undefined.
        if (!status) {
            return `<span class="status-pill bg-gray-200 text-gray-800">N/A</span>`;
        }
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
    };

    const performSearch = async (page = 1) => {
        currentPage = page;
        const searchTerm = searchTermInput.value.trim();
        const status = filterStatusSelect.value;
        const dateFrom = dateFromInput.value;
        const dateTo = dateToInput.value;

        if (!searchTerm && !status && !dateFrom && !dateTo) {
            resultsTitle.textContent = 'Search Results';
            resultsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-gray-500">Enter search criteria to see results.</td></tr>`;
            paginationControls.classList.add('hidden');
            return;
        }

        const params = new URLSearchParams({ page: currentPage, limit: 10 });
        if (searchTerm) params.append('search', searchTerm);
        if (status) params.append('status', status);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const fullUrl = `${API_URL}?${params.toString()}`;
        resultsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Searching...</td></tr>`;

        try {
            const response = await fetch(fullUrl, { headers: getAuthHeaders() });
            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error('Search request failed.');

            const { applications, pagination } = await response.json();
            totalPages = pagination.totalPages;
            
            resultsTitle.textContent = `${pagination.totalDocuments} Result(s) Found`;

            if (applications.length === 0) {
                resultsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-gray-500">No applications match your criteria.</td></tr>`;
                paginationControls.classList.add('hidden');
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
                            <a href="application-details.html?id=${app._id}" class="text-blue-600 hover:text-blue-800 mr-2" title="View Details"><i class="fas fa-eye"></i></a>
                            <a href="edit-application.html?id=${app._id}" class="text-green-600 hover:text-green-800" title="Edit"><i class="fas fa-pencil-alt"></i></a>
                        </td>
                    </tr>
                `;
            });
            resultsTableBody.innerHTML = tableContent;
            updatePaginationControls();

        } catch (error) {
            console.error('Search failed:', error);
            resultsTableBody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-red-500">Error performing search. Please try again.</td></tr>`;
            paginationControls.classList.add('hidden');
        }
    };

    const updatePaginationControls = () => {
        if (totalPages > 1) {
            paginationControls.classList.remove('hidden');
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        } else {
            paginationControls.classList.add('hidden');
        }
    };

    const handleFilterChange = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(1); // Reset to page 1 for a new search
        }, 500);
    };

    searchTermInput.addEventListener('input', handleFilterChange);
    filterStatusSelect.addEventListener('change', () => performSearch(1));
    dateFromInput.addEventListener('change', () => performSearch(1));
    dateToInput.addEventListener('change', () => performSearch(1));

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        clearTimeout(debounceTimer);
        performSearch(1);
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            performSearch(currentPage - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            performSearch(currentPage + 1);
        }
    });
});
