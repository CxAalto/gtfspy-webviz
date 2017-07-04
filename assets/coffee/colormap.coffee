class window.ColorMap

  constructor: (colors, @origValues, @ndivs, @full_interpolate) ->
    # values should be in increasing order
    # colors
    @n = colors.lenght
    if @n is not @origValues.lenght
      throw "The colors and values should be of same length"
    @origColors = ($.Color(color) for color in colors)

    [@min, ..., @max] = @origValues
    [@firstColor, ..., @lastColor] = @origColors
    @span = @max - @min
    @divColorVals = []
    @divColors = []
    step = @span / (@ndivs-1)
    for i in [0..(@ndivs-1)]
      val = @min+i*step
      @divColorVals.push(val)

      index = _.findIndex(@origValues, (origVal) ->
        return origVal > val
        )

      if index is -1
        col = @copy_color(@lastColor)
      else
        val_span = @origValues[index]-@origValues[index-1]
        val_frac = (@origValues[index]-val) / val_span
        col = @origColors[index-1].transition(@origColors[index], 1-val_frac)

      @divColors.push(col)

  copy_color: (color) ->
    return $.Color(color.toHexString())

  get_color: (value) ->
    ### This could be optimized more!###
    index = _.findIndex(@divColorVals, (dcv) ->
      return dcv > value
      )
    if index is -1
      return @lastColor.toHexString()
    else
      return @divColors[index].toHexString()

  show_map: (svgdiv, ticks=null, ticklabels=null) ->
    height = 100
    svg = d3.select("#"+svgdiv).append("svg")
                                    .attr("width", "100%")
                                    .attr("height", height)

    x_fracs = []

    width_used = 95
    height_used = 80
    width_interval = width_used / (@divColorVals.length)
    x_fracs = (2.5+width_interval*i for i in [0..(@divColors.length-1)])

    data = _.zip(@divColors, @divColorVals, x_fracs)
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('fill', (d) ->
            d[0].toHexString()
            )
      .attr('stroke', (d) ->
            d[0].toHexString()
            )
      .attr('x', (d) ->
            return d[2]+"%")
      .attr('width', width_interval+"%")
      .attr('height', height_used)

    ###
    Set up ticks:
    ###

    ### use orig values as ticks for now ###
    if ticks is null
      ticks = @origValues
    if ticklabels is null
      ticklabels = ticks


    offset = (100-width_used) / 2
    tick_fracs = (offset+width_used*(val-@min) / (@span) for val in ticks)

    data = _.zip(ticklabels, tick_fracs)

    svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr("x", (d) ->
            d[1]+"%")
      .attr("text-anchor", "middle")
      .attr("y", (height+height_used+12) / 2)
      .text( (d) ->
            d[0]
            )
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("fill", "black")


    return false
