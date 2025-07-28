/**
 * This script handles fetching, populating, and updating an existing application.
 * It includes the JWT token in its API requests and the interactive map feature.
 */
document.addEventListener('DOMContentLoaded', () => {
    const loadingState = document.getElementById('loadingState');
    const form = document.getElementById('editApplicationForm');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('id');

    if (!applicationId) {
        form.innerHTML = '<p class="text-red-500 text-center">No application ID provided. Please return to the dashboard.</p>';
        loadingState.classList.add('hidden');
        form.classList.remove('hidden');
        return;
    }

    const API_URL = `https://lgu-building-permit.onrender.com/api/applications/${applicationId}`;

    /**
     * Fetches existing data and populates the form fields.
     */
    const populateForm = async () => {
        try {
            const response = await fetch(API_URL, { headers: getAuthHeaders() });
            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error('Failed to fetch application data.');
            
            const app = await response.json();
            
            // --- Helper functions for populating form ---
            const setValue = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.value = value || '';
            };
            const setRadio = (name, value) => {
                if (!value) return;
                const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
                if (el) el.checked = true;
            };
            const setCheckbox = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.checked = value || false;
            };
            const setCheckboxes = (name, values) => {
                if (!Array.isArray(values)) return;
                values.forEach(value => {
                    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
                    if (el) el.checked = true;
                });
            };
            const formatDateForInput = (dateString) => {
                if (!dateString) return '';
                return new Date(dateString).toISOString().split('T')[0];
            };

            // --- Populate all form fields ---
            setValue('permitNo', app.permitNo);
            setValue('applicationStatus', app.status);
            setRadio('applicationType', app.applicationType);
            setRadio('permitType', app.permitType);
            if (app.appliesFor) {
                setCheckbox('locationalClearance', app.appliesFor.locationalClearance);
                setCheckbox('fireSafetyClearance', app.appliesFor.fireSafetyClearance);
            }
            setValue('applicantName', app.applicant);
            setValue('applicantTIN', app.applicantTIN);
            setValue('applicantAddress', app.applicantAddress);
            setValue('applicantContactNo', app.applicantContactNo);
            setValue('projectLocation', app.location);
            setValue('lotNo', app.lotNo);
            setValue('blkNo', app.blkNo);
            setValue('tctNo', app.tctNo);
            setValue('taxDecNo', app.taxDecNo);
            setValue('scopeOfWork', app.scopeOfWork);
            setCheckboxes('characterOfOccupancy', app.characterOfOccupancy);
            setValue('numberOfUnits', app.numberOfUnits);
            setValue('numberOfStorey', app.numberOfStorey);
            setValue('totalFloorArea', app.totalFloorArea);
            setValue('lotArea', app.lotArea);
            setValue('proposedDateOfConstruction', formatDateForInput(app.proposedDateOfConstruction));
            setValue('expectedDateOfCompletion', formatDateForInput(app.expectedDateOfCompletion));
            
            if(app.costBreakdown){
                setValue('costBuilding', app.costBreakdown.building);
                setValue('costElectrical', app.costBreakdown.electrical);
                setValue('costMechanical', app.costBreakdown.mechanical);
                setValue('costElectronics', app.costBreakdown.electronics);
                setValue('costPlumbing', app.costBreakdown.plumbing);
                setValue('costOthers', app.costBreakdown.others);
            }
            setValue('costEquipment', app.costOfEquipmentInstalled);

            if(app.inspector){
                setValue('inspectorName', app.inspector.name);
                setValue('inspectorAddress', app.inspector.address);
                setValue('inspectorPrcNo', app.inspector.prcNo);
                setValue('inspectorPtrNo', app.inspector.ptrNo);
                setValue('inspectorIssuedAt', app.inspector.issuedAt);
                setValue('inspectorValidity', app.inspector.validity);
                setValue('inspectorDateIssued', app.inspector.dateIssued);
                setValue('inspectorTin', app.inspector.tin);
            }
            
            if(app.applicantSignature){
                setValue('applicantGovId', app.applicantSignature.govIdNo);
                setValue('applicantIdDate', app.applicantSignature.dateIssued);
                setValue('applicantIdPlace', app.applicantSignature.placeIssued);
            }

            if(app.lotOwnerConsent){
                setValue('lotOwnerName', app.lotOwnerConsent.name);
                setValue('lotOwnerGovId', app.lotOwnerConsent.govIdNo);
                setValue('lotOwnerIdDate', app.lotOwnerConsent.dateIssued);
                setValue('lotOwnerIdPlace', app.lotOwnerConsent.placeIssued);
            }

            if(app.notaryInfo){
                setValue('notaryDocNo', app.notaryInfo.docNo);
                setValue('notaryPageNo', app.notaryInfo.pageNo);
                setValue('notaryBookNo', app.notaryInfo.bookNo);
                setValue('notarySeriesOf', app.notaryInfo.seriesOf);
                setValue('notaryPublic', app.notaryInfo.notaryPublic);
            }
            
            if(app.assessedFees){
                setValue('feeZoning', app.assessedFees.zoning);
                setValue('feeFiling', app.assessedFees.filingFee);
                setValue('feeLineGrade', app.assessedFees.lineAndGrade);
                setValue('feeFencing', app.assessedFees.fencing);
                setValue('feeArchitectural', app.assessedFees.architectural);
                setValue('feeCivil', app.assessedFees.civilStructural);
                setValue('feeElectrical', app.assessedFees.electrical);
                setValue('feeMechanical', app.assessedFees.mechanical);
                setValue('feeSanitary', app.assessedFees.sanitary);
                setValue('feePlumbing', app.assessedFees.plumbing);
                setValue('feeElectronics', app.assessedFees.electronics);
                setValue('feeInterior', app.assessedFees.interior);
                setValue('feeSurcharges', app.assessedFees.surcharges);
                setValue('feePenalties', app.assessedFees.penalties);
                setValue('feeFireCodeTax', app.assessedFees.fireCodeConstructionTax);
                setValue('feeHotworks', app.assessedFees.hotworks);
            }

            loadingState.classList.add('hidden');
            form.classList.remove('hidden');

            // --- Initialize the Map ---
            // This must be called AFTER the form is made visible.
            initializeMap(app.latitude, app.longitude);

        } catch (error) {
            console.error('Error populating form:', error);
            loadingState.innerHTML = `<p class="text-red-500 text-center">Error loading application data.</p>`;
        }
    };

    /**
     * Initializes the Leaflet map and the draggable marker.
     */
    function initializeMap(lat, lng) {
        const defaultCoords = [14.1155, 122.9560]; // Daet, Camarines Norte
        const initialCoords = (lat && lng) ? [lat, lng] : defaultCoords;

        const map = L.map('map').setView(initialCoords, 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker(initialCoords, { draggable: true }).addTo(map);

        document.getElementById('latitude').value = initialCoords[0];
        document.getElementById('longitude').value = initialCoords[1];

        marker.on('dragend', function(event) {
            const position = marker.getLatLng();
            document.getElementById('latitude').value = position.lat;
            document.getElementById('longitude').value = position.lng;
        });

        // UPDATED: This forces the map to re-render after its container becomes visible.
        // A timeout ensures the browser has finished rendering the layout changes.
        setTimeout(() => {
            map.invalidateSize();
        }, 0);
    }

    /**
     * Collects data from the form and sends a PUT request to update it.
     */
    const handleSaveChanges = async () => {
        const selectedOccupancies = [];
        document.querySelectorAll('input[name="characterOfOccupancy"]:checked').forEach((checkbox) => {
            selectedOccupancies.push(checkbox.value);
        });

        const updatedData = {
            status: document.getElementById('applicationStatus')?.value,
            applicationType: document.querySelector('input[name="applicationType"]:checked')?.value,
            permitType: document.querySelector('input[name="permitType"]:checked')?.value,
            appliesFor: {
                locationalClearance: document.getElementById('locationalClearance')?.checked,
                fireSafetyClearance: document.getElementById('fireSafetyClearance')?.checked,
            },
            applicant: document.getElementById('applicantName')?.value,
            applicantTIN: document.getElementById('applicantTIN')?.value,
            applicantAddress: document.getElementById('applicantAddress')?.value,
            applicantContactNo: document.getElementById('applicantContactNo')?.value,
            location: document.getElementById('projectLocation')?.value,
            latitude: document.getElementById('latitude')?.value,
            longitude: document.getElementById('longitude')?.value,
            lotNo: document.getElementById('lotNo')?.value,
            blkNo: document.getElementById('blkNo')?.value,
            tctNo: document.getElementById('tctNo')?.value,
            taxDecNo: document.getElementById('taxDecNo')?.value,
            scopeOfWork: document.getElementById('scopeOfWork')?.value,
            characterOfOccupancy: selectedOccupancies,
            numberOfUnits: document.getElementById('numberOfUnits')?.value,
            numberOfStorey: document.getElementById('numberOfStorey')?.value,
            totalFloorArea: document.getElementById('totalFloorArea')?.value,
            lotArea: document.getElementById('lotArea')?.value,
            proposedDateOfConstruction: document.getElementById('proposedDateOfConstruction')?.value,
            expectedDateOfCompletion: document.getElementById('expectedDateOfCompletion')?.value,
            costOfEquipmentInstalled: document.getElementById('costEquipment')?.value,
            costBreakdown: {
                building: document.getElementById('costBuilding')?.value,
                electrical: document.getElementById('costElectrical')?.value,
                mechanical: document.getElementById('costMechanical')?.value,
                electronics: document.getElementById('costElectronics')?.value,
                plumbing: document.getElementById('costPlumbing')?.value,
                others: document.getElementById('costOthers')?.value,
            },
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
            applicantSignature: {
                govIdNo: document.getElementById('applicantGovId')?.value,
                dateIssued: document.getElementById('applicantIdDate')?.value,
                placeIssued: document.getElementById('applicantIdPlace')?.value,
            },
            lotOwnerConsent: {
                name: document.getElementById('lotOwnerName')?.value,
                govIdNo: document.getElementById('lotOwnerGovId')?.value,
                dateIssued: document.getElementById('lotOwnerIdDate')?.value,
                placeIssued: document.getElementById('lotOwnerIdPlace')?.value,
            },
            notaryInfo: {
                docNo: document.getElementById('notaryDocNo')?.value,
                pageNo: document.getElementById('notaryPageNo')?.value,
                bookNo: document.getElementById('notaryBookNo')?.value,
                seriesOf: document.getElementById('notarySeriesOf')?.value,
                notaryPublic: document.getElementById('notaryPublic')?.value,
            },
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

        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedData),
            });

            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error('Failed to save changes.');

            alert('Changes saved successfully!');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Failed to save changes.');
        }
    };

    // Event Listeners
    if(saveChangesBtn) {
        saveChangesBtn.addEventListener('click', (event) => {
            event.preventDefault();
            handleSaveChanges();
        });
    }

    if(cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    populateForm();
});
