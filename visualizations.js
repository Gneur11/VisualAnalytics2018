var margin = {top: 40, right: 20, bottom: 50, left: 60};
var gInput = "";


function resize (e) {
		init(gInput);
	};

function init(input){
	gInput = input;
	el = document.getElementById("view");
	if(!!el){
		el.remove();
	}
	gate = document.getElementById("gatebar");
	if(!!gate){
		gate.remove();
	}
	e = document.getElementById("aux1");
	if(!!e){
		e.remove();
	}
	e2 = document.getElementById("aux2");
	if(!!e2){
		e2.remove();
	}
	if(input == "Vehicle Type"){
		vt();
	} else if(input == "Time") {
		vtime();
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
	
function scatter(name,filter,auxName){   //pie chart "comanda"quello che viene visualizzato, aggiungere un'altra view con una timeline di quando si va a posizionare la visita del tipo (pallini su time series) e una coi giorni di visita?
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
			document.getElementById(name).style.width="80%";
			document.getElementById(name).style.float="left";
			document.getElementById(name).style.height="80%";
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
			    w = w - margin.right - margin.left;
				h = h - margin.bottom - 90;
			
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

/* legend, tolta perchè si basa sul pie chart
					
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
*/
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
//rimuovi anche il tooltip, info verranno messe in un altra finestra 
/*		
			var tooldiv = d3.select("#"+name).append("div")
							.attr("class","scatterTooltip")
							.style("opacity",0)
	*/		
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
					.attr("fill", "lightgray")
					//.attr("fill","black")//function(d){if (d.car == "2P") {return "#EC9787"} else {return "steelblue"}}) colori sono comandati da pie
			/*			.on("mouseover", function(d){ 	d3.select(this).moveToFront();
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
						.on("mouseout", function(d) { d3.select(this).transition().duration(500).style("r",2).attr("stroke-width",0)})
													tooldiv.transition().duration(500).style("opacity",0).style("width","80px")
														tooldiv.selectAll("span").remove()}) */
				
						
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
						.attr("r", function(d) {if (filter == "3 or more Days") {return 10} else {return 2}}) //non so perchè non va
						.attr("fill", "lightgray")
						//.attr("fill",function(d){if (d.car == "2P") {return "#EC9787"} else {return "steelblue"}})
		/*					.on("mouseover", function(d){ d3.select(this).moveToFront();
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
			*/				
					svg.select(".x")
						.transition()
						.duration(1000)
						.call(d3.axisBottom(x));
					
					svg.select(".y")
						.transition()
						.duration(1000)
						.call(d3.axisLeft(y));
					//update pie;
					t2P = 0;
					t1 = 0;
					t2 = 0;
					t3 = 0;
					t4 = 0;
					t5 = 0;
					t6 = 0;
					for(i=0;i<data.length;i++){
						if(data[i].car == "2P"){
							t2P = t2P +1;
						} else if (data[i].car == "1"){
							t1 = t1 +1;
						} else if (data[i].car == "2"){
							t2 = t2 +1;
						} else if (data[i].car == "3"){
							t3 = t3 +1;
						} else if (data[i].car == "4"){
							t4 = t4 +1;
						} else if (data[i].car == "5"){
							t5 = t5 +1;
						} else if (data[i].car == "6"){
							t6 = t6 +1;
						}
					}
					setTimeout(function() {
					chart.unload("1");
					chart.unload("2");
					chart.unload("3");
					chart.unload("4");
					chart.unload("5");
					chart.unload("6");
					chart.unload("Rangers");
					},1000);
					
					setTimeout(function() {
						chart.load({
						columns:[["1",t1],["2",t2],["3",t3],["4",t4],["5",t5],["6",t6],["2P",t2P],]}
					)
					},1500)
					}
					
    var chart = gauge("aux1",ordered,h,w);
	})}

