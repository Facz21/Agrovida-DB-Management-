// AgroVida Varieties Management Dashboard JavaScript

const API_BASE_URL = '/api';
let currentVarieties = [];
let currentCropTypes = [];
let editingVarietyId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// Load all data
async function loadData() {
    showLoading(true);
    try {
        await Promise.all([
            loadVarieties(),
            loadCropTypes()
        ]);
        showAlert('Data loaded successfully', 'success');
    } catch (error) {
        showAlert('Error loading data: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

// Load varieties from API
async function loadVarieties() {
    try {
        const response = await fetch(`${API_BASE_URL}/varieties`);
        const result = await response.json();
        
        if (result.success) {
            currentVarieties = result.data;
            renderVarietiesTable();
            updateRecordCount();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        throw new Error('Failed to load varieties: ' + error.message);
    }
}

// Load crop types for dropdown
async function loadCropTypes() {
    try {
        const response = await fetch(`${API_BASE_URL}/crop-types`);
        const result = await response.json();
        
        if (result.success) {
            currentCropTypes = result.data;
            populateCropTypeDropdown();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        throw new Error('Failed to load crop types: ' + error.message);
    }
}

// Render varieties table
function renderVarietiesTable() {
    const tbody = document.getElementById('varietiesTableBody');
    
    if (currentVarieties.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-seedling fa-2x mb-2"></i>
                    <br>No varieties found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = currentVarieties.map(variety => `
        <tr>
            <td><span class="badge bg-secondary">${variety.variety_id}</span></td>
            <td>
                <strong>${escapeHtml(variety.variety_name)}</strong>
            </td>
            <td>
                <span class="badge bg-success">${escapeHtml(variety.crop_type_name)}</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editVariety(${variety.variety_id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteVariety(${variety.variety_id}, '${escapeHtml(variety.variety_name)}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Populate crop type dropdown
function populateCropTypeDropdown() {
    const select = document.getElementById('cropTypeId');
    select.innerHTML = '<option value="">Select a crop type...</option>';
    
    currentCropTypes.forEach(cropType => {
        const option = document.createElement('option');
        option.value = cropType.crop_type_id;
        option.textContent = cropType.crop_type_name;
        select.appendChild(option);
    });
}

// Open create modal
function openCreateModal() {
    editingVarietyId = null;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus me-2"></i>Add New Variety';
    document.getElementById('varietyForm').reset();
    document.getElementById('varietyId').value = '';
}

// Edit variety
function editVariety(varietyId) {
    const variety = currentVarieties.find(v => v.variety_id === varietyId);
    if (!variety) {
        showAlert('Variety not found', 'danger');
        return;
    }

    editingVarietyId = varietyId;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Variety';
    document.getElementById('varietyId').value = variety.variety_id;
    document.getElementById('varietyName').value = variety.variety_name;
    document.getElementById('cropTypeId').value = variety.crop_type_id;

    const modal = new bootstrap.Modal(document.getElementById('varietyModal'));
    modal.show();
}

// Save variety (create or update)
async function saveVariety() {
    const form = document.getElementById('varietyForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const varietyData = {
        variety_name: document.getElementById('varietyName').value.trim(),
        crop_type_id: parseInt(document.getElementById('cropTypeId').value)
    };

    // Validation
    if (varietyData.variety_name.length < 2) {
        showAlert('Variety name must be at least 2 characters long', 'danger');
        return;
    }

    try {
        let response;
        if (editingVarietyId) {
            // Update existing variety
            response = await fetch(`${API_BASE_URL}/varieties/${editingVarietyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(varietyData)
            });
        } else {
            // Create new variety
            response = await fetch(`${API_BASE_URL}/varieties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(varietyData)
            });
        }

        const result = await response.json();

        if (result.success) {
            showAlert(result.message, 'success');
            await loadVarieties();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('varietyModal'));
            modal.hide();
        } else {
            showAlert(result.error || result.message, 'danger');
        }
    } catch (error) {
        showAlert('Error saving variety: ' + error.message, 'danger');
    }
}

// Delete variety
function deleteVariety(varietyId, varietyName) {
    editingVarietyId = varietyId;
    document.getElementById('deleteVarietyName').textContent = varietyName;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// Confirm delete
async function confirmDelete() {
    if (!editingVarietyId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/varieties/${editingVarietyId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showAlert(result.message, 'success');
            await loadVarieties();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            modal.hide();
        } else {
            showAlert(result.error || result.message, 'danger');
        }
    } catch (error) {
        showAlert('Error deleting variety: ' + error.message, 'danger');
    }

    editingVarietyId = null;
}

// Filter table based on search input
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredVarieties = currentVarieties.filter(variety => 
        variety.variety_name.toLowerCase().includes(searchTerm) ||
        variety.crop_type_name.toLowerCase().includes(searchTerm)
    );

    // Temporarily update the varieties for rendering
    const originalVarieties = currentVarieties;
    currentVarieties = filteredVarieties;
    renderVarietiesTable();
    updateRecordCount();
    currentVarieties = originalVarieties;
}

// Show/hide loading indicator
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = show ? 'block' : 'none';
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
            <i class="fas fa-${getAlertIcon(type)} me-2"></i>
            ${escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-remove success alerts after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 3000);
    }
}

// Get alert icon based on type
function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-triangle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Update record count
function updateRecordCount() {
    const count = currentVarieties.length;
    document.getElementById('recordCount').textContent = `${count} record${count !== 1 ? 's' : ''}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
