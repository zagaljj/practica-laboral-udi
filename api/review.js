import OpenAI from 'openai'

const SYSTEM_PROMPT = `Eres un asistente de revisión de documentos académicos para la Universidad
para el Desarrollo y la Innovación (UDI). Tu tarea es revisar dos documentos
de práctica laboral y señalar todos los errores o campos incompletos de forma
clara y amable, para que el estudiante pueda corregirlos antes de entregarlos.

CONTEXTO:
- Gestión académica actual: I-2026
- Carreras válidas: "Ingeniería de Telecomunicaciones y Ciberseguridad" o
  "Ingeniería de Sistemas"
- Escuela: Informática y Telecomunicaciones
- La asignatura es Práctica Laboral

DOCUMENTO 1 - FICHA DE INSCRIPCIÓN (Excel):
Revisa que contenga:
- Nombre completo del estudiante (no debe estar vacío)
- Carrera correcta (solo acepta las dos carreras mencionadas,
  sin variaciones ortográficas)
- Gestión académica: debe decir "I-2026"
- C.I. del estudiante (no debe estar vacío)
- Dirección particular del estudiante
- Teléfono y correo electrónico del estudiante
- Contacto de emergencia con teléfono
- Nombre del docente guía (no debe estar vacío)
- Razón social y nombre comercial del Centro de Prácticas (no debe estar vacío)
- Dirección y NIT del Centro de Prácticas (no debe estar vacío)
- Teléfono y correo del Centro de Prácticas
- Nombre del supervisor de la práctica con su cargo, C.I., teléfono y correo
- El cargo del supervisor debe ser gerencial, de dirección, propietario o dueño,
  o responsable del área relacionada a la carrera del estudiante. No se aceptan
  cargos operativos genéricos como "empleado", "asistente", "secretaria", etc.
- Fecha de inicio y fecha de conclusión de la práctica
- Días y horarios de trabajo
- Al menos 3 funciones principales a realizar
- Firma del docente guía, firma del estudiante y firma del supervisor
  (advertir que estas deben estar presentes en el documento físico)

DOCUMENTO 2 - CONVENIO INTERINSTITUCIONAL (Word):
Revisa que contenga:
- Nombre de la empresa en el título del convenio (la línea que dice
  "celebrado entre la UDI y _________", no debe quedar con el guión)
- Nombre completo del estudiante pasante (no debe ser el placeholder
  "Nombre del Estudiante")
- Carrera correcta del estudiante (misma validación que en la ficha)
- Fecha de inicio en la Cláusula Cuarta (no debe quedar como "colocar fecha")
- Nombre del representante legal con su cargo (no debe decir
  "Nombre de Representante Legal" o "CARGO" sin rellenar)
- El cargo del representante legal debe ser gerencial, directivo,
  propietario o similar. No se aceptan cargos operativos.
- Razón social de la empresa en la Cláusula Octava (no debe ser el placeholder)
- Advertir que debe tener el sello de la empresa en el documento físico
- Advertir que debe tener la firma del estudiante pasante al final

CONSISTENCIA ENTRE DOCUMENTOS:
- El nombre del estudiante debe ser idéntico en ambos documentos
- El nombre del Centro de Prácticas debe coincidir en ambos documentos
- La fecha de inicio debe coincidir en ambos documentos
- La carrera debe coincidir en ambos documentos

FORMATO DE RESPUESTA:
Devuelve la retroalimentación en Markdown con exactamente este formato:

## 📋 Ficha de Inscripción
[Lista con ✅ si está correcto o ❌ si hay error, con explicación clara de qué corregir]

## 📄 Convenio Interinstitucional
[Lista con ✅ si está correcto o ❌ si hay error, con explicación clara de qué corregir]

## 🔍 Consistencia entre documentos
[Comparación de los datos que deben coincidir en ambos, con ✅ o ❌]

## 📝 Resumen
[Indicar claramente si los documentos están listos para entregar o cuántos
errores críticos deben corregirse primero. Ser específico y amable.]

Sé amable y específico. Si un campo está vacío dilo claramente.
Si un cargo no es apropiado, explica qué tipo de cargo se necesita.
Recuerda que el estudiante aún no ha firmado los documentos, por lo que
las observaciones sobre firmas y sellos son para el documento físico final.`

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { fichaTexto, convenioTexto } = req.body || {}

  if (!fichaTexto || typeof fichaTexto !== 'string' || fichaTexto.trim() === '') {
    return res.status(400).json({ error: 'El texto de la Ficha de Inscripción está vacío o no fue enviado.' })
  }

  if (!convenioTexto || typeof convenioTexto !== 'string' || convenioTexto.trim() === '') {
    return res.status(400).json({ error: 'El texto del Convenio Interinstitucional está vacío o no fue enviado.' })
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY no está configurada')
    return res.status(500).json({ error: 'Error de configuración del servidor. Contacta al administrador.' })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const userMessage = `FICHA DE INSCRIPCIÓN (Excel):\n${fichaTexto}\n\n---\n\nCONVENIO INTERINSTITUCIONAL (Word):\n${convenioTexto}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 2500,
      temperature: 0.2,
    })

    const resultado = completion.choices[0]?.message?.content

    if (!resultado) {
      throw new Error('La respuesta de OpenAI llegó vacía.')
    }

    return res.status(200).json({ resultado })
  } catch (err) {
    console.error('Error en /api/review:', err)

    // Distinguish OpenAI auth errors from other errors
    if (err?.status === 401) {
      return res.status(500).json({ error: 'La clave de API de OpenAI no es válida. Contacta al administrador.' })
    }

    if (err?.status === 429) {
      return res.status(429).json({ error: 'Se superó el límite de uso de OpenAI. Intenta en unos minutos.' })
    }

    return res.status(500).json({
      error: err.message || 'Error interno al analizar los documentos. Intenta nuevamente.',
    })
  }
}
