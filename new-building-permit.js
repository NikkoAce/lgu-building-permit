/**
 * This script handles interactions on the New Application Form page.
 * It now correctly reads all form fields and includes the JWT token in its API request.
 */
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    const API_URL = 'http://localhost:3001/api/applications';

    if (saveBtn) {
        saveBtn.addEventListener('click', async (event) => {
            event.preventDefault(); 
            
                  // CORRECTED: Define selectedOccupancies before it is used.
            const selectedOccupancies = [];
            document.querySelectorAll('input[name="characterOfOccupancy"]:checked').forEach((checkbox) => {
                selectedOccupancies.push(checkbox.value);
            });
 
            // Collect data from all form fields
            const applicationData = {
                // Top Level Info
                permitCategory: 'Building Permit',
                applicationType: document.querySelector('input[name="applicationType"]:checked')?.value,
                permitType: document.querySelector('input[name="permitType"]:checked')?.value,
                appliesFor: {
                    locationalClearance: document.getElementById('locationalClearance')?.checked,
                    fireSafetyClearance: document.getElementById('fireSafetyClearance')?.checked,
                },
                // Applicant
                applicant: document.getElementById('applicantName')?.value,
                applicantTIN: document.getElementById('applicantTIN')?.value,
                applicantAddress: document.getElementById('applicantAddress')?.value,
                applicantContactNo: document.getElementById('applicantContactNo')?.value,
                // Location
                location: document.getElementById('projectLocation')?.value,
                lotNo: document.getElementById('lotNo')?.value,
                blkNo: document.getElementById('blkNo')?.value,
                tctNo: document.getElementById('tctNo')?.value,
                taxDecNo: document.getElementById('taxDecNo')?.value,
                // Scope & Details
                scopeOfWork: document.getElementById('scopeOfWork')?.value,
                characterOfOccupancy: selectedOccupancies,
                numberOfUnits: document.getElementById('numberOfUnits')?.value,
                numberOfStorey: document.getElementById('numberOfStorey')?.value,
                totalFloorArea: document.getElementById('totalFloorArea')?.value,
                lotArea: document.getElementById('lotArea')?.value,
                // Dates
                proposedDateOfConstruction: document.getElementById('proposedDateOfConstruction')?.value,
                expectedDateOfCompletion: document.getElementById('expectedDateOfCompletion')?.value,
                // Costs
                costOfEquipmentInstalled: document.getElementById('costEquipment')?.value,
                costBreakdown: {
                    building: document.getElementById('costBuilding')?.value,
                    electrical: document.getElementById('costElectrical')?.value,
                    mechanical: document.getElementById('costMechanical')?.value,
                    electronics: document.getElementById('costElectronics')?.value,
                    plumbing: document.getElementById('costPlumbing')?.value,
                    others: document.getElementById('costOthers')?.value,
                },
                // Inspector
                inspector: {
                    name: document.getElementById('inspectorName')?.value,
                    address: document.getElementById('inspectorAddress')?.value,
                    prcNo: document.getElementById('inspectorPrcNo')?.value,
                    ptrNo: document.getElementById('inspectorPtrNo')?.value,
                    issuedAt: document.getElementById('inspectorIssuedAt')?.value,
                    validity: document.getElementById('inspectorValidity')?.value,
                    dateIssued: document.getElementById('inspectorDateIssued')?.value,
                    tin: document.getElementById('inspectorTin')?.value,
                },
                // Applicant Signature (Box 3)
                applicantSignature: {
                    govIdNo: document.getElementById('applicantGovId')?.value,
                    dateIssued: document.getElementById('applicantIdDate')?.value,
                    placeIssued: document.getElementById('applicantIdPlace')?.value,
                },
                // Lot Owner Consent (Box 4)
                lotOwnerConsent: {
                    name: document.getElementById('lotOwnerName')?.value,
                    govIdNo: document.getElementById('lotOwnerGovId')?.value,
                    dateIssued: document.getElementById('lotOwnerIdDate')?.value,
                    placeIssued: document.getElementById('lotOwnerIdPlace')?.value,
                },
                // Notary Info (Box 5)
                notaryInfo: {
                    docNo: document.getElementById('notaryDocNo')?.value,
                    pageNo: document.getElementById('notaryPageNo')?.value,
                    bookNo: document.getElementById('notaryBookNo')?.value,
                    seriesOf: document.getElementById('notarySeriesOf')?.value,
                    notaryPublic: document.getElementById('notaryPublic')?.value,
                },
                // Assessed Fees (Box 6)
                assessedFees: {
                    zoning: document.getElementById('feeZoning')?.value,
                    filingFee: document.getElementById('feeFiling')?.value,
                    lineAndGrade: document.getElementById('feeLineGrade')?.value,
                    fencing: document.getElementById('feeFencing')?.value,
                    architectural: document.getElementById('feeArchitectural')?.value,
                    civilStructural: document.getElementById('feeCivil')?.value,
                    electrical: document.getElementById('feeElectrical')?.value,
                    mechanical: document.getElementById('feeMechanical')?.value,
                    sanitary: document.getElementById('feeSanitary')?.value,
                    plumbing: document.getElementById('feePlumbing')?.value,
                    electronics: document.getElementById('feeElectronics')?.value,
                    interior: document.getElementById('feeInterior')?.value,
                    surcharges: document.getElementById('feeSurcharges')?.value,
                    penalties: document.getElementById('feePenalties')?.value,
                    fireCodeConstructionTax: document.getElementById('feeFireCodeTax')?.value,
                    hotworks: document.getElementById('feeHotworks')?.value,
                }
            };

            // UPDATED: Added more robust client-side validation
            if (!applicationData.applicant) {
                alert('Please enter the Applicant Name.');
                return;
            }
            if (!applicationData.location) {
                alert('Please enter the Project Location.');
                return;
            }
             if (!applicationData.scopeOfWork) {
                alert('Please select a Scope of Work.');
                return;
            }
            if (selectedOccupancies.length === 0) {
                alert('Please select at least one Use or Character of Occupancy.');
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(applicationData),
                });

                if (response.status === 401) {
                    logout();
                    return;
                }
                
                if (!response.ok) {
                    const errorResult = await response.json(); 
                    throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
                }
                
                window.location.href = 'dashboard.html';

            } catch (error) {
                console.error('Error saving application:', error);
                alert(`Failed to save application: ${error.message}`);
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
});