function gauge(name,data){ 
	console.log(data);
	t2P = 0;
	t1 = 0;
	t2 = 0;
	t3 = 0;
	t4 = 0;
	t5 = 0;
	t6 = 0;
	for(i=0;i<data.length;i++){
		if(data[i].car == "2P"){
			t2P = t2P +1;
		} else if (data[i].car == "1"){
			t1 = t1 +1;
		} else if (data[i].car == "2"){
			t2 = t2 +1;
		} else if (data[i].car == "3"){
			t3 = t3 +1;
		} else if (data[i].car == "4"){
			t4 = t4 +1;
		} else if (data[i].car == "5"){
			t5 = t5 +1;
		} else if (data[i].car == "6"){
			t6 = t6 +1;
		}
	}

	var div = d3.select("#container").append("div").attr("id",name).attr("class",name);
				document.getElementById(name).style.float="right";
				document.getElementById(name).style.height="50%";
				document.getElementById(name).style.width="19%";
	var h = document.getElementById(name).clientHeight;
	var w = document.getElementById(name).offsetWidth;
	    w = w -margin.right;
		h = h -margin.bottom;		
    
var d = d3.select("#"+name).append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("id","d"+name)
			.style("float","left")
			.append("g")
			.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
			
	c = [["1", t1],["2", t2],["3", t3],["4", t4],["5", t5],["6", t6],["2P", t2P]]
clicked = [];
clicked["1t"] = 0;
clicked["2t"] = 0;
clicked["3t"] = 0;
clicked["4t"] = 0;
clicked["5t"] = 0;
clicked["6t"] = 0;
clicked["2Pt"] = 0;

console.log(clicked);
console.log(clicked["1t"] == 0);
var chart = bb.generate({
  data: {
	columns: [[]],
    type: "donut", //gauge
    onclick: function(d, i) {
		val = d.id;
		if(clicked[val+"t"] == 0){
								clicked[val+"t"] = 1;
							} else {
								clicked[val+"t"] = 0;
							}
							console.log(clicked);
		svg = d3.select("#svgmain")
	//	svg.selectAll("circle").remove();
	//	svg.selectAll("circle").attr("r",function(c){console.log(d,c);if(c.car == d.id){return 20}});
		svg.selectAll("circle")
			.filter(function(c){
						if(c.car == val){
							return c}}
							)
			.attr("fill",function(c,i) {if(clicked[val+"t"] == 1){
																//console.log(clicked[val + "t"] == 0);	
																return chart.color(val)} else {return "lightgray"}})
			//console.log(clicked[val + "t"] == 0);
  },
    onover: function(d, i) {
					div.append("div").style("text-align","center").attr("id","temp").text((Math.round (d.ratio*1000))/10 + "%");
	   },
    onout: function(d, i) {
					document.getElementById("temp").remove();
	   }
  },
  bindto: "#d"+name
});
chart.load({columns:c});
return chart;
}	

function vID(){
	main = document.getElementById("main");
	if(!!main){
		main.remove();
	}
	scatter("main","General","aux1");
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
				auxBar(ordered,name,filter);
		} else if (filter == "2016"){
				temp = base.filter(function(d) {return d['Timestamp'] == "16";})
				ordered = d3.nest()
							.key(function(d){return d['car-type'];})
							.entries(temp)
							.sort(function(a, b){ return d3.descending(a.values, b.values);});
				auxBar(ordered,name,filter);
		} else if (filter == "2015"){
				temp = base.filter(function(d) {return d['Timestamp'] == "15";})
				ordered = d3.nest()
							.key(function(d){return d['car-type'];})
							.entries(temp)
							.sort(function(a, b){ return d3.descending(a.values, b.values);});
				auxBar(ordered,name,filter);
		} else if (filter == "Monthly"){        // need serious love
				 ordered = d3.nest()
							.key(function(d){return d['car-type'];})
							.key(function(d) {return d['Timestamp'];})
							.rollup(function (v) {return v.length;}) //va bene così
							.entries(base)
							//	.sort(function(a, b){ return d3.descending(a.values, b.values);});
							multiLine(ordered,name);
		}
	})

}

function onchange() {
				gate = document.getElementById("gatebar");
				if(!!gate){
					gate.remove();
				}
				pie = document.getElementById("aux1");
				if(!!pie){
					pie.remove();
				}
				pie1 = document.getElementById("aux2");
				if(!!pie1){
					pie1.remove();
				}
			    s = document.getElementById("s")
				selectValue= ""+s[s.selectedIndex].value;
				bar("main",selectValue);
			}
		
