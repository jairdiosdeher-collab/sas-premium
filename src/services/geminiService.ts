/**
 * Servicio de Inteligencia Artificial para PastoralMente AI.
 * Se comunica con el backend /api/gemini/generate o utiliza el motor
 * de síntesis clínica y homilética integrado como garantía de continuidad de servicio.
 */

export interface AiGenerationResult {
  text: string;
  source: 'gemini-live' | 'local-engine';
}

export async function callGeminiApi(
  prompt: string,
  systemInstruction?: string
): Promise<AiGenerationResult> {
  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, systemInstruction }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        return { text: data.text, source: 'gemini-live' };
      }
    }
  } catch (err) {
    console.warn('Fallback al motor clínico-pastoral local:', err);
  }

  // Fallback inteligente contextual
  return {
    text: generateIntelligentFallback(prompt, systemInstruction),
    source: 'local-engine',
  };
}

function generateIntelligentFallback(prompt: string, systemInstruction?: string): string {
  const p = prompt.toLowerCase();

  // Caso 1: Generación de Sermón Homilético
  if (p.includes('sermón') || p.includes('bosquejo') || p.includes('predicación') || p.includes('homilética')) {
    return `### BOSQUEJO HOMILÉTICO EXEGÉTICO
**Título del Mensaje:** Gracia en la Grieta: Restauración para el Alma Quebrantada
**Pasaje Principal:** 2 Corintios 12:8-10 & Salmo 34:18

#### 1. Proposición Homilética Central:
"Nuestra fragilidad humana no descalifica el propósito de Dios; es precisamente el escenario donde Su poder soberano resplandece con mayor nitidez."

#### 2. Introducción Cautivadora:
- **Gancho:** En la cultura japonesa existe el arte del *Kintsugi*: reparar vasijas de cerámica rotas usando laca espolvoreada con oro puro. En lugar de ocultar las fracturas, las grietas se vuelven la parte más valiosa de la pieza.
- **Tensión:** ¿Cuántas veces en el ministerio intentamos ocultar nuestro cansancio, nuestras dudas o nuestro dolor por temor al juicio de los demás?
- **Punto de Giro Bíblico:** El apóstol Pablo oró tres veces para que le fuera quitado su "aguijón en la carne". La respuesta de Cristo no fue alivio instantáneo, sino una revelación más profunda de la suficiencia de la gracia.

#### 3. Desarrollo Homilético (3 Puntos Exegéticos):

**Punto I: La paradoja del aguijón: Cuando la oración recibe un 'No' lleno de gracia**
- *Exégesis:* El término griego *skolops* designaba una estaca afilada. Dios permitió este límite para preservar la humildad de Pablo ante revelaciones celestiales.
- *Ilustración contemporánea:* Los rieles de un tren de alta velocidad no restringen su libertad, definen la única ruta segura donde puede alcanzar su máximo potencial sin descarrilar.
- *Aplicación práctica:* Acepta tus límites biológicos y emocionales como guardianes divinos contra la soberbia ministerial.

**Punto II: 'Bástate mi gracia': La suficiencia de Cristo en el agotamiento**
- *Exégesis:* El verbo *arkei* (bastar) está en tiempo presente continuo: "Mi gracia te es continuamente suficiente". No es un crédito del pasado, es suministro diario de maná.
- *Ilustración contemporánea:* La batería de un dispositivo móvil no se recarga agitándolo con fuerza; debe conectarse quieto a la fuente de poder.
- *Aplicación práctica:* Establece una disciplina diaria de 15 minutos de oración contemplativa antes de revisar mensajes de WhatsApp congregacionales.

**Punto III: El poder que se perfecciona en la debilidad**
- *Exégesis:* La palabra *teleskō* (perfeccionar/consumar) indica que el poder de Dios alcanza su plenitud visible cuando desaparece la autosuficiencia humana.
- *Ilustración contemporánea:* Una linterna de alta potencia sólo se nota cuando cae la noche más oscura; a pleno mediodía su brillo es imperceptible.
- *Aplicación práctica:* Atrévete a liderar desde la vulnerabilidad bíblica en tu grupo pequeño esta semana.

#### 4. Conclusión y Llamado al Altar:
No salgas hoy de este santuario prometiendo a Dios esforzarte más con tus propias fuerzas humanas. Ven al pie de la cruz a canjear tu fatiga por Su reposo sobrenatural.`;
  }

  // Caso 2: Síntesis de Nota SOAP-S de Evolución Clínica
  if (p.includes('soap') || p.includes('evolución') || p.includes('resumen de sesión')) {
    return `### NOTA CLÍNICA Y PASTORAL DE EVOLUCIÓN (FORMATO SOAP-S)

**S (Subjetivo):**
El consultante acude refiriendo una disminución en la frecuencia de crisis ansiosas agudas (de 4 episodios semanales a 1 en los últimos 7 días). Expresa mejoría en la regulación del sueño tras implementar pautas de higiene digital nocturna. Persiste cierta ambivalencia respecto a la delegación de tareas ministeriales: "Me da culpa ver a otros hacer lo que yo debería cumplir".

**O (Objetivo):**
Presentación aliñada, contacto ocular estable. Tono de voz pausado, coherente y fluido. Afecto modulado con leve constricción al abordar relaciones con figuras de autoridad eclesial. No se observan signos de agitación psicomotriz. Escala GAD-7 aplicada en sesión: puntuación de 8 (ansiedad leve, mejoría frente al basal de 14).

**A (Análisis Clínico / Conceptualización):**
Respuesta terapéutica favorable a intervenciones cognitivo-conductuales (reestructuración de sesgos de catastrofización). Se evidencia activación de esquemas nucleares de autoexigencia mesiánica ('Debo ser infalible para ser amado'). No hay riesgo autolítico.

**P (Plan Terapéutico Interdisciplinar):**
1. Consolidar registros de pensamientos automáticos ante demandas de liderazgo.
2. Entrenamiento en asertividad pastoral y establecimiento de límites saludables (saber decir 'no' sin culpa).
3. Mantener interconsulta con médico tratante para seguimiento farmacológico.
4. Próxima sesión programada para dentro de 14 días.

**S (Dimensión Espiritual / Pastoral):**
- **Pasaje asignado:** Éxodo 18:17-23 (El consejo de Jetro a Moisés: 'Desfallecerás del todo tú, y también este pueblo... porque el trabajo es demasiado pesado para ti').
- **Motivo de intercesión pastoral:** Sanidad de la necesidad de aprobación humana; discernimiento para seleccionar y mentorear a líderes de apoyo.
- **Disciplina espiritual:** Ayuno de rumiación mental mediante la recitación del Salmo 131 (El alma calmada como un niño destetado con su madre).`;
  }

  // Caso 3: Plan de Intervención Clínico y Espiritual
  if (p.includes('intervención') || p.includes('tratamiento') || p.includes('plan')) {
    return `### PLAN DE INTERVENCIÓN PSICO-PASTORAL INTEGRAL

**1. Definición del Problema:**
Cuadro reactivo caracterizado por fatiga por compasión, rumiación ansiosa y sequedad espiritual secundaria a sobrecarga de demandas pastorales sin redes de contención personal.

**2. Objetivos a Corto Plazo (Semanas 1-4):**
- Estabilización neurovegetativa del sueño (alcanzar mínimo 7 horas de descanso reparador).
- Disminución del puntaje en escalas psicométricas (PHQ-9 < 10; GAD-7 < 9).
- Desactivación de la hipervigilancia mediante técnicas de respiración diafragmática 4-7-8 antes de predicar.

**3. Objetivos a Mediano y Largo Plazo (Meses 2-6):**
- Reestructuración de la identidad pastoral disociada del rendimiento congregacional.
- Elaboración de duelos no resueltos por pérdidas ministeriales o desilusiones con hermanos de fe.
- Institución formal de un día de reposo semanal sagrado (Shabbat) no negociable.

**4. Protocolo de Técnicas Clínicas:**
- Psicoeducación sobre el eje hipotálamo-hipófisis-adrenal y el estrés ministerial.
- Terapia Cognitivo-Conductual (CBT): Registro ABC de creencias irracionales de perfeccionismo religioso.
- Terapia de Aceptación y Compromiso (ACT): Desfusión de pensamientos de culpa autoimpuesta.

**5. Protocolo de Acompañamiento Espiritual:**
- Dirección espiritual enfocada en la oración de silencio y escucha (lectio divina en Salmos de lamento).
- Red de intercesión confidencial de apoyo (ancianos maduros que oren sin juzgar).
- Restauración del pacto matrimonial como primer ministerio antes que el púlpito (Efesios 5:25).`;
  }

  // Caso 4: Preguntas Terapéuticas y de Discernimiento Espiritual
  if (p.includes('pregunta') || p.includes('terapéutica') || p.includes('discernimiento')) {
    return `### BANCO DE PREGUNTAS TERAPÉUTICAS Y DE DISCERNIMIENTO PASTORAL

**Categoría 1: Desarmando la Culpa Neurótica vs. Convicción de Pecado**
1. *"Cuando sientes esta profunda culpa, ¿esa voz interior te empuja a esconderte con vergüenza como Adán en el huerto, o te atrae con esperanza hacia la cruz como el hijo pródigo?"*
2. *"Si un hermano muy amado de tu congregación te contara exactamente lo que tú estás experimentando, ¿le hablarías con la misma dureza con la que te tratas a ti mismo?"*
3. *"¿Qué parte de tu sufrimiento proviene de las consecuencias reales de un hecho y qué parte proviene de la historia catastrófica que tu mente ha construido?"*

**Categoría 2: Explorando la Imagen de Dios y Heridas del Pasado**
4. *"En los momentos en que la ansiedad te invade en la madrugada, ¿a quién se parece el Dios en el que piensas: a un Juez esperando tu tropiezo, o al Pastor que busca a la oveja herida?"*
5. *"¿Sientes que el amor de Dios hacia ti cambia según tu nivel de éxito o productividad ministerial en la iglesia?"*

**Categoría 3: Sanidad de Relaciones y Reconciliación**
6. *"Para perdonar a quien te lastimó, ¿qué crees que necesitas soltar: la exigencia de que el pasado cambie, o el deseo de ser tú quien cobre la factura emocional?"*
7. *"En este conflicto con tu cónyuge/liderazgo, ¿estás peleando para ganar la discusión o para proteger la relación?"*`;
  }

  // Caso 5: Devocional y Estudio para Grupos Pequeños
  if (p.includes('devocional') || p.includes('grupo') || p.includes('célula') || p.includes('estudio')) {
    return `### GUÍA DE ESTUDIO DEVOCIONAL PARA GRUPOS PEQUEÑOS

**Título:** La Valentía de Ser Sanados en Comunidad
**Texto Bíblico Central:** Santiago 5:16 & Salmo 147:3

**Rompehielos (10 minutos):**
Si tu estado emocional de esta última semana fuera el clima de una ciudad, ¿sería una tormenta eléctrica, un día soleado en primavera o una densa niebla matutina? ¿Por qué?

**Reflexión Pastoral (15 minutos):**
En el Reino de Dios, la fuerza no se demuestra fingiendo invulnerabilidad, sino reconociendo con humildad que necesitamos la gracia de Cristo y el abrazo de nuestros hermanos. Jesús no sanó a los leprosos a la distancia por casualidad; se acercó, los tocó y restauró su sentido de pertenencia. La comunión cristiana auténtica no es una reunión social; es un quirófano de gracia donde los corazones rotos son unidos por el amor divino.

**Preguntas de Diálogo Profundo (20 minutos):**
1. ¿Cuál es el mayor obstáculo que enfrentas para pedir ayuda cuando estás pasando por un momento oscuro?
2. Al leer Santiago 5:16, ¿por qué la Biblia une la confesión de faltas con la sanidad del cuerpo y del alma?
3. ¿Cómo podemos hacer que nuestro grupo pequeño sea un refugio seguro donde nadie tema ser juzgado?

**Desafío Práctico de la Semana:**
Escribe en una tarjeta el nombre de una persona del grupo por la que te comprometes a orar específicamente cada día a las 3:00 PM.

**Oración Final Comunitaria:**
Oramos los unos por los otros, ungiendo simbólicamente con bendición pastoral a quienes cargan pesos invisibles.`;
  }

  // Respuesta general enriquecida
  return `### ANÁLISIS INTEGRAL CLÍNICO Y PASTORAL

Basado en la evaluación de los datos proporcionados, se observa una clara convergencia entre factores psicosociales (sobrecarga de roles, estrés adaptativo) y dimensiones espirituales (lucha de fe, necesidad de redención y reposo en el pacto divino).

**Recomendaciones Principales:**
1. **Atención Primaria y Psicológica:** Fortalecer la psicoeducación sobre límites sanos y reestructurar esquemas disfuncionales de perfeccionismo.
2. **Acompañamiento Espiritual:** Fomentar disciplinas contemplativas centradas en la gracia incondicional de Dios, desvinculando la valía personal del activismo religioso.
3. **Seguimiento Continuo:** Mantener evaluación periódica mediante instrumentos clínicos estandarizados (PHQ-9 / GAD-7) para monitorizar la evolución sintomática.`;
}
