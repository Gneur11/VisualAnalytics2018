var margin = {top: 40, right: 20, bottom: 50, left: 60};

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
			document.getElementById(name).style.height="70%";
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

function bar(name,filter){
	main = document.getElementById("main");
	if(!!main){
		main.remove();
	}
	d3.csv("Lekagul Sensor Data.csv").then(function(data){
		var ordered;
		var base = data;
		var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
		var format; //lo tieni così per gli anni poi quando vai a vedere i mesi lo modifichi da quello già modificato
		if(filter == "Monthly") {
			format = d3.timeFormat("%m-%y");
		} else {
			format = d3.timeFormat("%y");
		}
		base.forEach(function(d,i) {   
				var time = parseTime(d.Timestamp);
				d.Timestamp = format(time);
				})						
		if(filter == "General"){
				ordered = d3.nest()
					.key(function(d){return d['car-type'];})
					.entries(base)
	                .sort(function(a, b){ return d3.descending(a.values, b.values);});
				auxBar(ordered,name);
		} else if (filter == "2016"){
				temp = base.filter(function(d) {return d['Timestamp'] == "16";})
				ordered = d3.nest()
							.key(function(d){return d['car-type'];})
							.entries(temp)
							.sort(function(a, b){ return d3.descending(a.values, b.values);});
				auxBar(ordered,name);
		} else if (filter == "2015"){
				temp = base.filter(function(d) {return d['Timestamp'] == "15";})
				ordered = d3.nest()
							.key(function(d){return d['car-type'];})
							.entries(temp)
							.sort(function(a, b){ return d3.descending(a.values, b.values);});
				auxBar(ordered,name);
		} else if (filter == "Monthly"){
				 ordered = d3.nest()
							.key(function(d){return d['car-type'];})
							.key(function(d) {return d['Timestamp'];})
							.rollup(function (v) {return v.length;}) //va bene così
							.entries(base)
							//	.sort(function(a, b){ return d3.descending(a.values, b.values);});
		}
		console.log(ordered);
	})

}

function onchange() {
			    s = document.getElementById("s")
				selectValue= ""+s[s.selectedIndex].value;
				bar("main",selectValue);
			}