function pieroni(array,name,title){ 
	var div = d3.select("#container").append("div").attr("id",name).attr("class",name);
				document.getElementById(name).style.float="right";
		
	console.log(array);
	var h = document.getElementById(name).clientHeight;
	var w = document.getElementById(name).offsetWidth;
	    w = w - margin.right;
		h = h - margin.bottom;		
    radius = Math.min(w, h) / 2;
	console.log(array);
	//forse al posto di ricaricare ste cose si potrebbe nascondere la div e poi rimostrarla quando e stato calcolato tutto, "ricaricando" i nuovi risultati così è animato?
	var svg = d3.select("#"+name).append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("id","svg"+name)
			.style("float","left")
			.append("g")
			.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
		
		cols = [];
		for(i=0;i<arr.length;i++){
			a = [arr[i].key,arr[i].percent];
			cols.push(a);
		}
		var chart = bb.generate({
	  data: {
		color: function(color,d){if(name=="aux2")
									{if(d == "ranger-stops"){
													return "#a6cee3";
												     } else if(d == "general-gates") {
														return "#1f78b4";
													 } else if(d == "entrances"){
														return "#b2df8a";
													 } else if(d == "campings"){
														return "#33a02c";
													 } else {
														return "#fb9a99";
									}}
								 else {
									return color;
									}
								},
		columns: cols,
		type: "donut",
		onover: function(d, i) {
					div.append("div").style("text-align","center").attr("id","temp").attr("backgroundColor","red").text((Math.round (d.ratio*1000))/10 + "%");
	   },
		onout: function(d, i) {
					document.getElementById("temp").remove();
	   }
	  },
		legend:{
			show: true,
			position:'right',
		},
		donut: {
		title: title,
	  },
	  bindto: "#svg"+name
	});
  }

