// --- api/generar-cv.js (Versión 5 - ¡REFRACTORIZADO Y FINAL!) ---
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// *** ¡NUEVA FUNCIÓN! ***
// Esta función "limpia" los datos antes de enviarlos a la IA
function formatearDatosParaIA(data) {
    // 1. Formatear fechas de Experiencia
    if (data.experience) {
        data.experience = data.experience.map(exp => {
            // Convierte "2024-11-15" a "15/11/2024" (formato español)
            const inicioFmt = exp.inicio ? new Date(exp.inicio).toLocaleDateString('es-ES') : '';
            
            // Si es "presente", usa esa palabra. Si no, formatea la fecha de fin.
            const finFmt = exp.esPresente ? 'Presente' : (exp.fin ? new Date(exp.fin).toLocaleDateString('es-ES') : '');

            return {
                ...exp, // Mantiene el resto (puesto, empresa, descripcion)
                inicio: inicioFmt, // Sobrescribe con la fecha bonita
                fin: finFmt        // Sobrescribe con la fecha bonita
            };
        });
    }

    // 2. Formatear datos de Educación (el 'anio' ya es un string "2024" o "Cursando", está bien)
    // 3. Formatear otros campos (si fuera necesario)

    return data;
}

export default async function handler(request, response) {
    
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Método no permitido' });
    }

    try {
        const cvDataOriginal = request.body;
        console.log(`[Backend] Plantilla: ${cvDataOriginal.template}, Foto: ${cvDataOriginal.personal.fotoOpcion}`);

        // 5. LEER EL ARCHIVO DE PLANTILLA (Ruta corregida)
        const templateFileName = `${cvDataOriginal.template}.md`;
        const templatePath = path.join(__dirname, '..', 'plantillas', templateFileName);
        let templateContent = fs.readFileSync(templatePath, 'utf8');

        // 6. LÓGICA DE LA FOTO
        if (cvDataOriginal.personal.fotoOpcion === 'si') {
            templateContent = templateContent.replace('[FOTO_DEL_USUARIO]', '![Foto de perfil](/img/foto-estandar.png)');
        } else {
            templateContent = templateContent.replace('[FOTO_DEL_USUARIO]', '');
        }

        // *** ¡NUEVO PASO! ***
        // 7. FORMATEAR LOS DATOS ANTES DE ENVIARLOS A LA IA
        const cvDataFormateado = formatearDatosParaIA(cvDataOriginal);

        // 8. CONSTRUIR EL "PROMPT MAESTRO"
        const prompt = `
            Eres un asistente experto en creación de CVs. Tu tarea es tomar los datos del usuario 
            y rellenar la plantilla proporcionada.

            ### REGLAS IMPORTANTES:
            1.  **Corrige la ortografía y la gramática**.
            2.  **No corrijas nombres propios** (empresas, software, nombres).
            3.  **Aplica mayúsculas de forma profesional**.
            4.  Genera el resultado en formato **Markdown** limpio.
            5.  **REGLA DE ORO:** Si un campo en los "DATOS DEL USUARIO" está vacío, nulo o no existe (ej: "linkedin" o "aptitudes"), **OMITE** por completo esa línea o sección en el CV final.
            6.  Las secciones de Experiencia y Formación deben repetirse para cada entrada en los datos.

            ---

            ### PLANTILLA A UTILIZAR (Ya procesada):
            ${templateContent}

            ---

            ### DATOS DEL USUARIO (en formato JSON y formateados):
            ${JSON.stringify(cvDataFormateado, null, 2)}

            ---

            ### CV GENERADO (Markdown):
        `;

        // 9. LLAMAR A LA IA (¡Con el modelo estable!)
        console.log('[Backend] Contactando a la API de Gemini...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Usamos el modelo estándar
        const result = await model.generateContent(prompt);
        const iaResponse = await result.response;
        const generatedDraft = iaResponse.text();

        console.log('[Backend] IA ha respondido. Enviando al frontend.');

        // 10. DEVOLVER EL CV TERMINADO
        return response.status(200).json({ 
            draft: generatedDraft 
        });

    } catch (error) {
        console.error('[Backend] ¡ERROR GRAVE!:', error);
        return response.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
}