function auxBar(data,name){
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.width="60%";
			document.getElementById(name).style.height="70%";
			
			var filters = ["General", "2015", "2016","Monthly"];

			var s = d3.select('#'+name)
						  .append('select')
							.attr("id","s")
							.attr('class','select')
							.on('change',onchange)

			var options = s
				  .selectAll('option')
					.data(filters)
					.enter()
					.append('option')
						.text(function (d) { return d})		//mostra sempre general anche se hai altri filtri
	
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
			    w = w - margin.left - margin.right;
				h = h - margin.top - margin.bottom -100;
			var i;
			count = [];
			keys = [];
			for (i=0; i< data.length; i++){
				count[i] = data[i].values.length;
			}
			count.sort(function(x, y){
			return d3.ascending(x.index, y.index);
			})
			var x = d3.scaleLinear().domain([0, d3.max(count)]).range([0, w-20]),
			ordered = data.sort();
			for(i=0;i<ordered.length;i++){
				keys[i] = data[i].key;
			}
			//console.log(keys);
			y = d3.scaleBand().rangeRound([0,h]);			
			y.domain(keys);
			var xAxis = d3.axisBottom(x);
			var yAxis = d3.axisLeft(y);
			var canvas = d3.select("#"+name).append("svg")
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom)
					.attr("id", "svg"+name)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
			canvas.append("g")
				  .attr("transform", "translate(0," + h + ")")
				  .call(d3.axisBottom(x));

			  // text label for the x axis
			canvas.append("text")             
				  .attr("transform",
						"translate(" + (w/2) + " ," + 
									   (h + margin.top) + ")")
				  .style("text-anchor", "middle")
				  .text("Number of occurrences");
			
			 // Add the y Axis
			canvas.append("g")
				.call(d3.axisLeft(y));

			canvas.append("text")
				.attr("transform", "rotate(-90)")
				  .attr("y", 0 - margin.left)
				  .attr("x",0 - (h / 2))
				  .attr("dy", "1em")
				  .style("text-anchor", "middle")
				  .text("Vehicle Type");      
				
			var div = d3.select("#"+name).append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);

			
			canvas.selectAll("rect")
					.data(data)
					.enter()
					.append("rect")
					//.attr("width",function (d){return x(d.values.length);})
					.attr("height", 30)
					.attr("y", function(d,i){return y(d.key)+5;})
					.attr("fill",function(d){if (d.key == "2P") {return "#EC9787";} else {return "steelblue";}})
					.on("mouseover", function(d,i){
								 canvas.append("text")
									 .attr('id','tooltip')
									 .text(d.values.length)
									 .attr("y", y(d.key)+22)
									.attr("x", x(d.values.length) + 5)
									.style("font-size","10px")
								d3.select(this)
									.attr("stroke","black")
									.attr("stroke-width",2);
							})
					.on("mouseout", function(d,i){
									canvas.selectAll("#tooltip")
										.remove();
									d3.select(this)
									.attr("stroke-width",0);	
					})
					.on("click", function(d){
									    s = document.getElementById("s")
										selectValue= ""+s[s.selectedIndex].value;
										gateBar(d.key,selectValue);
										})
					.transition()
					.duration(200)
					.attr("width", function(d, i) {
						return x(d.values.length);
					})
			
			var legendRect = 18;
			var legendSpacing = 4;
			
			legend = canvas.selectAll('.legend')                     // NEW
			  .data(["Park Rangers","Other"])                                   // NEW
			  .enter()                                                // NEW
			  .append('g')                                            // NEW
			  .attr('class', 'legend')                    
			  .attr("transform", function(d,i){
				  var height = legendRect + legendSpacing;
				  var offset = height * 2 / 2;
				  var horz = -2 * legendRect;
				  var vert = i * height -offset;
				  return "translate("+ (w - 130)+","+ ((h -100) - vert) +")";
			  });
			  
			 legend.append("rect")
				.attr("width",20)
				.attr("height",20)
				.style("fill",function(d,i){if (d=="Park Rangers")
									{return "#EC9787";} else {return "steelblue";}})
				
			legend.append("text")
				.attr("x", 25)
				.attr("y", 15)
				.text(function(d) {return d})
			
}
									