function auxBar(data,name,filter){
			var max = 0;
			for(i=0;i<data.length;i++){
				max = max + data[i].values.length;
			}
			arr = [];
			for(j=0;j<data.length;j++){
				obj = {"key":data[j].key,"percent":data[j].values.length};
				arr.push(obj);
			}
			console.log(max,arr);
			pieroni(arr,"aux1","Traffic per \n vehicle type");
			
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.float="left";
			
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
					.property("selected", function(d){return d == filter});
					
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
			    w = w - margin.left - margin.right;
				h = h - margin.top - margin.bottom -40;
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
			y = d3.scaleBand().rangeRound([0,h]).paddingInner(0.25);			
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
					.attr("height", y.bandwidth())
					.attr("y", function(d,i){return y(d.key)})
					.attr("fill",function(d){if (d.key == "2P") {return "#EC9787";} else {return "steelblue";}})
					.on("mouseover", function(d,i){
								 canvas.append("text")
									 .attr('id','t1')
									 .text(d.values.length)
									 .attr("y", y(d.key)+ y.bandwidth()/2)
									.attr("x", x(d.values.length) + 5)
									.style("font-size","10px")
								d3.select(this)
									.attr("stroke","black")
									.attr("stroke-width",2);
							})
					.on("mouseout", function(d,i){
									canvas.select("#t1")
										.remove();
									d3.select(this)
									.attr("stroke-width",0);	
					})
					.on("click", function(d){
										gate = document.getElementById("gatebar");
										if(!!gate){
											gate.remove();
										}
										pie = document.getElementById("aux2");
										if(!!pie){
											pie.remove();
										}
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
	var margin = {top: 40, right: 20, bottom: 120, left: 80};
	
	var div = d3.select("#container").append("div").attr("id","gatebar").attr("class","gatebar");
			
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
			var h = document.getElementById("gatebar").clientHeight;
			var w = document.getElementById("gatebar").offsetWidth;
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

			var y = d3.scaleLinear().domain([0,d3.max(count)]).range([h,0]),
			x = d3.scaleBand().domain(keys).rangeRound([0,w]).paddingInner(0.2);
			var xAxis = d3.axisBottom(x);
			var yAxis = d3.axisLeft(y);
			var canvas = d3.select("#gatebar").append("svg")       //occhio che hai dato nomi non portabili
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom)
					.attr("id", "svgmain")
					.append("g")
					.attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
	
				canvas.append("g")
				  .attr("transform", "translate(0," + h + ")")
				  .call(d3.axisBottom(x))
				  .selectAll("text")
				  .attr("transform","rotate(75)")
				  .attr("y", 0)
				  .attr("x", 9)
				  .attr("dy", ".35em")
				  .style("text-anchor", "start")
				  .style("font-size","9px");

			  // text label for the x axis
				canvas.append("text")             
				  .attr("transform",
						"translate(" + (w/2) + " ," + 
									   (h + margin.top + 40) + ")")
				  .style("text-anchor", "middle")
				  .text("Sensor");
			
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
				  .text("Number of readings");      
			
			console.log(f);
			canvas.selectAll("rect")
					.data(f)
					.enter()
					.append("rect")
					.attr("width",x.bandwidth())
					.attr("x", function(d,i){return x(d.key);})
					.attr("y", function(d) {return y(d.values.length)})
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
					.on("mouseover",function(d){canvas.append("text")
													  .attr('id','t')
													  .text(d.values.length)
													  .attr("x", x(d.key))
													 .attr("y", y(d.values.length)-(w/100))
													 .style("font-size","10px")
												d3.select(this)
													.attr("stroke","black")
													.attr("stroke-width",2);
									})
					.on("mouseout",function(d){	document.getElementById("t").remove();
												d3.select(this).attr("stroke-width",0)})
					.transition()
					.duration(250)
					.attr("height", function(d, i) {
						console.log(y(d.values.length));
						return h - y(d.values.length);
					})
					

			var legendRect = 10;
			var legendSpacing = 4;
			
			legend = canvas.selectAll('.legend')                     // NEW
			  .data(["Ranger Camps","General gates","Entrances","Camping sites","Gates"])                                   // NEW
			  .enter()                                                // NEW
			  .append('g')                                            // NEW
			  .attr('class', 'legend')                    
			  .attr("transform", function(d,i){
				  var width = legendRect + legendSpacing;
				  var offset =  width * 3 / 2 +100;
				  var horz = i * (legendRect + offset) ;
				  var vert = -2 * legendRect - 70;
				  return "translate("+ (w - (w/4) - horz)+","+ (h - vert) +")";
			  });
			  
			 legend.append("rect")
				.attr("width",10)
				.attr("height",10)
				.style("fill",function(d,i){if (d=="Ranger Camps") {return "#a6cee3";}
									else if (d == "General gates") {return "#1f78b4";}
									else if (d == "Camping sites") {return "#33a02c";}
									else if (d == "Gates") 		   {return "#fb9a99";}
									else if (d == "Entrances")     {return "#b2df8a";}
									})
				
			legend.append("text")
				.attr("x", 20)
				.attr("y", 10)
				.attr("font-size","10px")
				.text(function(d) {return d})
			
			//modifica pie chart esistente
			rangerStop = 0;
			generalGate = 0;
			entrance = 0;
			gate = 0;
			camping = 0;
			for(i=0;i<f.length;i++){
				if ((f[i].key).indexOf("ranger") > -1) {
											rangerStop = rangerStop + f[i].values.length;
											} else if ((f[i].key).indexOf("general-gate") > -1) {
												generalGate = generalGate + f[i].values.length;
											} else if ((f[i].key).indexOf("entrance") > -1){
												entrance = entrance + f[i].values.length;
											} else if ((f[i].key).indexOf("camping") > -1){
												camping = camping + f[i].values.length;
											} else { 
												gate = gate + f[i].values.length;
											}
				}
			arr = [{"key":"ranger-stops","percent":rangerStop},{"key":"general-gates","percent":generalGate},{"key":"entrances","percent":entrance},{"key":"gates","percent":gate},{"key":"campings","percent":camping}]
			pieroni(arr,"aux2","Traffic per \n type of sensor");
	});	
}

