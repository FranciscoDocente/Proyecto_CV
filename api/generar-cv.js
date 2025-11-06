// --- api/generar-cv.js (Versión Final 3) ---
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(request, response) {
    
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Método no permitido' });
    }

    try {
        // 4. RECIBIR DATOS (incluyendo 'fotoOpcion')
        const cvData = request.body;
        console.log(`[Backend] Plantilla: ${cvData.template}, Foto: ${cvData.personal.fotoOpcion}`);

        // 5. LEER EL ARCHIVO DE PLANTILLA
        const templateFileName = `${cvData.template}.md`;
        const templatePath = path.join(process.cwd(), 'plantillas', templateFileName);
        let templateContent = fs.readFileSync(templatePath, 'utf8');

        // 6. *** ¡LA LÓGICA DE LA FOTO QUE HAS PEDIDO! ***
        // Modificamos la plantilla ANTES de enviarla a la IA.
        
        if (cvData.personal.fotoOpcion === 'si') {
            // Opción SÍ: Reemplazamos el marcador por la FOTO ESTÁNDAR
            templateContent = templateContent.replace(
                '[FOTO_DEL_USUARIO]', 
                '![Foto de perfil](/foto-estandar.png)' // Vercel sabrá dónde está este archivo
            );
        } else {
            // Opción NO: Simplemente borramos el marcador
            templateContent = templateContent.replace('[FOTO_DEL_USUARIO]', '');
        }

        // 7. CONSTRUIR EL "PROMPT MAESTRO" (Ahora con la plantilla ya modificada)
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

        // 8. LLAMAR A LA IA
        console.log('[Backend] Contactando a la API de Gemini...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const iaResponse = await result.response;
        const generatedDraft = iaResponse.text();

        console.log('[Backend] IA ha respondido. Enviando al frontend.');

        // 9. DEVOLVER EL CV TERMINADO
        return response.status(200).json({ 
            draft: generatedDraft 
        });

    } catch (error) {
        console.error('[Backend] Error al contactar la IA:', error);
        return response.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
}