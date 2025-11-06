// --- app.js (Versión 7 - Generación de PDF) ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ALMACÉN DE DATOS ---
    const cvData = { /* ... (sin cambios) ... */ };

    // --- 2. SELECCIÓN DE ELEMENTOS ---
    // (Idéntico a la v6, solo añadimos los nuevos botones)
    const steps = document.querySelectorAll('.wizard-step');
    const templateButtons = document.querySelectorAll('.select-template-btn');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('telefono');
    const nombreInput = document.getElementById('nombre');
    // ... (todos los demás campos de formulario) ...
    const generateDraftBtn = document.getElementById('generate-draft-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const draftOutput = document.getElementById('draft-output');
    const editDataBtn = document.getElementById('edit-data-btn');
    const colorPicker = document.getElementById('color-picker');

    // *** NUEVOS Elementos para el PDF ***
    const confirmDownloadBtn = document.getElementById('confirm-download-btn');
    const finalPhotoStep = document.getElementById('final-photo-step');
    const finalPhotoUpload = document.getElementById('final-photo-upload');
    const pdfFilenameInput = document.getElementById('pdf-filename');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');


    // --- 3. FUNCIONES DE VALIDACIÓN ---
    // (Idénticas a la v6)
    function esEmailValido(email) { /* ... (sin cambios) ... */ }
    function esTelefonoValido(telefono) { /* ... (sin cambios) ... */ }
    
    // --- 4. FUNCIÓN DE NAVEGACIÓN ---
    // (Idéntica a la v6)
    function showStep(stepId) { /* ... (sin cambios) ... */ }

    // --- 5. FUNCIONES DE RENDERIZADO DE LISTAS ---
    // (Idénticas a la v6)
    function renderExperienceList() { /* ... (sin cambios) ... */ }
    function renderEducationList() { /* ... (sin cambios) ... */ }


    // --- 6. EVENT LISTENERS ---
    
    // (a, b, c, d, e - Idénticos a la v6)
    templateButtons.forEach(/* ... (sin cambios) ... */);
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            // (Toda la lógica de validación de la v6 va aquí)
            // ... (sin cambios) ...
        });
    });
    prevButtons.forEach(/* ... (sin cambios) ... */);
    addExperienceBtn.addEventListener('click', () => { /* ... (sin cambios) ... */ });
    addEducationBtn.addEventListener('click', () => { /* ... (sin cambios) ... */ });


    // (f) Botón "Generar Borrador"
    // (Idéntico a la v6)
    generateDraftBtn.addEventListener('click', async () => {
        // ... (Guardar datos de skills) ...
        // ... (Mostrar spinner) ...

        try {
            // ... (Llamada a fetch '/api/generar-cv') ...
            const response = await fetch('/api/generar-cv', { /*...*/ });
            const result = await response.json();
            
            // Usamos Marked.js para convertir el Markdown a HTML
            draftOutput.innerHTML = marked.parse(result.draft);
            
            // *** NUEVO ***: Rellenamos el nombre de archivo sugerido
            const nombreSugerido = `CV_${cvData.personal.nombre || 'TuNombre'}.pdf`;
            pdfFilenameInput.value = nombreSugerido.replace(/ /g, '_'); // Reemplaza espacios

        } catch (error) { /* ... (manejo de error) ... */
        } finally { /* ... (ocultar spinner) ... */ }
    });

    // (g) Botón "Modificar Datos"
    // (Idéntico a la v6)
    editDataBtn.addEventListener('click', () => { /* ... (sin cambios) ... */ });

    // (h) Selector de Color
    // (Idéntico a la v6)
    colorPicker.addEventListener('input', (event) => { /* ... (sin cambios) ... */ });


    // --- *** 7. NUEVA LÓGICA DE DESCARGA *** ---

    // (i) Botón "Confirmar y Descargar" (Ahora solo muestra el paso final)
    confirmDownloadBtn.addEventListener('click', () => {
        // Muestra el paso final
        finalPhotoStep.removeAttribute('hidden');
        
        // Si el usuario eligió "No" a la foto, ocultamos la opción de subir
        if (cvData.personal.fotoOpcion === 'no') {
            document.querySelector('#final-photo-step .form-group').setAttribute('hidden', true);
        } else {
            document.querySelector('#final-photo-step .form-group').removeAttribute('hidden');
        }
    });

    // (j) Botón "Generar PDF" (¡El botón final!)
    generatePdfBtn.addEventListener('click', () => {
        const fotoSubida = finalPhotoUpload.files[0];
        
        // Comprobar si el usuario subió una foto AHORA
        if (fotoSubida && cvData.personal.fotoOpcion === 'si') {
            // 1. Si subió foto, la convertimos a DataURL
            const reader = new FileReader();
            reader.onload = function(event) {
                const fotoDataURL = event.target.result;
                
                // 2. Encontramos la foto estándar en el borrador...
                const imagenEnBorrador = draftOutput.querySelector('img');
                if (imagenEnBorrador) {
                    // 3. ...y la reemplazamos por la foto del usuario
                    imagenEnBorrador.src = fotoDataURL;
                }
                
                // 4. ¡Generar PDF!
                ejecutarGeneradorPDF();
            };
            reader.readAsDataURL(fotoSubida);
        } else {
            // El usuario no subió foto nueva, generar el PDF tal cual
            ejecutarGeneradorPDF();
        }
    });

    // (k) La función que genera el PDF
    function ejecutarGeneradorPDF() {
        const elemento = document.getElementById('draft-output');
        const nombreArchivo = pdfFilenameInput.value || 'mi_cv.pdf';

        const opt = {
            margin:       [0.5, 0.5, 0.5, 0.5], // Márgenes en pulgadas
            filename:     nombreArchivo,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true }, // 'useCORS' es clave para las imágenes
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // Ocultar los botones de descarga para que no salgan en el PDF
        finalPhotoStep.setAttribute('hidden', true);
        
        // ¡Llamamos a la librería!
        html2pdf().from(elemento).set(opt).save();
    }
    
    // --- 8. INICIALIZACIÓN ---
    // (Idéntica a la v6)
    renderExperienceList();
    renderEducationList();
    showStep('step-template');
});