function gateBar(key,filter){
	var margin = {top: 40, right: 10, bottom: 150, left: 80};
	d3.csv("Lekagul Sensor Data.csv").then(function(data){ 
			var filtered; 
			var base = [];
			base = data;
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var format = d3.timeFormat("%y");
			base.forEach(function(d,i) {   
				time = parseTime(d.Timestamp);
				d.Timestamp = format(time);})						
			data15 = base.filter(function(d) {return d['Timestamp'] == "15";})
			data16 = base.filter(function(d) {return d['Timestamp'] == "16";})
			var f;
			if(filter == "2015"){
				filtered = d3.nest()
					.key(function(d){return d['car-type'];})
					.key(function(d){return d['gate-name'];})
					.entries(data15)
					.filter(function(d) {return d.key == key;});
				f = filtered[0].values;
			} else if (filter=="2016") {
				filtered = d3.nest()
					.key(function(d){return d['car-type'];})
					.key(function(d){return d['gate-name'];})
					.entries(data16)
					.filter(function(d) {return d.key == key;});
				f = filtered[0].values;
			}
			else if (filter=="General") { 				// total = nested data, metti un nest per tutti e applica i filtri
				filtered = d3.nest()
					.key(function(d){return d['car-type'];})
					.key(function(d){return d['gate-name'];})
					.entries(data)
					.filter(function(d) {return d.key == key;});
				f = filtered[0].values;
			}
			f.sort(function(a, b){ return d3.descending(a.values, b.values);});		
			var h = document.getElementById("main").clientHeight;
			var w = document.getElementById("main").offsetWidth;
					w = w - margin.left - margin.right;
					h = h - margin.top - margin.bottom;
			var i;		
			//console.log(f);
			keys = [];
			for(i=0;i<f.length;i++){
				keys[i] = f[i].key;
			}
			count = [];
			for (i=0; i< filtered[0].values.length; i++){
				count[i] = filtered[0].values[i].values.length;
			}

			var x = d3.scaleLinear().domain([0, d3.max(count)]).range([0, w-20]),
			y = d3.scalePoint().domain(keys).rangeRound([0,h]);
			var xAxis = d3.axisBottom(x);
			var yAxis = d3.axisLeft(y);
			d3.select("#svgmain").remove();
			var canvas = d3.select("#main").append("svg")       //occhio che hai dato nomi non portabili
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom)
					.attr("id", "svgmain")
					.append("g")
					.attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
	
				canvas.append("g")
				  .attr("transform", "translate(0," + h + ")")
				  .call(d3.axisBottom(x));

			  // text label for the x axis
				canvas.append("text")             
				  .attr("transform",
						"translate(" + (w/2) + " ," + 
									   (h + margin.top + 20) + ")")
				  .style("text-anchor", "middle")
				  .text("Number of readings");
			
			 // Add the y Axis
				canvas.append("g")
					.style("font","8px times")
					.call(d3.axisLeft(y));
			
			// text label for the y axis
			canvas.append("text")
				.attr("transform", "rotate(-90)")
				  .attr("y", 0 - margin.left)
				  .attr("x",0 - (h / 2))
				  .attr("dy", "1em")
				  .style("text-anchor", "middle")
				  .text("Sensor");      
			
			canvas.selectAll("rect")
					.data(f)
					.enter()
					.append("rect")
					//.attr("width",function (d){return x(d.values.length);})
					.attr("height", function(){return 5;})
					.attr("y", function(d,i){return y(d.key);})
					.attr("fill", function(d){if ((d.key).indexOf("ranger") > -1) {
												return "#a6cee3";   //ranger azzurro 
											} else if ((d.key).indexOf("general-gate") > -1) {
												return "#1f78b4"; // general gate blu
											} else if ((d.key).indexOf("entrance") > -1){
												return "#b2df8a";  //verdino entrance
											} else if ((d.key).indexOf("camping") > -1){
												return "#33a02c"; //verde camping
											} else { 
												return "#fb9a99"; //rosa gates 
											}})
					.transition()
					.duration(250)
					.attr("width", function(d, i) {
						return x(d.values.length);
					})
					

			var legendRect = 18;
			var legendSpacing = 4;
			
			legend = canvas.selectAll('.legend')                     // NEW
			  .data(["Ranger Camps","General gates","Entrances","Camping sites","Gates"])                                   // NEW
			  .enter()                                                // NEW
			  .append('g')                                            // NEW
			  .attr('class', 'legend')                    
			  .attr("transform", function(d,i){
				  var height = legendRect + legendSpacing;
				  var offset = height * 2 / 2;
				  var horz = -2 * legendRect;
				  var vert = i * height -offset;
				  return "translate("+ (w - 130)+","+ ((h -100) - vert) +")";
			  });
			  
			 legend.append("rect")
				.attr("width",20)
				.attr("height",20)
				.style("fill",function(d,i){if (d=="Ranger Camps") {return "#a6cee3";}
									else if (d == "General gates") {return "#1f78b4";}
									else if (d == "Camping sites") {return "#33a02c";}
									else if (d == "Gates") 		   {return "#fb9a99";}
									else if (d == "Entrances")     {return "#b2df8a";}
									})
				
			legend.append("text")
				.attr("x", 25)
				.attr("y", 15)
				.text(function(d) {return d})
	});	
}

function vt(){
	main = document.getElementById("main");
	if(!!main){
		main.remove();
	}
	bar("main","General");
	console.log("mostra id");
}

function time(){
	console.log("mostra time");}

