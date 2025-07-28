/**
 * This script fetches and displays the complete details of a single application
 * and handles triggering the server-side Word document export.
 */
document.addEventListener('DOMContentLoaded', () => {
    const loadingState = document.getElementById('loadingState');
    const applicationDataContainer = document.getElementById('applicationData');
    const exportBtn = document.getElementById('exportWordBtn');

    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('id');

    if (!applicationId) {
        applicationDataContainer.innerHTML = '<p class="text-red-500 text-center">No application ID provided. Please return to the dashboard.</p>';
        loadingState.classList.add('hidden');
        applicationDataContainer.classList.remove('hidden');
        return;
    }

    const API_URL = `https://lgu-helpdesk-api.onrender.com/api/applications/${applicationId}`;

    const fetchAndDisplayApplication = async () => {
        try {
            // UPDATED: The fetch request now includes the authorization headers from main.js
            const response = await fetch(API_URL, {
                headers: getAuthHeaders()
            });

            if (response.status === 401) {
                // If the token is invalid or expired, redirect to the login page.
                logout();
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const app = await response.json();
            
            populateDetails(app);

            loadingState.classList.add('hidden');
            applicationDataContainer.classList.remove('hidden');
            if (exportBtn) exportBtn.classList.remove('hidden');

        } catch (error) {
            console.error('Failed to fetch application details:', error);
            loadingState.innerHTML = `<p class="text-red-500 text-center">Error loading application data. Please try again later.</p>`;
        }
    };

    /**
     * Populates all the detail fields on the page.
     * @param {object} app - The application data object from the server.
     */
    function populateDetails(app) {
        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value || 'N/A';
        };
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        };
        const formatCurrency = (number) => {
            if (number == null) return 'N/A';
            return `PHP ${Number(number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        // General Info
        setText('detail-permitNo', app.permitNo);
        setText('detail-status', app.status);
        setText('detail-dateFiled', formatDate(app.dateFiled));
        setText('detail-applicationType', app.applicationType);
        setText('detail-permitType', app.permitType);

        // Applicant Info
        setText('detail-applicantName', app.applicant);
        setText('detail-applicantTIN', app.applicantTIN);
        setText('detail-applicantAddress', app.applicantAddress);
        setText('detail-applicantContactNo', app.applicantContactNo);

        // Location Info
        setText('detail-location', app.location);
        setText('detail-lotNo', app.lotNo);
        setText('detail-blkNo', app.blkNo);
        setText('detail-tctNo', app.tctNo);
        setText('detail-taxDecNo', app.taxDecNo);

        // Scope and Project Details
        setText('detail-scopeOfWork', app.scopeOfWork);
        
        // UPDATED: Handle the array of occupancies
        if (Array.isArray(app.characterOfOccupancy) && app.characterOfOccupancy.length > 0) {
            setText('detail-characterOfOccupancy', app.characterOfOccupancy.join(', '));
        } else {
            setText('detail-characterOfOccupancy', 'N/A');
        }

        setText('detail-numberOfUnits', app.numberOfUnits);
        setText('detail-numberOfStorey', app.numberOfStorey);
        setText('detail-totalFloorArea', app.totalFloorArea);
        setText('detail-lotArea', app.lotArea);
        setText('detail-proposedDate', formatDate(app.proposedDateOfConstruction));
        setText('detail-expectedDate', formatDate(app.expectedDateOfCompletion));

        // Inspector Info
        if (app.inspector) {
            setText('detail-inspector-name', app.inspector.name);
            setText('detail-inspector-address', app.inspector.address);
            setText('detail-inspector-prcNo', app.inspector.prcNo);
            setText('detail-inspector-ptrNo', app.inspector.ptrNo);
            setText('detail-inspector-tin', app.inspector.tin);
        }

        // Signatory Info
        if (app.applicantSignature) {
            setText('detail-applicantSig-id', app.applicantSignature.govIdNo);
            setText('detail-applicantSig-date', app.applicantSignature.dateIssued);
            setText('detail-applicantSig-place', app.applicantSignature.placeIssued);
        }
        if (app.lotOwnerConsent) {
            setText('detail-lotOwner-name', app.lotOwnerConsent.name);
            setText('detail-lotOwner-id', app.lotOwnerConsent.govIdNo);
            setText('detail-lotOwner-date', app.lotOwnerConsent.dateIssued);
            setText('detail-lotOwner-place', app.lotOwnerConsent.placeIssued);
        }

        // Notary Info
        if (app.notaryInfo) {
            setText('detail-notary-docNo', app.notaryInfo.docNo);
            setText('detail-notary-pageNo', app.notaryInfo.pageNo);
            setText('detail-notary-bookNo', app.notaryInfo.bookNo);
            setText('detail-notary-seriesOf', app.notaryInfo.seriesOf);
            setText('detail-notary-name', app.notaryInfo.notaryPublic);
        }

        // Assessed Fees
        if (app.assessedFees) {
            setText('detail-fee-zoning', formatCurrency(app.assessedFees.zoning));
            setText('detail-fee-filing', formatCurrency(app.assessedFees.filingFee));
            setText('detail-fee-lineGrade', formatCurrency(app.assessedFees.lineAndGrade));
            setText('detail-fee-fencing', formatCurrency(app.assessedFees.fencing));
            setText('detail-fee-architectural', formatCurrency(app.assessedFees.architectural));
            setText('detail-fee-civil', formatCurrency(app.assessedFees.civilStructural));
            setText('detail-fee-electrical', formatCurrency(app.assessedFees.electrical));
            setText('detail-fee-mechanical', formatCurrency(app.assessedFees.mechanical));
            setText('detail-fee-sanitary', formatCurrency(app.assessedFees.sanitary));
            setText('detail-fee-plumbing', formatCurrency(app.assessedFees.plumbing));
            setText('detail-fee-electronics', formatCurrency(app.assessedFees.electronics));
            setText('detail-fee-interior', formatCurrency(app.assessedFees.interior));
            setText('detail-fee-surcharges', formatCurrency(app.assessedFees.surcharges));
            setText('detail-fee-penalties', formatCurrency(app.assessedFees.penalties));
            setText('detail-fee-fireCode', formatCurrency(app.assessedFees.fireCodeConstructionTax));
            setText('detail-fee-hotworks', formatCurrency(app.assessedFees.hotworks));
        }
    }

    /**
     * Triggers the server to generate and download the Word document.
     */
async function exportToWord() {
        if (!applicationId) {
            alert('Application ID is missing.');
            return;
        }

        const reportUrl = `https://lgu-helpdesk-api.onrender.com/api/applications/${applicationId}/report`;
        
        try {
            const response = await fetch(reportUrl, {
                headers: getAuthHeaders() // Send the JWT token
            });

            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error('Failed to generate the report on the server.');

            // Get the filename from the response headers if available, or create a default one
            const disposition = response.headers.get('content-disposition');
            let filename = `Permit-Report-${applicationId}.docx`;
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Convert the response to a blob and save it using FileSaver.js
            const blob = await response.blob();
            saveAs(blob, filename);

        } catch (error) {
            console.error('Error exporting to Word:', error);
            alert('Could not download the report. Please check the console for errors.');
        }
    }

    // --- EVENT LISTENERS ---
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToWord);
    }

    // Initial fetch
    fetchAndDisplayApplication();
});
