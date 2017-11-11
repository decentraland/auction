import distanceInWords from "date-fns/distance_in_words_to_now";

export default function distanceInWordsToNow(date, options = {}) {
  const { endedText = "Finished" } = options;

  return !date || date < new Date() ? endedText : distanceInWords(date);
}
