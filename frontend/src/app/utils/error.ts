/**
 * Extrae un mensaje legible de un error HTTP del API.
 * El backend responde `{ mensaje }` para errores de negocio y
 * `{ errors: { campo: [mensajes] } }` para errores de validación.
 */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  const respuesta = (error as { error?: { mensaje?: string; errors?: Record<string, string[]> } })?.error;

  if (respuesta?.mensaje) {
    return respuesta.mensaje;
  }

  if (respuesta?.errors) {
    const primero = Object.values(respuesta.errors).flat()[0];
    if (primero) {
      return primero;
    }
  }

  return porDefecto;
}
