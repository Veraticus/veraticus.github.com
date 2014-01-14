module ReadingTimeFilter
  def readtime( number_of_words )
    return nil unless number_of_words

    words_per_minute = 250
    minutes = ( number_of_words / words_per_minute ).floor
    minutes_label = minutes === 1 ? " minute" : " minutes"
    minutes > 0 ? "#{minutes} #{minutes_label}" : "less than 1 minute"
  end
end

Liquid::Template.register_filter(ReadingTimeFilter)