var margin = {top: 40, right: 20, bottom: 50, left: 60};

/*function init(input){
	el = document.getElementById("view");
	c = document.getElementById("main");
	c.style.display = "block";
	if(input == "Vehicle Type"){
		vt();
	} else if(input == "Time") {
		time();
	} else if(input == "Vehicle ID"){
		vID();
	}
}
*/
function init(input){
	el = document.getElementById("view");
	if(!!el){
		el.remove();
	}
	if(input == "Vehicle Type"){
		vt();
	} else if(input == "Time") {
		time();
	} else if(input == "Vehicle ID"){
		vID();
	}
}

d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
d3.selection.prototype.moveToBack = function() {  
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        });
    };
	
function scatter(name,filter){
	/* currentGraphs.b = "scatter";
	currentGraphs.inputB = name;
	currentGraphs.filterB = filter;
	*/
	d3.csv("Lekagul Sensor Data.csv").then(function(data){
			var base = data;
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var format = d3.timeFormat("%d-%m-%Y");
			base.forEach(function(d,i) {   
				var time = parseTime(d.Timestamp);
				d.Timestamp = format(time);})
			
			var everyone = d3.nest()
					.key(function(d){return d['car-id'];})
					.key(function(d){return d['Timestamp']})
					.entries(data);
			
			var every = [];
			for(i=0;i<everyone.length;i++){
				var sum = 0;
				var car;
				var days = [];
				for(j=0;j<everyone[i].values.length;j++){
					sum = sum + everyone[i].values[j].values.length 
					car = everyone[i].values[j].values[0]['car-type']
					d = everyone[i].values[j].key;
					days.push(d);
				}
				var obj = {'sum':sum,"car":car,"days":days};
				every.push(obj);
			}						
			var rangers = every.filter(function(d){if(d.car == "2P"){return d}})
			var sameDayVisitors = every.filter(function(d){if(d.days.length == 1) {return d}});
			var diffDayVisitors = every.filter(function(d){if (d.days.length > 1) {return d}});
			var moreThan3 = every.filter(function(d){if(d.days.length > 2){return d}})
			var ordered;
			if(filter == "General"){
				ordered = every;		
			} else if (filter == "Rangers") {
				ordered = rangers;
			} else if (filter == "Same Day") {
				ordered = sameDayVisitors;
			} else if (filter == "Different Days") {
				ordered = diffDayVisitors;
			} else if (filter == "3 or more Days") {
				ordered = moreThan3;
			}
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.width="60%";
			document.getElementById(name).style.height="100%";
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
			    w = w - margin.left - margin.right;
				h = h - margin.top - margin.bottom -100;
			
			var filters = ["General", "Rangers", "Same Day","Different Days","3 or more Days"];

			var s = d3.select('#'+name)
						  .append('select')
							.attr("id","sel")
							.attr('class','select')
							.on('change',onchange)

			var options = s
				  .selectAll('option')
					.data(filters)
					.enter()
					.append('option')
						.text(function (d) { return d});
			var svg = d3.select("#"+name).append("svg")
					.attr("id", "svg"+name)
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
			var legendRect = 18;
			var legendSpacing = 4;
			
			legend = svg.selectAll('.legend')                     // NEW
			  .data(["Rangers","Other"])                                   // NEW
			  .enter()                                                // NEW
			  .append('g')                                            // NEW
			  .attr('class', 'legend')                    
			  .attr("transform", function(d,i){
				  var height = legendRect + legendSpacing;
				  var offset = (w + w/2 )/2;
				  var horz = i * (w - offset);
				  var vert = -2 * legendRect;
				  return "translate("+ (w - horz + -100)+",-10)"
			  });

			 legend.append("rect")
				.attr("width",20)
				.attr("height",20)
				.style("fill",function(d,i){if (d=="Rangers") {return "#EC9787";}
											else if (d=="Other"){return "steelblue"}}) //metti a posto tutti i colori anche sul grafo con filtro generale e sposta legenda
				
			legend.append("text")
				.attr("x", 25)
				.attr("y", 15)
				.text(function(d) {return d})
			//draw 		
			var max = d3.max(ordered,function(d){return d.sum})+5;
			var x = d3.scaleLinear().domain([0, ordered.length]).range([0, w-margin.right]),
			y = d3.scaleLinear().domain([0, max]).range([h,0]);
          
			svg.append("g")
				  .attr("transform", "translate(0," + h + ")")
				  .attr("class","x") 
				  .call(d3.axisBottom(x));

			  // text label for the x axis
			svg.append("text")             
				  .attr("transform",
						"translate(" + (w/2) + " ," + 
									   (h + margin.top) + ")")
				  .style("text-anchor", "middle")
				  .text("Vehicle");
			
			var tooldiv = d3.select("#"+name).append("div")
							.attr("class","tooltip")
							.style("opacity",0)
			
			 // Add the y Axis
			svg.append("g")
				.attr("class","y")
				.call(d3.axisLeft(y));
	
			// text label for the y axis
			svg.append("text")
				.attr("transform", "rotate(-90)")
				  .attr("y", 0 - margin.left)
				  .attr("x",0 - (h / 2))
				  .attr("dy", "1em")
				  .style("text-anchor", "middle")
				  .text("Number of readings"); 
			
			 svg.selectAll("circle")
					.data(ordered)
					.enter()
					.append("circle")
					.attr("cx", function (d,i){return x(i);})
					.attr("cy", function (d,i) {return y(d.sum);} )
					.attr("r", 2)
					.attr("fill",function(d){if (d.car == "2P") {return "#EC9787"} else {return "steelblue"}})
						.on("mouseover", function(d){ 	d3.select(this).moveToFront();
														d3.select(this)
															.transition()
															.duration(500)
															.style("r",12)
															.attr("stroke","black")
															.attr("stroke-width",6)
													    tooldiv.transition().duration(500).style("opacity",.9);
														if(d.days.length > 5){
															tooldiv.style("width","400px")
														} else {
															tooldiv.style("width","80px")
														}
												
														tooldiv.selectAll("text")
														               .data(d.days)
																	   .enter()
																	   .append("span")
																	   .text(function(d) {return d+", "})
	
														tooldiv.style("left", (d3.event.pageX + 15) + "px")
																.style("top", (d3.event.pageY - 40) +"px")
														})
						.on("mouseout", function(d) { d3.select(this).transition().duration(500).style("r",2).attr("stroke-width",0)
														tooldiv.transition().duration(500).style("opacity",0).style("width","80px")
														tooldiv.selectAll("span").remove()})
				
						
		function onchange() {
			s = document.getElementById("sel")
			selectValue= ""+s[s.selectedIndex].value;
				if(selectValue == "General") {
						data = every;
						//currentGraphs.filterB = selectValue;
						max = d3.max(every,function(d){return d.sum;})+5;
						x.domain([0,data.length]);
						y.domain([0,max]);
					} else if(selectValue == "Rangers") {
						data = rangers;
						//currentGraphs.filterB = selectValue;
						max = d3.max(rangers,function(d){return d.sum;})+5;
						x.domain([0,data.length]);
						y.domain([0,max]);
					} else if(selectValue == "Same Day"){
						data = sameDayVisitors;
						//currentGraphs.filterB = selectValue;
						max = d3.max(sameDayVisitors,function(d){return d.sum})+5;
						x = d3.scaleLinear().range([0, w-margin.right])
						y = d3.scaleLinear().range([h,0]);
						x.domain([0,data.length]);
						y.domain([0,max]);
					} else if(selectValue == "Different Days"){
						data = diffDayVisitors;
						//currentGraphs.filterB = selectValue;
						max = d3.max(diffDayVisitors,function(d){return d.sum})+5;
						x = d3.scaleLinear().range([0, w-margin.right])
						y = d3.scaleLinear().range([h,0]);
						x.domain([0,data.length]);
						y.domain([0,max]);
					} else if (selectValue == "3 or more Days"){
						data = moreThan3;
						//currentGraphs.filterB = selectValue;
						max = d3.max(moreThan3,function(d){return d.sum})+5;
						x = d3.scaleLinear().range([0, w-margin.right])
						y = d3.scaleLinear().range([h,0]);
						x.domain([0,data.length-1]);
						y.domain([0,max]);
					} 
					svg.selectAll("circle")
						.remove()
					 svg.selectAll("circle")
						.data(data)
						.enter()
						.append("circle")
						.attr("cx", function (d,i){return x(i);})
						.attr("cy", function (d,i) {return y(d.sum);} )
						.attr("r", 2)
						.attr("fill",function(d){if (d.car == "2P") {return "#EC9787"} else {return "steelblue"}})
							.on("mouseover", function(d){ d3.select(this).moveToFront();
															d3.select(this)
															.transition()
															.duration(500)
															.style("r",12)
															.attr("stroke","black")
															.attr("stroke-width",6)
													    tooldiv.transition().duration(200).style("opacity",.9);
														if(d.days.length > 5){
															tooldiv.style("width","400px")
														} else {
															tooldiv.style("width","80px")
														}
														
														tooldiv.selectAll("text")
														               .data(d.days)
																	   .enter()
																	   .append("span")
																	   .text(function(d) {return d+", "})
																	   
														tooldiv.style("left", (d3.event.pageX + 15) + "px")
																.style("top", (d3.event.pageY - 40) +"px")
														})
						.on("mouseout", function(d) { d3.select(this).transition().duration(500).style("r",2).attr("stroke-width",0)
														tooldiv.transition().duration(500).style("opacity",0).style("width","80px")
														tooldiv.selectAll("span").remove()})			
							
					svg.select(".x")
						.transition()
						.duration(1000)
						.call(d3.axisBottom(x));
					
					svg.select(".y")
						.transition()
						.duration(1000)
						.call(d3.axisLeft(y));
		}									
			
	})}

function vID(){
	main = document.getElementById("main");
	if(!!main){
		main.remove();
	}
	scatter("main","General");
	console.log("mostra id");
}


function vt(){
	console.log("mostra vehicle type");
}

function time(){
	console.log("mostra time");}

