export const compare = (numA: number, numB: number) => {
  if (numA === numB) return 0
  return numA > numB ? 1 : -1
}
export const formatmmssttt = (number: number) => {
  let output = ''
  if (number >= 60) {
    const minutes = Math.floor(number / 60)
    output += `${minutes}:`
    number -= minutes * 60
  }
  if (number >= 10) {
    output += `${number.toFixed(3)}`
  } else {
    output += `0${number.toFixed(3)}`
  }
  return output
}
export const renderYmd = (date: string) => {
  // parse YYYYMMDD into 'DD de mês de YYYY' (pt-BR)
  if (!date) return ''
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(date.trim())
  if (!m) return date
  const [, y, mm, dd] = m
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ]
  const idx = Number(mm) - 1
  if (isNaN(idx) || idx < 0 || idx > 11) return date
  return `${dd} de ${months[idx]} de ${y}`
}
