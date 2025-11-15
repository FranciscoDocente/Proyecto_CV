// --- app.js (Versión 7.1 - ¡COMPLETA Y CORREGIDA!) ---

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ALMACÉN DE DATOS ---
    const cvData = {
        template: '',
        personal: { fotoOpcion: 'no' },
        experience: [],
        education: [],
        skills: {}
    };

    // --- 2. SELECCIÓN DE ELEMENTOS ---
    const steps = document.querySelectorAll('.wizard-step');
    const templateButtons = document.querySelectorAll('.select-template-btn');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('telefono');
    const nombreInput = document.getElementById('nombre');
    const addExperienceBtn = document.getElementById('add-experience-btn');
    const experienceList = document.getElementById('experience-list');
    const expPuesto = document.getElementById('exp_puesto');
    const expEmpresa = document.getElementById('exp_empresa');
    const expInicio = document.getElementById('exp_inicio');
    const expFin = document.getElementById('exp_fin');
    const expDescripcion = document.getElementById('exp_descripcion');
    const addEducationBtn = document.getElementById('add-education-btn');
    const educationList = document.getElementById('education-list');
    const eduTitulo = document.getElementById('edu_titulo');
    const eduInstitucion = document.getElementById('edu_institucion');
    const eduAnio = document.getElementById('edu_anio');
    const generateDraftBtn = document.getElementById('generate-draft-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const draftOutput = document.getElementById('draft-output');
    const editDataBtn = document.getElementById('edit-data-btn');
    const colorPicker = document.getElementById('color-picker');
    const confirmDownloadBtn = document.getElementById('confirm-download-btn');
    const finalPhotoStep = document.getElementById('final-photo-step');
    const finalPhotoUpload = document.getElementById('final-photo-upload');
    const pdfFilenameInput = document.getElementById('pdf-filename');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');

    // --- 3. FUNCIONES DE VALIDACIÓN ---
    function esEmailValido(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function esTelefonoValido(telefono) {
        const re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
        const digitos = telefono.replace(/\D/g, "").length;
        return re.test(telefono) && digitos >= 6;
    }

    // --- 4. FUNCIÓN DE NAVEGACIÓN ---
    function showStep(stepId) {
        steps.forEach(step => {
            step.id === stepId ? step.removeAttribute('hidden') : step.setAttribute('hidden', true);
        });
    }

    // --- 5. FUNCIONES DE RENDERIZADO DE LISTAS ---
    function renderExperienceList() {
        experienceList.innerHTML = '';
        if (cvData.experience.length === 0) {
            experienceList.innerHTML = '<p class="empty-list-msg">Aún no has añadido ninguna experiencia.</p>';
            return;
        }
        cvData.experience.forEach((exp, index) => {
            const descriptionHTML = exp.descripcion ? `<p class="item-description">${exp.descripcion.replace(/\n/g, '<br>')}</p>` : '';
            const itemHTML = `
                <div class="list-item" data-index="${index}">
                    <strong>${exp.puesto}</strong> en ${exp.empresa}
                    <span>(${exp.inicio} - ${exp.fin})</span>
                    ${descriptionHTML}
                </div>`;
            experienceList.innerHTML += itemHTML;
        });
    }

    function renderEducationList() {
        educationList.innerHTML = '';
        if (cvData.education.length === 0) {
            educationList.innerHTML = '<p class="empty-list-msg">Aún no has añadido ninguna formación.</p>';
            return;
        }
        cvData.education.forEach((edu, index) => {
            const itemHTML = `
                <div class="list-item" data-index="${index}">
                    <strong>${edu.titulo}</strong> en ${edu.institucion}
                    <span>(${edu.anio})</span>
                </div>`;
            educationList.innerHTML += itemHTML;
        });
    }

    // --- 6. EVENT LISTENERS ---

    // a) Botones de Plantilla (¡Este es el que fallaba!)
    templateButtons.forEach(button => {
        button.addEventListener('click', () => {
            cvData.template = button.dataset.template;
            console.log('Datos del CV actualizados:', cvData);
            showStep('step-personal');
        });
    });

    // b) Botones "Siguiente" (Con Validación)
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = button.closest('.wizard-step');
            
            if (currentStep.id === 'step-personal') {
                const nombre = nombreInput.value.trim();
                const email = emailInput.value.trim();
                const telefono = phoneInput.value.trim();

                if (nombre === '') {
                    alert('Por favor, introduce tu Nombre Completo.');
                    nombreInput.focus();
                    return;
                }
                if (email === '' && telefono === '') {
                    alert('Por favor, introduce al menos un email o un teléfono.');
                    phoneInput.focus();
                    return;
                }
                if (email !== '' && !esEmailValido(email)) {
                    alert('El formato del email no es válido. (ej: usuario@dominio.com)');
                    emailInput.focus();
                    return;
                }
                if (telefono !== '' && !esTelefonoValido(telefono)) {
                    alert('El número de teléfono no parece válido. Debe tener al menos 6 dígitos.');
                    phoneInput.focus();
                    return;
                }
                
                cvData.personal.fotoOpcion = document.querySelector('input[name="foto-opcion"]:checked').value;
                cvData.personal.nombre = nombre;
                cvData.personal.puesto = document.getElementById('puesto').value;
                cvData.personal.resumen = document.getElementById('resumen').value;
                cvData.personal.telefono = telefono;
                cvData.personal.email = email;
                cvData.personal.linkedin = document.getElementById('linkedin').value;
                cvData.personal.otro_enlace = document.getElementById('otro_enlace').value;
                console.log('Datos (validados) guardados:', cvData);
            }
            
            const nextStep = currentStep.nextElementSibling;
            if (nextStep && nextStep.classList.contains('wizard-step')) {
                showStep(nextStep.id);
            }
        });
    });

    // c) Botones "Anterior"
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = button.closest('.wizard-step');
            const prevStep = currentStep.previousElementSibling;
            if (prevStep && prevStep.classList.contains('wizard-step')) showStep(prevStep.id);
        });
    });

    // d) Botón "Añadir Experiencia" (¡CON VALIDACIÓN DE FECHAS!)
    addExperienceBtn.addEventListener('click', () => {
        const puesto = expPuesto.value.trim();
        const empresa = expEmpresa.value.trim();
        
        // 1. Validación de campos obligatorios (la que ya teníamos)
        if (puesto === '' || empresa === '') {
            alert('Por favor, rellena al menos el puesto y la empresa.');
            return;
        }

        const inicioStr = expInicio.value.trim();
        const finStr = expFin.value.trim();
        const descripcion = expDescripcion.value.trim();

        // 2. *** ¡NUEVA VALIDACIÓN DE FECHAS! ***
        // Convertimos a números
        const inicioNum = parseInt(inicioStr);
        const finNum = parseInt(finStr);

        // Comprobamos si los campos NO están vacíos Y AMBOS son números
        // (Esto ignora la palabra "Presente", ya que parseInt("Presente") da NaN)
        if (inicioStr !== "" && finStr !== "" && !isNaN(inicioNum) && !isNaN(finNum)) {
            
            // ¡La comprobación!
            if (inicioNum > finNum) {
                alert('Error: El año de inicio no puede ser posterior al año de fin.');
                expInicio.focus(); // Pone el cursor en el campo erróneo
                return; // Detiene la ejecución
            }
        }
        
        // 3. Si todo es válido, guardamos
        cvData.experience.push({ 
            puesto, 
            empresa, 
            inicio: inicioStr, 
            fin: finStr, 
            descripcion 
        });
        
        // 4. Renderizar y limpiar
        renderExperienceList();
        expPuesto.value = ''; 
        expEmpresa.value = ''; 
        expInicio.value = ''; 
        expFin.value = ''; 
        expDescripcion.value = '';
    });

    // e) Botón "Añadir Formación"
    addEducationBtn.addEventListener('click', () => {
        const titulo = eduTitulo.value.trim();
        const institucion = eduInstitucion.value.trim();
        
        if (titulo === '' || institucion === '') {
            alert('Por favor, rellena al menos el título y la institución.');
            return;
        }

        const anio = eduAnio.value.trim();
        cvData.education.push({ titulo, institucion, anio });
        renderEducationList();
        eduTitulo.value = ''; eduInstitucion.value = ''; eduAnio.value = '';
    });

    // f) Botón "Generar Borrador"
    generateDraftBtn.addEventListener('click', async () => {
        cvData.skills.aptitudes = document.getElementById('aptitudes').value;
        cvData.skills.conocimientos = document.getElementById('conocimientos').value;
        cvData.skills.idiomas = document.getElementById('idiomas').value;
        cvData.skills.intereses = document.getElementById('intereses').value;
        
        showStep('step-draft');
        loadingSpinner.removeAttribute('hidden');
        draftOutput.innerHTML = '';
        draftOutput.setAttribute('hidden', true);

        try {
            const response = await fetch('/api/generar-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cvData),
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);
            const result = await response.json();
            
            // Usamos Marked.js para convertir el Markdown de la IA en HTML
            draftOutput.innerHTML = marked.parse(result.draft);
            
            const nombreSugerido = `CV_${cvData.personal.nombre || 'TuNombre'}.pdf`;
            pdfFilenameInput.value = nombreSugerido.replace(/ /g, '_');

        } catch (error) {
            console.error('Error al generar el borrador:', error);
            draftOutput.innerHTML = `<p class="error-msg">Lo sentimos, algo salió mal.</p>`;
        } finally {
            loadingSpinner.setAttribute('hidden', true);
            draftOutput.removeAttribute('hidden');
        }
    });

    // g) Botón "Modificar Datos"
    editDataBtn.addEventListener('click', () => {
        showStep('step-personal');
    });

    // h) Selector de Color
    colorPicker.addEventListener('input', (event) => {
        const nuevoColor = event.target.value;
        document.documentElement.style.setProperty('--color-primario', nuevoColor);
    });

    // --- 7. LÓGICA DE DESCARGA (PDF) ---

    // i) Botón "Confirmar y Descargar" (Muestra el paso final)
    confirmDownloadBtn.addEventListener('click', () => {
        finalPhotoStep.removeAttribute('hidden');
        
        if (cvData.personal.fotoOpcion === 'no') {
            document.querySelector('#final-photo-step .form-group').setAttribute('hidden', true);
        } else {
            document.querySelector('#final-photo-step .form-group').removeAttribute('hidden');
        }
    });

    // j) Botón "Generar PDF" (El botón final)
    generatePdfBtn.addEventListener('click', () => {
        const fotoSubida = finalPhotoUpload.files[0];
        
        if (fotoSubida && cvData.personal.fotoOpcion === 'si') {
            const reader = new FileReader();
            reader.onload = function(event) {
                const fotoDataURL = event.target.result;
                const imagenEnBorrador = draftOutput.querySelector('img');
                if (imagenEnBorrador) {
                    imagenEnBorrador.src = fotoDataURL;
                }
                ejecutarGeneradorPDF();
            };
            reader.readAsDataURL(fotoSubida);
        } else {
            ejecutarGeneradorPDF();
        }
    });

    // k) La función que genera el PDF
    function ejecutarGeneradorPDF() {
        const elemento = document.getElementById('draft-output');
        const nombreArchivo = pdfFilenameInput.value || 'mi_cv.pdf';

        const opt = {
            margin:       [0.5, 0.5, 0.5, 0.5], // Márgenes en pulgadas
            filename:     nombreArchivo,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        finalPhotoStep.setAttribute('hidden', true);
        
        html2pdf().from(elemento).set(opt).save();
    }
    
    // --- 8. INICIALIZACIÓN ---
    renderExperienceList();
    renderEducationList();
    showStep('step-template');
});