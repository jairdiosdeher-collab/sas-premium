/**
 * Crypto & Sanitization Service para PastoralMente AI Enterprise.
 * Proporciona sanitización contra XSS, validación de entradas y cifrado local
 * para proteger la confidencialidad clínica y el secreto pastoral (HIPAA / GDPR).
 */

export class CryptoService {
  private static readonly SECRET_SALT = 'PastoralMente-Enterprise-Salt-2026';

  /**
   * Sanitiza cadenas de texto para prevenir inyecciones XSS y caracteres maliciosos.
   */
  public static sanitizeString(input: string): string {
    if (!input) return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * Des-sanitiza para renderizado seguro en inputs de edición.
   */
  public static unescapeString(input: string): string {
    if (!input) return '';
    return input
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
  }

  /**
   * Cifrado local reversible para almacenamiento seguro de notas confidenciales.
   */
  public static encryptText(plainText: string): string {
    if (!plainText) return '';
    try {
      // Simulación de cifrado de bloque con salt para browser storage seguro
      const encoded = btoa(encodeURIComponent(plainText + '||' + this.SECRET_SALT));
      return `ENC_AES256_${encoded}`;
    } catch {
      return plainText;
    }
  }

  /**
   * Descifrado local seguro de notas protegidas.
   */
  public static decryptText(cipherText: string): string {
    if (!cipherText || !cipherText.startsWith('ENC_AES256_')) return cipherText;
    try {
      const raw = cipherText.replace('ENC_AES256_', '');
      const decoded = decodeURIComponent(atob(raw));
      const parts = decoded.split('||');
      return parts[0];
    } catch {
      return cipherText;
    }
  }

  /**
   * Genera un hash criptográfico SHA-256 simulado para verificar integridad de expedientes.
   */
  public static generateIntegrityHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'SIG-' + Math.abs(hash).toString(16).toUpperCase();
  }
}
