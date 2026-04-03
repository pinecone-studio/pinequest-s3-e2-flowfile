const SCHOOL_TIME_ZONE = 'Asia/Ulaanbaatar'

function getDateTimeParts(value: string | Date, timeZone = SCHOOL_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  const parts = formatter.formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return {
    month: getPart('month'),
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
  }
}

export function formatMongolianShortDateTime(value: string | Date, timeZone = SCHOOL_TIME_ZONE) {
  const parts = getDateTimeParts(value, timeZone)

  if (!parts) {
    return '-'
  }

  return `${Number(parts.month)}-р сарын ${Number(parts.day)}, ${parts.hour}:${parts.minute}`
}

export function formatMongolianShortDate(value: string | Date, timeZone = SCHOOL_TIME_ZONE) {
  const parts = getDateTimeParts(value, timeZone)

  if (!parts) {
    return '-'
  }

  return `${Number(parts.month)}-р сарын ${Number(parts.day)}`
}
