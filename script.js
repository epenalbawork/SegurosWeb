document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('insuranceForm');
    const tabs = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const nextButton = document.querySelector('.btn-next');
    const prevButton = document.querySelector('.btn-prev');
    const submitButton = document.querySelector('.btn-submit');
    let currentTab = 0;

    // Tab navigation
    function showTab(index) {
        // Hide all tabs
        tabPanes.forEach(pane => pane.classList.remove('active'));
        tabs.forEach(tab => tab.classList.remove('active'));

        // Show selected tab
        tabPanes[index].classList.add('active');
        tabs[index].classList.add('active');

        // Update navigation buttons
        prevButton.style.display = index === 0 ? 'none' : 'block';
        nextButton.style.display = index === tabPanes.length - 1 ? 'none' : 'block';
        submitButton.style.display = index === tabPanes.length - 1 ? 'block' : 'none';
    }

    // Tab click handlers
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            if (validateCurrentTab()) {
                currentTab = index;
                showTab(currentTab);
            }
        });
    });

    // Next button handler
    nextButton.addEventListener('click', () => {
        if (validateCurrentTab()) {
            currentTab++;
            showTab(currentTab);
        }
    });

    // Previous button handler
    prevButton.addEventListener('click', () => {
        currentTab--;
        showTab(currentTab);
    });

    // Validate current tab
    function validateCurrentTab() {
        const currentPane = tabPanes[currentTab];
        const requiredFields = currentPane.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });

        // Validate email if present
        const emailField = currentPane.querySelector('#labCorreoUser');
        if (emailField && emailField.value && !isValidEmail(emailField.value)) {
            isValid = false;
            emailField.classList.add('error');
            alert('Por favor ingrese un correo electrónico válido');
        }

        // Validate phone numbers if present
        const phoneFields = currentPane.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
            if (field.value && !isValidPhone(field.value)) {
                isValid = false;
                field.classList.add('error');
                alert('Por favor ingrese un número de teléfono válido');
            }
        });

        if (!isValid) {
            alert('Por favor complete todos los campos requeridos correctamente.');
        }

        return isValid;
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateCurrentTab()) {
            // Get form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Convert form data to JSON
            const jsonData = JSON.stringify(data, null, 2);
            
            // Here you would typically send the data to your server
            console.log('Form submitted successfully:', jsonData);
            
            // Show success message
            alert('¡Formulario enviado exitosamente!');
            
            // Reset form
            form.reset();
            currentTab = 0;
            showTab(currentTab);
        }
    });

    // Reset form
    const resetButton = form.querySelector('button[type="reset"]');
    resetButton.addEventListener('click', function() {
        // Remove error classes
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        currentTab = 0;
        showTab(currentTab);
    });

    // Real-time validation
    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }

            // Validate email in real-time
            if (this.id === 'labCorreoUser' && this.value) {
                if (!isValidEmail(this.value)) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            }

            // Validate phone numbers in real-time
            if (this.type === 'tel' && this.value) {
                if (!isValidPhone(this.value)) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            }
        });
    });
});

// Helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
}

// Format phone numbers as they're typed
document.querySelectorAll('input[type="tel"]').forEach(field => {
    field.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
        }
        e.target.value = value;
    });
});

// Function to format date from "DD-MMM-YYYY" to "YYYY-MM-DD"
function formatDate(dateStr) {
    if (!dateStr) return '';
    const months = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
    };
    const [day, month, year] = dateStr.split('-');
    return `${year}-${months[month.toLowerCase()]}-${day.padStart(2, '0')}`;
}

// Function to load data from API and fill form
async function loadFormData() {
    try {
        // Get ID from URL or use default
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id') || 'fd7b60ca-fb5f-47bb-9f6d-fa5ec6c2a26c';
        
        const response = await fetch(`https://37t74p96y5.execute-api.us-east-1.amazonaws.com/Dev/Seguro?id=${id}`);
        const data = await response.json();
        
        // Parse the body string into an object
        const formData = JSON.parse(data.body);
        
        // Fill form fields
        Object.keys(formData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = formData[key];
                } else if (element.type === 'date') {
                    element.value = formatDate(formData[key]);
                } else {
                    element.value = formData[key];
                }
            }
        });

        // Handle special cases for checkboxes in health questionnaire
        const healthCheckboxes = {
            'cerebrovascular_prospecto': 'labProspecto1',
            'cerebrovascular_conyuge': 'labConyuge1',
            'cerebrovascular_hijos': 'labHijos1',
            'epilepsia_prospecto': 'labProspecto2',
            'epilepsia_conyuge': 'labConyuge2',
            'epilepsia_hijos': 'labHijos2',
            'ojos_prospecto': 'labProspecto3',
            'ojos_conyuge': 'labConyuge3',
            'ojos_hijos': 'labHijos3',
            'respiratorio_prospecto': 'labProspecto4',
            'respiratorio_conyuge': 'labConyuge4',
            'respiratorio_hijos': 'labHijos4',
            'cardiaco_prospecto': 'labProspecto5',
            'cardiaco_conyuge': 'labConyuge5',
            'cardiaco_hijos': 'labHijos5'
        };

        Object.entries(healthCheckboxes).forEach(([formField, apiField]) => {
            const checkbox = document.querySelector(`input[name="${formField}"]`);
            if (checkbox && formData[apiField] !== undefined) {
                checkbox.checked = formData[apiField];
            }
        });

    } catch (error) {
        console.error('Error loading form data:', error);
        alert('Error al cargar los datos del formulario. Por favor, intente nuevamente.');
    }
}

// Load form data when page loads
document.addEventListener('DOMContentLoaded', loadFormData);

// Tab navigation
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and panes
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        
        // Show/hide navigation buttons
        const prevButton = document.querySelector('.btn-prev');
        const nextButton = document.querySelector('.btn-next');
        const submitButton = document.querySelector('.btn-submit');
        
        if (button.dataset.tab === 'general') {
            prevButton.style.display = 'none';
            nextButton.style.display = 'block';
            submitButton.style.display = 'none';
        } else if (button.dataset.tab === 'payment') {
            prevButton.style.display = 'block';
            nextButton.style.display = 'none';
            submitButton.style.display = 'block';
        } else {
            prevButton.style.display = 'block';
            nextButton.style.display = 'block';
            submitButton.style.display = 'none';
        }
    });
});

// Navigation buttons
document.querySelector('.btn-next').addEventListener('click', () => {
    const activeTab = document.querySelector('.tab-button.active');
    const nextTab = activeTab.nextElementSibling;
    if (nextTab) {
        nextTab.click();
    }
});

document.querySelector('.btn-prev').addEventListener('click', () => {
    const activeTab = document.querySelector('.tab-button.active');
    const prevTab = activeTab.previousElementSibling;
    if (prevTab) {
        prevTab.click();
    }
}); 