function multiLine(data,name) {
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.width="60%";
			document.getElementById(name).style.height="60%";
			document.getElementById(name).style.float="left";
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
			    w = w - margin.left - margin.right;
				h = h - margin.top - margin.bottom- 100;
			
			var //x = d3.scaleTime().range([0,w]),
		    x = d3.scalePoint().range([0, w]),
			y = d3.scaleLinear().domain([19000,0]).range([0,h]);
			
			var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b"));
			var yAxis = d3.axisLeft(y);			
			
			
			var z = d3.scaleOrdinal(d3.schemeCategory10);
			z.domain(data, function(d){return d.key;}); //mappa per ogni tipo di veicolo il coloro 
			var cols = [];
			var months = [];
			var rows= data.length;
			for (var i  = 0; i < rows; i++){
			     cols[i] = []
					months[i] = [];}
			var i;
			for(i=0;i<data.length;i++){
				var j;
				for(j=0;j<data[i].values.length;j++){
					cols[i][j]=(data[i].values[j].value);
				}
			}
			
			//console.log(cols);		
	
			
			var da0 = [];
				for (var j=0; j< data[0].values.length; j++){
					var linedata = {"type": data[0].key,"month": data[0].values[j].key, "value":+data[0].values[j].value}
					da0.push(linedata);
					months[j] = data[0].values[j].key;
				}
			x.domain(months);
			var da1 = [];
				for (var j=0; j<data[1].values.length; j++){
					var linedata = {"type": data[1].key,"month": data[1].values[j].key, "value":+data[1].values[j].value}
					da1.push(linedata);
				}
			var da2 = [];
				for (var j=0; j<data[2].values.length; j++){
					var linedata = {"type": data[2].key,"month": data[2].values[j].key, "value":+data[2].values[j].value}
					da2.push(linedata);
				}
			var da3 = [];
				for (var j=0; j<data[3].values.length; j++){
					var linedata = {"type": data[3].key,"month": data[3].values[j].key, "value":+data[3].values[j].value}
					da3.push(linedata);
				}
			var da4 = [];
				for (var j=0; j<data[1].values.length; j++){
					var linedata = {"type": data[4].key,"month": data[4].values[j].key, "value":+data[4].values[j].value}
					da4.push(linedata);
				}
			var da5 = [];
				for (var j=0; j<data[1].values.length; j++){
					var linedata = {"type": data[5].key,"month": data[5].values[j].key, "value":+data[5].values[j].value}
					da5.push(linedata);
				}
			var da6 = [];
				for (var j=0; j<data[1].values.length; j++){
					var linedata = {"type": data[6].key,"month": data[6].values[j].key, "value":+data[6].values[j].value}
					da6.push(linedata);
				}			
			
			console.log(data);
			var svg = d3.select("#"+name).append("svg")
					.attr("id", "svg"+name)
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
			svg.append("text")             
				  .attr("transform",
						"translate(" + (w/2) + " ," + 
									   (h + margin.top) + ")")
				  .style("text-anchor", "middle")
				  .text("Month");
			
			svg.append("text")
				.attr("transform", "rotate(-90)")
				  .attr("y", 0 - margin.left)
				  .attr("x",0 - (h / 2))
				  .attr("dy", "1em")
				  .style("text-anchor", "middle")
				  .text("Number of readings");     
			
			svg.append("g")
				  .attr("transform", "translate(0," + h + ")")
				  .call(d3.axisBottom(x));
			
			svg.append("g")
			  .style("font","8px times")
			  .call(d3.axisLeft(y))
			var base = data;
			var circlesGr = svg.selectAll(".circleGroups")
								.data(base) 
								.enter()
								.append("g")
								.attr("fill",function(d){return z(d.key)})

			var circles = circlesGr.selectAll(".circles")
									.data(function(d){return d.values})
									.enter()
									.append("circle")
									
				circles.attr("r",2)
						.attr("cx",function(d){return x(d.key)})
						.attr("cy",function(d){return y(d.value)})
			
			var line = d3.line()
						.x(function(d,i){return x(d.key)})
						.y(function(d,i) {return y(d.value);})		
			
			var pathsGroup = svg.selectAll(".pathsGroup")
								.data(base)
								.enter()
								.append("g")
								.attr("fill","none")
								.attr("stroke",function(d){console.log(d);return z(d.key)})
						
			var paths = pathsGroup.selectAll(".paths")
									.data(function(d){return [d.values]})
									.enter()
									.append("path")
									.attr("d",line)
									.attr("class","line")
									.attr("stroke-width",2)
									.attr("id",function(d,i){return "line";})
														
							/*		o = d3.selectAll(".line")
									o.each(function(d,i){
										var totalLength = d3.select("#line").getTotalLength;
										console.log(totalLength);
										d3.selectAll("#line"+i).attr("stroke-dasharray", totalLength + " " + totalLength)
																  .attr("stroke-dashoffset", totalLength)
																  .transition()
																  .duration(2000)
									})	
			/*	
				d3.select.attr("stroke-dasharray",function(d){totalLength = x(d.length); return(totalLength + " " + totalLength)})
						  .attr("stroke-dashoffset", 0)
						  .transition()
							.duration(2000)
							.attr("stroke-dashoffset",totalLength)
						*/	
			var legendRect = 18;
			var legendSpacing = 4;
		
			legend = svg.selectAll('.legend')                     
			  .data([da0,da1,da2,da3,da4,da5,da6])                                
			  .enter()                                                
			  .append('g')                                            
			  .attr('class', 'legend')                    
			  .attr("transform", function(d,i){
				  var height = legendRect + legendSpacing;
				  var offset = height * 2 / 2;
				  var horz = -2 * legendRect;
				  var vert = i * height -offset;
				  return "translate("+ (w - 80)+","+ vert +")";
			  });
			  
			 legend.append("rect")
				.attr("width",20)
				.attr("height",20)
				.style("fill", function(d){return z(d[0].type)})
				
			legend.append("text")
				.attr("x", 25)
				.attr("y", 15)
				.text(function(d) {return d[0].type})
  }							

