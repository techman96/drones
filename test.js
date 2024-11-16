const tooltip = d3.select('body')
.append('div')
.attr('class','tooltip')

//select button
const button = d3.select('#switch_data')


//select container
const container = d3.select('#container');

// append SVG
const svg = container.append('svg');

//add margin
const margin_left = 25;
const margin_top = 20;

//Import the csv
d3.csv('data.csv').then(function(data){

  data.forEach(d => {
    d.st = +d['strikes'];
    d.killed = +d['killed']
  });

  const barLength = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.st)])
    .range([0, 250])

  const year_color = d3.scaleOrdinal()
    .domain([])
    .range(['red','red','red','red','red', 'blue','blue','blue','blue','blue','blue','blue','blue', 'orange','orange'])

  const bar_color = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.st)])
    .range(['#f9f1f1','red'])

  const bar_color_killed = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.killed )])
    .range(['#f9f1f1', 'red'])


  svg.selectAll('text')
  .data(data)
  .enter()
  .append('text')
  .attr('fill', function(d){
    return year_color(d.year)
  })
  .text(function(d){
    return d.year
  })
  .attr('x', function(d,i){
    return margin_left + (i * 35)
  })
  .attr('y',function(d,i){
    return margin_top
  })
  .style('font-size','12px')

  
  svg.selectAll('rectangles')
  .data(data)
  .enter()
  .append('rect')
  .attr('width', 15)
  .attr('height', function(d){
    return barLength(d.st)
  })
  .attr('x',function(d,i){
    return margin_left + 7 + (i * 35)
  })
  .attr('y',function(d,i){
    return margin_top + 5
  })
  .attr('text-anchor', 'middle')
  .attr('fill',function(d){
    return bar_color(d.st)
  })
  .on('mousemove',function(event,d,i){
    d3.select(this).style('opacity',0.5)
    tooltip
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY + 10) + "px")
    .style('opacity',1)
    .text("Civilians killed: " + d.st)
  })
  .on('mouseleave',function(evnet,d,i){
    d3.select(this).style('opacity', 1)
    tooltip
    .style('opacity',0)
  })
  .attr('class','rectangles')

  svg.selectAll('numbers')
  .data(data)
  .enter()
  .append('text')
  .text(function(d){
    return d.st
  })
  .attr('x',function(d,i){
    return margin_left + 15 + (i * 35)
  })
  .attr('y',function(d,i){
    return margin_top + barLength(d.st) + 25
  })
  .attr('text-anchor', 'middle')
  .attr('class','numbers')


  let isToggled = false;

  button.on('click',function(){

    if(isToggled){
      d3.select(this)
        .text('Change to civilians killed')
      svg.selectAll('.rectangles')
        .transition()
        .duration(500) 
        .attr('height',function(d,i){
        return barLength(d.st)
         })
      svg.selectAll('.numbers')
        .transition()
        .duration(500) 
        .attr('y',function(d,i){
        return  margin_top + barLength(d.st) + 25
        })
        .text(d => {
          return d.st
        })
    } else {
      d3.select(this)
        .text('Change to drone strikes')
      svg.selectAll('.rectangles')
        .transition()
        .duration(500) 
        .attr('height', function(d){
          return barLength(d.killed)
        })
        .attr('fill',function(d){
          return bar_color_killed(d.killed)
        })
      svg.selectAll('.numbers')
        .transition()
        .duration(500) 
        .attr('y',function(d,i){
        return margin_top + barLength(d.killed) + 25
         })
        .text(d => {
          return d.killed
        })
    }

    isToggled = !isToggled
})

});