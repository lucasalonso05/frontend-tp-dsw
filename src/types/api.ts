//Describe protocolo, no dominio

export type ISODateTime = string

/**
 * Un Decimal(10,2) de Prisma serializado como string.
 *
 * ⚠️ NO viene con dos decimales fijos: Prisma recorta los ceros a la derecha.
 * La API devuelve "5000.5", "10001" y "25002.5" — no "5000.50" ni "10001.00".
 *
 * Consecuencias:
 *  - Nunca mostrarlo tal cual: usar formatearPrecio() de @/lib/money.
 *  - Nunca compararlo como string: "10001" !== "10001.00".
 *  - Nunca sumarlo con +: es un string, "10" + "5" da "105".
 *
 * Es string y no number a proposito: el backend guarda dinero en Decimal
 * exacto, y pasarlo por el punto flotante de JS seria tirar esa garantia.
 */
export type DecimalString = string

export interface ValidationIssue {
  code: string
  path: (string | number)[]
  message: string
}

export interface ApiError {
  error: string | ValidationIssue[]
}

export interface MessageResponse {
  mensaje: string
}
