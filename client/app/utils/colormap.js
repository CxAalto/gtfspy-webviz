// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import _ from "lodash";


class ColorMap {

  constructor(colors, origValues, ndivs, full_interpolate) {
    // values should be in increasing order
    // colors
    this.origValues = origValues;
    this.ndivs = ndivs;
    this.full_interpolate = full_interpolate;
    this.n = colors.length;
    if (this.n === !this.origValues.length) {
      throw "The colors and values should be of same length";
    }
    this.origColors = (Array.from(colors).map((color) => $.Color(color)));

    this.min = this.origValues[0], this.max = this.origValues[this.origValues.length - 1];
    this.firstColor = this.origColors[0], this.lastColor = this.origColors[this.origColors.length - 1];
    this.span = this.max - this.min;
    this.divColorVals = [];
    this.divColors = [];
    const step = this.span / (this.ndivs-1);
    for (let i = 0, end = this.ndivs-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      var col;
      var val = this.min+(i*step);
      this.divColorVals.push(val);

      const index = _.findIndex(this.origValues, origVal => origVal > val);

      if (index === -1) {
        col = this.copy_color(this.lastColor);
      } else {
        const val_span = this.origValues[index]-this.origValues[index-1];
        const val_frac = (this.origValues[index]-val) / val_span;
        col = this.origColors[index-1].transition(this.origColors[index], 1-val_frac);
      }

      this.divColors.push(col);
    }
  }

  copy_color(color) {
    return $.Color(color.toHexString());
  }

  get_color(value) {
    /* This could be optimized more!*/
    const index = _.findIndex(this.divColorVals, dcv => dcv > value);
    if (index === -1) {
      return this.lastColor.toHexString();
    } else {
      return this.divColors[index].toHexString();
    }
  }

  show_map(svgdiv, ticks=null, ticklabels=null) {
    const height = 100;
    const svg = d3.select(`#${svgdiv}`).append("svg")
                                    .attr("width", "100%")
                                    .attr("height", height);

    let x_fracs = [];

    const width_used = 95;
    const height_used = 80;
    const width_interval = width_used / (this.divColorVals.length);
    x_fracs = (__range__(0, (this.divColors.length-1), true).map((i) => 2.5+(width_interval*i)));

    let data = _.zip(this.divColors, this.divColorVals, x_fracs);
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('fill', d => d[0].toHexString())
      .attr('stroke', d => d[0].toHexString())
      .attr('x', d => d[2]+"%")
      .attr('width', width_interval+"%")
      .attr('height', height_used);

    /*
    Set up ticks:
    */

    /* use orig values as ticks for now */
    if (ticks === null) {
      ticks = this.origValues;
    }
    if (ticklabels === null) {
      ticklabels = ticks;
    }


    const offset = (100-width_used) / 2;
    const tick_fracs = (Array.from(ticks).map((val) => offset+((width_used*(val-this.min)) / (this.span))));

    data = _.zip(ticklabels, tick_fracs);

    svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr("x", d => d[1]+"%")
      .attr("text-anchor", "middle")
      .attr("y", (height+height_used+12) / 2)
      .text( d => d[0])
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("fill", "black");


    return false;
  }
};

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

export default ColorMap;