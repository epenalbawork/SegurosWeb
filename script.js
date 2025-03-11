// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('insuranceForm');
    const tabs = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const nextButton = document.querySelector('.btn-next');
    const prevButton = document.querySelector('.btn-prev');
    const submitButton = document.querySelector('.btn-submit');
    let currentTab = 0;

    // Helper functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        return phoneRegex.test(phone);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const months = {
            'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
            'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
        };
        const [day, month, year] = dateStr.split('-');
        return `${year}-${months[month.toLowerCase()]}-${day.padStart(2, '0')}`;
    }

    function showNotification(message, type = 'info') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            className: type,
            stopOnFocus: true,
            close: true,
            style: {
                background: type === 'success' ? 'linear-gradient(to right, #00b09b, #96c93d)' :
                           type === 'error' ? 'linear-gradient(to right, #ff5f6d, #ffc371)' :
                           type === 'warning' ? 'linear-gradient(to right, #f7b733, #fc4a1a)' :
                           'linear-gradient(to right, #2193b0, #6dd5ed)'
            }
        }).showToast();
    }

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
            showNotification('Por favor ingrese un correo electrónico válido', 'warning');
        }

        // Validate phone numbers if present
        const phoneFields = currentPane.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
            if (field.value && !isValidPhone(field.value)) {
                isValid = false;
                field.classList.add('error');
                showNotification('Por favor ingrese un número de teléfono válido', 'warning');
            }
        });

        if (!isValid) {
            showNotification('Por favor complete todos los campos requeridos correctamente.', 'error');
        }

        return isValid;
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

    // Real-time validation
    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }

            if (this.id === 'labCorreoUser' && this.value) {
                if (!isValidEmail(this.value)) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            }

            if (this.type === 'tel' && this.value) {
                if (!isValidPhone(this.value)) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateCurrentTab()) {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('Id') || 'fd7b60ca-fb5f-47bb-9f6d-fa5ec6c2a26c';

                // Get the current form values
                const formData = new FormData(form);
                const currentFormValues = {};
                formData.forEach((value, key) => {
                    currentFormValues[key] = value;
                });

                // Get checkbox values
                const checkboxMapping = {
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

                Object.entries(checkboxMapping).forEach(([formName, apiName]) => {
                    const checkbox = document.querySelector(`input[name="${formName}"]`);
                    if (checkbox) {
                        currentFormValues[apiName] = checkbox.checked;
                    }
                });

                // Get the original data from the API to know which fields to send back
                const response = await fetch(`https://37t74p96y5.execute-api.us-east-1.amazonaws.com/Dev/Seguro?id=${id}`);
                const data = await response.json();
                const originalData = JSON.parse(data.body);

                // Create new data object only with fields that existed in the original data
                const dataToSend = {};
                Object.keys(originalData).forEach(key => {
                    if (currentFormValues[key] !== undefined) {
                        dataToSend[key] = currentFormValues[key];
                    } else {
                        dataToSend[key] = originalData[key];
                    }
                });

                // Format dates if they exist
                if (dataToSend.labBirthDay) {
                    const date = new Date(dataToSend.labBirthDay);
                    const day = String(date.getDate()).padStart(2, '0');
                    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                    const month = monthNames[date.getMonth()];
                    const year = date.getFullYear();
                    dataToSend.labBirthDay = `${day}-${month}-${year}`;
                }

                if (dataToSend.labInicioLaboral) {
                    const date = new Date(dataToSend.labInicioLaboral);
                    const day = String(date.getDate()).padStart(2, '0');
                    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                    const month = monthNames[date.getMonth()];
                    const year = date.getFullYear();
                    dataToSend.labInicioLaboral = `${day}-${month}-${year}`;
                }

                console.log('Sending data to API:', dataToSend);

                // Send data to API
                const updateResponse = await fetch('https://37t74p96y5.execute-api.us-east-1.amazonaws.com/Dev/Seguro', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.body?.error || `HTTP error! status: ${updateResponse.status}`);
                }

                const result = await updateResponse.json();
                console.log('API Response:', result);
                
                showNotification('¡Formulario enviado exitosamente!', 'success');
                currentTab = 0;
                showTab(currentTab);
            } catch (error) {
                console.error('Error submitting form:', error);
                showNotification(`Error al enviar el formulario: ${error.message}`, 'error');
            }
        }
    });

    // Reset form handler
    const resetButton = form.querySelector('button[type="reset"]');
    resetButton.addEventListener('click', function() {
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        currentTab = 0;
        showTab(currentTab);
    });

    // Load initial data
    loadFormData();

    // Show initial tab
    showTab(currentTab);
});

// Function to load data from API
async function loadFormData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('Id') || 'fd7b60ca-fb5f-47bb-9f6d-fa5ec6c2a26c';
        
        console.log('Fetching data for ID:', id);
        
        const response = await fetch(`https://37t74p96y5.execute-api.us-east-1.amazonaws.com/Dev/Seguro?id=${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!data.body) {
            throw new Error('No data body in response');
        }
        
        let formData;
        try {
            formData = JSON.parse(data.body);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            throw new Error('Invalid JSON in response body');
        }
        
        console.log('Parsed form data:', formData);
        
        Object.keys(formData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                try {
                    if (element.type === 'checkbox') {
                        element.checked = formData[key];
                    } else if (element.type === 'date') {
                        element.value = formatDate(formData[key]);
                    } else {
                        element.value = formData[key] || '';
                    }
                    console.log(`Field ${key} filled with value:`, formData[key]);
                } catch (fieldError) {
                    console.error(`Error filling field ${key}:`, fieldError);
                }
            }
        });

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
                console.log(`Checkbox ${formField} set to:`, formData[apiField]);
            }
        });

        console.log('Form data loaded successfully');

    } catch (error) {
        console.error('Error loading form data:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        showNotification(`Error al cargar los datos del formulario: ${error.message}`, 'error');
    }
} 