import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isSameYear,
  isTomorrow,
  isYesterday,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns'
import { default as moment, default as momentTZ } from 'moment'

export const formatTime = (time: string): string => {
  return moment(time).format('DD/MM/YYYY HH:mm:ss')
}

export const toUTC = (time: Date | string): string => {
  return momentTZ(time).utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
}

export const formatDate = (date: Date, locale?: string): string => {
  if (locale)
    new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)

  return moment(date).format('DD/MM/YYYY')
}

export function formatTimeRange(begin: string, end: string, translate: any): string {
  const beginDate = parseISO(begin)
  const endDate = parseISO(end)

  const now = new Date()

  const thisWeekStart = startOfWeek(now)
  const thisWeekEnd = endOfWeek(now)

  const lastWeekStart = startOfWeek(subWeeks(now, 1))
  const lastWeekEnd = endOfWeek(subWeeks(now, 1))

  const nextWeekStart = startOfWeek(addWeeks(now, 1))
  const nextWeekEnd = endOfWeek(addWeeks(now, 1))

  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)

  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const nextMonthStart = startOfMonth(addMonths(now, 1))
  const nextMonthEnd = endOfMonth(addMonths(now, 1))

  const thisYearStart = startOfYear(now)
  const thisYearEnd = endOfYear(now)

  const lastYearStart = startOfYear(subYears(now, 1))
  const lastYearEnd = endOfYear(subYears(now, 1))

  const nextYearStart = startOfYear(addYears(now, 1))
  const nextYearEnd = endOfYear(addYears(now, 1))

  if (isToday(beginDate) && isToday(endDate)) return translate('Today')
  if (isTomorrow(beginDate) && isTomorrow(endDate)) return translate('Tomorrow')
  if (isYesterday(beginDate) && isYesterday(endDate)) return translate('Yesterday')
  if (isSameDay(beginDate, thisWeekStart) && isSameDay(endDate, thisWeekEnd))
    return translate('This week')
  if (isSameDay(beginDate, lastWeekStart) && isSameDay(endDate, lastWeekEnd))
    return translate('Last week')
  if (isSameDay(beginDate, nextWeekStart) && isSameDay(endDate, nextWeekEnd))
    return translate('Next week')
  if (isSameDay(beginDate, thisMonthStart) && isSameDay(endDate, thisMonthEnd))
    return translate('This month')
  if (isSameDay(beginDate, lastMonthStart) && isSameDay(endDate, lastMonthEnd))
    return translate('Last month')
  if (isSameDay(beginDate, nextMonthStart) && isSameDay(endDate, nextMonthEnd))
    return translate('Next month')
  if (isSameDay(beginDate, thisYearStart) && isSameDay(endDate, thisYearEnd))
    return translate('This year')
  if (isSameDay(beginDate, lastYearStart) && isSameDay(endDate, lastYearEnd))
    return translate('Last year')
  if (isSameDay(beginDate, nextYearStart) && isSameDay(endDate, nextYearEnd))
    return translate('Next year')

  return isSameYear(beginDate, endDate)
    ? `${format(beginDate, 'dd/MM')} - ${format(endDate, 'dd/MM/yyyy')}`
    : `${format(beginDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
}

export const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const isToday = (date: Date): boolean => {
  return isSameDate(date, new Date())
}

// return time remaining: 1d:2h:3m
export const getTimeRemaining = (
  expireDate: Date | string,
  isReturnObject: boolean = false
): string | { years: number; months: number; day: number; hour: number; minute: number } => {
  const now = moment()
  const expirationDate = moment(expireDate)

  const diff = moment.duration(expirationDate.diff(now))

  const years = diff.years()
  const months = diff.months()
  const days = diff.days()
  const hours = diff.hours()
  const minutes = diff.minutes()

  let timeRemaining = ''

  if (years > 0) {
    timeRemaining += `${years}y:`
  }

  if (months > 0) {
    timeRemaining += `${months}m:`
  }

  if (days > 0) {
    timeRemaining += `${days}d:`
  }

  if (hours > 0) {
    timeRemaining += `${hours}h:`
  }

  if (minutes > 0) {
    timeRemaining += `${minutes}m`
  }

  // Remove trailing comma and space if they exist
  if (timeRemaining.endsWith(', ')) {
    timeRemaining = timeRemaining.slice(0, -2)
  }

  return isReturnObject
    ? {
        years: +years,
        months: +months,
        day: +days,
        hour: +hours,
        minute: +minutes,
      }
    : timeRemaining
}

// return percent of using time
export const usingPercentage = (begin: Date | string, expire: Date | string): number => {
  const now = moment()
  const beginDate = moment(begin)
  const expirationDate = moment(expire)

  const total = expirationDate.diff(beginDate)
  const remaining = expirationDate.diff(now)

  return Math.round((1 - remaining / total) * 100)
}

export const getColorClass = (begin: Date | string, expire: Date | string) => {
  const percentage = usingPercentage(begin, expire)
  if (percentage >= 93) {
    return 'text-red-500'
  } else if (percentage >= 80) {
    return 'text-yellow-500'
  } else {
    return 'text-green-500'
  }
}

// get times
export const getTimes = (d = 0, h = 0, m = 0, s = 0) => {
  // convert all to seconds
  const totalSeconds = h * 3600 + m * 60 + s

  // calc days, hours, minutes, seconds
  const days = Math.floor(totalSeconds / (24 * 3600))
  const remainingSeconds = totalSeconds % (24 * 3600)
  const hours = Math.floor(remainingSeconds / 3600)
  const remainingSecondsAfterHours = remainingSeconds % 3600
  const minutes = Math.floor(remainingSecondsAfterHours / 60)
  const seconds = remainingSecondsAfterHours % 60

  return {
    days: days + d,
    hours,
    minutes,
    seconds,
  }
}

// from numbers of (day, hour, minute, second) => expire time
export const calcExpireTime = (d = 0, h = 0, m = 0, s = 0) => {
  // calc days, hours, minutes, seconds
  const { days, hours, minutes, seconds } = getTimes(d, h, m, s)

  // get current time
  const currentTime = new Date()

  // add time to current time
  const expireTime = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate() + days,
    currentTime.getHours() + hours,
    currentTime.getMinutes() + minutes,
    currentTime.getSeconds() + seconds
  )

  return expireTime
}
