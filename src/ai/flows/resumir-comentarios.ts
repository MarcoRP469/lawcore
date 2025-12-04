
'use server';

/**
 * @fileOverview Un flujo de IA para resumir comentarios de usuarios.
 *
 * - resumirComentarios: Una función que toma una lista de comentarios y devuelve un resumen conciso.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ResumenComentariosInputSchema = z.array(z.string());
const ResumenComentariosOutputSchema = z.string().optional();

export async function resumirComentarios(
  comentarios: z.infer<typeof ResumenComentariosInputSchema>
): Promise<string> {
  // Ajustado el umbral a 1 para que se genere un resumen incluso con un solo comentario.
  if (comentarios.length < 1) {
    return 'Aún no hay suficientes comentarios para un resumen.';
  }
  const result = await resumirComentariosFlow(comentarios);
  return result || 'No se pudo generar un resumen.';
}

const prompt = ai.definePrompt({
  name: 'resumirComentariosPrompt',
  input: { schema: ResumenComentariosInputSchema },
  // Se elimina el `output.schema` para evitar fallos de validación
  // cuando el modelo devuelve un objeto vacío en lugar de un string.
  // La respuesta se procesará manualmente en el flujo.
  prompt: `
    Eres un asistente experto en analizar opiniones de clientes.
    Tu tarea es leer una lista de comentarios sobre una notaría y generar un resumen conciso, natural y útil de una sola frase (máximo 25 palabras).
    El resumen debe capturar la esencia de las opiniones.

    - Si las opiniones son mayormente positivas, enfócate en los puntos fuertes más mencionados (ej. "buena atención", "rapidez", "ambiente agradable").
    - Si las opiniones son mayormente negativas, enfócate en las críticas más comunes (ej. "demoras", "mala comunicación", "costoso").
    - Si las opiniones son mixtas, refleja ambos lados de manera equilibrada (ej. "Aunque algunos aprecian la atención, otros mencionan demoras en los trámites.").

    NO listes palabras clave. NO digas "los usuarios dicen" o "en resumen". Simplemente escribe la frase final.

    Aquí están los comentarios:
    {{#each input}}
    - "{{this}}"
    {{/each}}
  `,
});

const resumirComentariosFlow = ai.defineFlow(
  {
    name: 'resumirComentariosFlow',
    inputSchema: ResumenComentariosInputSchema,
    outputSchema: ResumenComentariosOutputSchema,
  },
  async (input) => {
    // Se llama al prompt y se extrae el texto de la respuesta.
    const response = await prompt(input);
    const output = response.text; // Usar .text para obtener la respuesta de texto.
    return output; // Devolver directamente el output o undefined.
  }
);
