// --- api/generar-cv.js (Versión 4 - ¡CORREGIDA!) ---
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
// *** NUEVO: Importamos las herramientas para encontrar la ruta ***
import { fileURLToPath } from 'url';

// *** NUEVO: Esta es la forma moderna y robusta de encontrar el directorio ***
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(request, response) {
    
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Método no permitido' });
    }

    try {
        const cvData = request.body;
        console.log(`[Backend] Plantilla: ${cvData.template}, Foto: ${cvData.personal.fotoOpcion}`);

        // 5. LEER EL ARCHIVO DE PLANTILLA (¡CON LA RUTA CORREGIDA!)
        const templateFileName = `${cvData.template}.md`;
        
        // *** MODIFICADO: Esta es la ruta correcta ***
        // Sube un nivel desde 'api' (donde vive este .js) y entra a 'plantillas'
        const templatePath = path.join(__dirname, '..', 'plantillas', templateFileName);
        
        let templateContent = fs.readFileSync(templatePath, 'utf8');

        // 6. LÓGICA DE LA FOTO (Sin cambios)
        if (cvData.personal.fotoOpcion === 'si') {
            templateContent = templateContent.replace(
                '[FOTO_DEL_USUARIO]', 
                '![Foto de perfil](/img/foto-estandar.png)'
            );
        } else {
            templateContent = templateContent.replace('[FOTO_DEL_USUARIO]', '');
        }

        // 7. CONSTRUIR EL "PROMPT MAESTRO" (Sin cambios)
        const prompt = `
            Eres un asistente experto en creación de CVs. Tu tarea es tomar los datos del usuario 
            y rellenar la plantilla proporcionada.

            ### REGLAS IMPORTANTES:
            1.  **Corrige la ortografía y la gramática**.
            2.  **No corrijas nombres propios** (empresas, software, nombres).
            3.  **Aplica mayúsculas de forma profesional**.
            4.  Genera el resultado en formato **Markdown** limpio.
            5.  **REGLA DE ORO:** Si un campo en los "DATOS DEL USUARIO" está vacío, nulo o no existe (ej: "linkedin" o "aptitudes"), **OMITE** por completo esa línea o sección en el CV final. No escribas "LinkedIn: (vacío)" ni generes un título de sección sin contenido.
            6.  Las secciones de Experiencia y Formación deben repetirse para cada entrada en los datos.

            ---

            ### PLANTILLA A UTILIZAR (Ya procesada):
            ${templateContent}

            ---

            ### DATOS DEL USUARIO (en formato JSON):
            ${JSON.stringify(cvData, null, 2)}

            ---

            ### CV GENERADO (Markdown):
        `;

        // 8. LLAMAR A LA IA (Sin cambios)
        console.log('[Backend] Contactando a la API de Gemini...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const result = await model.generateContent(prompt);
        const iaResponse = await result.response;
        const generatedDraft = iaResponse.text();

        console.log('[Backend] IA ha respondido. Enviando al frontend.');

        // 9. DEVOLVER EL CV TERMINADO (Sin cambios)
        return response.status(200).json({ 
            draft: generatedDraft 
        });

    } catch (error) {
        // ¡Esta es la sección que nos dará el error 500!
        console.error('[Backend] ¡ERROR GRAVE!:', error); // Esto lo veremos en los logs de Vercel
        return response.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
}