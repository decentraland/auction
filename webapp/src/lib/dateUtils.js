import distanceInWords from 'date-fns/distance_in_words_to_now'

export function distanceInWordsToNow(date, options = {}) {
  const { endedText = 'Finished' } = options
  return isBeforeToday(date) ? endedText : distanceInWords(date)
}

export function isBeforeToday(date) {
  return !date || date < new Date()
}
