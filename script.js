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