let show = true
    const map = new maplibregl.Map({
        container: 'map',
         style: 'https://api.maptiler.com/maps/streets/style.json?key=cA97gdr395y4Uyx3pe0T',
        center: [71.4368897163954, 33.623862044380346],
        zoom: 6.3
    });

    map.on('load', async () => {

        image = await map.loadImage('drone.png');
        map.addImage('drone', image.data);

        map.addSource('strikes', {
            'type': 'geojson',
            'data': 'drone1.geojson'
        });

        map.addLayer({
            'id': 'loco',
            'source': 'strikes',
            'type': 'circle',
            'paint': {
                'circle-radius': [
                    'interpolate', 
                    ['linear'],
                    ['/', ['get', 'max_civ_killed'], 10], // scale total_deaths by 10
                    0, 5,
                    0.5, 8, // when total_deaths is 5, radius should be 10
                    8, 30 // when total_deaths is 10, radius should be 20
                ],
                'circle-color': 'red',
            }
        });

			map.addLayer({
            'id': 'icons',
            'type': 'symbol',
            'source': 'strikes',
            'layout': {
                'icon-image': 'drone',
                'icon-overlap': 'always',
				'icon-size': 0
            } 
        });

        map.on('click', 'loco', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;
            const location = e.features[0].properties.location;
            const district = e.features[0].properties.district;
            const division = e.features[0].properties.division;
            const date = e.features[0].properties.date;
            const total_killed = e.features[0].properties.total_deaths;
            const civ_killed = e.features[0].properties.civ_killed;
            const child_killed = e.features[0].properties.child_killed;
            const injured = e.features[0].properties.injured;
            const target = e.features[0].properties.target;
            const ref1 = e.features[0].properties.ref1;
            const ref2 = e.features[0].properties.ref2;


            const source_link = e.features[0].properties.source_link;
            const source = e.features[0].properties.source;


            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new maplibregl.Popup({ offset: [0, -10]})
                .setLngLat(coordinates)
                .setHTML(`<b>Location:</b> ${location}, ${district}, ${division} 
                          <br>
                          <b>Date:</b> ${date} 
                          <br>
                          <b>Total Deaths:</b> ${total_killed} 
                          <br>
                          <b>Civilians Killed:</b> ${civ_killed} 
                          <br>
                          <b>Children Killed:</b> ${child_killed}
                          <br>
                          <b>Injured:</b> ${injured}
                          <br>
                          <b>Target:</b> ${target}
                          <br>
                          <b>Context:</b> ${description} 
                          <br>
                          <b>Links: </b><a href="${ref1}" target="_blank">Ref1</a>,&nbsp<a href="${ref2}" target="_blank">Ref2</a>
                          <br>
                          
                          <hr>
                          <a href="${source_link}" target="_blank"><p class="set"> <i> ${source}</i> </p> </a>
                `)
                .addTo(map);
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-left'); 
        map.addControl(new maplibregl.FullscreenControl(), 'top-left');
        map.on('load', function() { const legend = new maplibregl.LegendControl({ layers: [ { layer: 'water', name: 'Water', color: '#0000ff' }, { layer: 'land', name: 'Land', color: '#00ff00' } ] }); map.addControl(legend, 'bottom-left'); });
        
        map.on('mouseenter', 'loco', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'loco', () => {
            map.getCanvas().style.cursor = '';
        });
    });

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
    
      svg.style('margin-right','600px')

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
        return (i * 60)
      })
      .attr('y',function(d,i){
        return margin_top
      })
      .style('font-size','20px')
    
      
      svg.selectAll('rectangles')
      .data(data)
      .enter()
      .append('rect')
      .attr('width', 20)
      .attr('height', function(d){
        return barLength(d.st)
      })
      .attr('x',function(d,i){
        return 13 + (i * 60)
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
        return 23 + (i * 60)
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

// window.onscroll = function() { myFunction(); };

// const container1 = document.getElementById('container1'); // Removed the '#' symbol
// var sticky = container1.offsetTop;
// var unstickPoint = sticky + (window.innerHeight * 1); // Adjust the multiplier to set the number of pages

// function myFunction() {
//   if (window.pageYOffset > sticky && window.pageYOffset < unstickPoint) {
//     container1.classList.add("sticky");
//   } else {
//     container1.classList.remove("sticky");
//   }
// }