function vt(){
	main = document.getElementById("main");
	if(!!main){
		main.remove();
	}
	bar("main","General");
	}

function vtime(){
	main = document.getElementById("main");
	if(!!main){
		main.remove();
	}
	timeroni("main");
}

function timeroni(name){
	d3.csv("Lekagul Sensor Data.csv").then(function(data){
			var base = data;
			var ordered = d3.nest()
					.key(function(d){return d['Timestamp'];})
					.entries(data);
		///	console.log(ordered);
			
			var date = "2015-05-01 08:32:09"
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var c = parseTime(date);
			
			var format = d3.timeFormat("%y-%m-%d");
	
			ordered.forEach(function(d,i) {   
				var time = parseTime(d.key);
				d.key = format(time);
				})
			
			
			
			var ordered1 = d3.nest()
						.key(function(d){return d['key'];})
						.entries(ordered);
			console.log(ordered1);
			console.log(ordered1[0].key == ordered1[1].key);
			
			var a = ordered1.filter(function(d){if (d.key > ordered[0].key) {return d;}});
			console.log(base);
			//il filtro così funziona, puoi fare una select in base al pezzo di grafico dove arrivi e filtri così ma dovrai fare sempre il force graph			
			/*
			fai a filtri, "primavera(2015)/estate/autunno/inverno/primavera(2016"
			primavera 1º marzo - 31 maggio
			estate (giugno - 31 agosto)
			autunno (settembre - 30 novembre)
			inverno (dicembre-29 febb)
			evidenzia anche nel grafico, tipo "se filtro primavera allora tutta la linea diventa trasparente"
			*/
			
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.width="60%";
			document.getElementById(name).style.height="70%";
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
			    w = w - margin.left - margin.right;
				h = h - margin.top - margin.bottom;
			var max = d3.max(ordered1,function(d){return d.values.length;});
			//console.log(max);
			
			var x = d3.scaleLinear().range([0, w]), // w -marginright
			y = d3.scaleLinear().range([h,0]);
			x.domain([0,ordered1.length]);
			y.domain(d3.extent(ordered1, function(d) {return d.values.length;}));
			var xAxis = d3.axisBottom(x);
			var yAxis = d3.axisLeft(y);
			var line = d3.line()
						.x(function(d,i) {return x(i);})
						.y(function(d) {return y(d.values.length);})			
			
			var svg = d3.select("#"+name).append("svg")
					.attr("id", "svg"+name)
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			svg.append("g")
				  .attr("transform", "translate(0," + h + ")")
				  .call(d3.axisBottom(x));

			  // text label for the x axis
			svg.append("text")             
				  .attr("transform",
						"translate(" + (w/2) + " ," + 
									   (h + margin.top) + ")")
				  .style("text-anchor", "middle")
				  .text("Day");
			
			 // Add the y Axis
			svg.append("g")
				.call(d3.axisLeft(y));
	
			// text label for the y axis
			svg.append("text")
				.attr("transform", "rotate(-90)")
				  .attr("y", 0 - margin.left)
				  .attr("x",0 - (h / 2))
				  .attr("dy", "1em")
				  .style("text-anchor", "middle")
				  .text("Traffic (# of readings)");
			
		var path = svg.append("path")
				.datum(ordered1)
				.attr("fill","none")
				.attr("stroke", "steelblue")
				.attr("class","line")
				.attr("stroke-width",1.5)
				.attr("d",line);
		
		var totalLength = path.node().getTotalLength();
			
			  path.attr("stroke-dasharray", totalLength + " " + totalLength)
				  .attr("stroke-dashoffset", totalLength)
				  .transition()
					.duration(2000)
					.attr("stroke-dashoffset", 0);	
	});
}
	


