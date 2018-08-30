var margin = {top: 40, right: 20, bottom: 50, left: 60};
var gInput = "";

//metti nella view in basso a destra dopo aver cliccato: ID, numero di reading e sensori dov'è stato letto.
//metti anche una nuova view sotto in caso
function resize (e) {
		init(gInput);
	};

function init(input,ele){
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
	e3 = document.getElementById("a");
	if(!!e3){
		e3.remove();
	}
	e4 = document.getElementById("centerContainer")
	e5 = document.getElementById("leftContainer")
	if(!!e4){
		e4.remove();
		e5.remove();
	}
	if(input == "Vehicle/Sensor Type"){
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


function timeForScatter(name){ 
	d3.csv("Lekagul Sensor Data.csv").then(function(data){
			base = data;
			var ordered = d3.nest()
					.key(function(d){return d['Timestamp'];})
					.entries(data);			
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var format = d3.timeFormat("%y-%m-%d");
	
			ordered.forEach(function(d,i) {   
				var time = parseTime(d.key);
				d.key = format(time);
				})
			var ordered1 = d3.nest()
						.key(function(d){return d['key'];})
						.entries(ordered);
			mLabels = ["15-05-31","15-06-30","15-07-31","15-08-31","15-09-30","15-10-31","15-11-30","15-12-31","16-01-31","16-02-29","16-03-31","16-04-30","16-05-31"]
			months = [];
			j = ordered1.filter(function(d){if (d.key <= mLabels[0] ) {return d;}});   
			months.push(j);
			for(i=1;i<mLabels.length;i++){
				obj = ordered1.filter(function(d){if ((d.key <= mLabels[i]) && (d.key > mLabels[i-1])) {return d;}});
				months.push(obj);
			}
			xTicks = ["x"];
			values = [];
			for(i=0;i<ordered1.length;i++){
				xTicks.push(ordered1[i].key);
				values.push(ordered1[i].values.length);
			}
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.width="100%";
			document.getElementById(name).style.height="30%";
			document.getElementById(name).style.float="left";
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth - margin.right - 20;
			var svg = d3.select("#"+name).append("svg")
					.attr("id", "svg"+name)
					.attr("width", w)
					.attr("height", h)
					.append("g")
					.attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
	//		console.log("months",months); mesi singoli in array 
			var chart = bb.generate({
				  data: {
					x: "x",
					columns: [xTicks,values],
					onclick: function(d){console.log(d);},
				  },
				axis: {
					x: {
					  type: "timeseries",
						tick: {
								fit: true,
								count: 8,
								format: "%e %b %y"
							  }
					}
				  },
				   title: {text: "Traffic readings",
						 padding: {
							 top: 10,
							 bottom: 10,
						 },
						 position: "top-center"
					 },
					legend: {
						show:false,
					},
					point:{
						show:false,
					},
				  bindto: "#svg"+name
				});
	});
}
	
function scatter(name,filter,auxName){
	d3.csv("Lekagul Sensor Data.csv").then(function(data){
			var base = data;
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var format = d3.timeFormat("%y-%m-%d");
			base.forEach(function(d,i) {   
				var time = parseTime(d.Timestamp);
				d.Timestamp = format(time);})	
			var everyone = d3.nest()
					.key(function(d){return d['car-id'];})
					.key(function(d){return d['Timestamp']})
					.entries(data);
			
			var special = d3.nest()
					.key(function(d){return d['gate-name'];})
					.key(function(d){return d['car-type']})
					.entries(data);		
			var every = [];
			for(i=0;i<everyone.length;i++){
				var sum = 0;
				var car;
				var days = [];
				var id = "";
				var raw = [];
				for(j=0;j<everyone[i].values.length;j++){
					raw.push(everyone[i].values[j].values);
					sum = sum + everyone[i].values[j].values.length 
					car = everyone[i].values[j].values[0]['car-type']
					d = everyone[i].values[j].key;
					id = everyone[i].values[j].values[0]["car-id"];
					days.push(d);
				}
				var obj = {'sum':sum,"car":car,"days":days,"id":id,"raw":raw};
				every.push(obj);
			}					
			var rangers = every.filter(function(d){if(d.car == "2P"){return d}})
			var sameDayVisitors = every.filter(function(d){if(d.days.length == 1) {return d}});
			var diffDayVisitors = every.filter(function(d){if (d.days.length > 1) {return d}});
			var moreThan3 = every.filter(function(d){if(d.days.length > 2){return d}})
			var specialAccess = d3.nest()
					.key(function(d){return d['car-id'];})
					.key(function(d){return d['Timestamp']})
					.entries(data)
					.filter(function(d){
								present = false;
								for (j=0;j<d.values.length;j++){
									for(i=0;i<d.values[j].values.length;i++){
										g = d.values[j].values[i];
										gate = g["gate-name"];
									//	console.log(g,gate);
										if(gate.length < 6){
											present = true;
										}
									}
								}
							if(present) {return d};
					});
			var special = [];
			for(i=0;i<specialAccess.length;i++){
				var sum = 0;
				var car;
				var days = [];
				var id = "";
				var raw = [];
				for(j=0;j<specialAccess[i].values.length;j++){
					raw.push(specialAccess[i].values[j].values);
					sum = sum + specialAccess[i].values[j].values.length 
					car = specialAccess[i].values[j].values[0]['car-type']
					d = specialAccess[i].values[j].key;
					id = specialAccess[i].values[j].values[0]["car-id"];
					days.push(d);
				}
				var obj = {'sum':sum,"car":car,"days":days,"id":id,"raw":raw};
				special.push(obj);
			}					// magari qua aggiungi qualche dettaglio per lo special access 
			
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
			} else if (filter == "Special Access"){
				ordered = special;
			}
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.width="65%";
			document.getElementById(name).style.float="left";
			document.getElementById(name).style.height="54%";
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
			    w = w + 20 - margin.right - margin.left;
				h = h + margin.top - margin.bottom - 120;
			
			var filters = ["General", "Rangers", "Same Day","Different Days","3 or more Days","Special Access"];
			
			var hid = false;
			
			d3.select("#"+name).append("div")
					.append("input")
					.style("margin","auto")
					.style("display","block")
					.attr("class","filterButton")
					.attr("id","showButton")
					.style("background-color","#38B6FF")
					.style("border","none")
					.style("margin-top","10px")
					.style("margin-left","10px")
					.style("margin-right","10px")
					.style("float","right")
					.style("color","white")
					.attr("type","button")
					.attr("value","Hide all") 
					.on("click",function(){if(!hid) {
											d3.select("#svg"+name)
											.selectAll("circle")
											.style("opacity","0");
											d3.select(this).attr("value","Show all")
											hid = true;
											} else {
											d3.select("#svg"+name)
											.selectAll("circle")
											.style("opacity","1")
											d3.select(this).attr("value","Hide all")
											hid = false;}
											})
			
			
			var s = d3.select('#'+name)
						  .append('select')
							.attr("id","sel")
							.attr('class','select')
							.style("float","left")
							.style("margin-top","10px")
							.style("margin-left","10px")
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
			
		
			svg.append("text")             
				  .attr("transform",
						"translate(" + (w/2) + " ," + 
									   0 + ")")
				  .style("text-anchor", "middle")
				  .text("Number of readings per vehicle ID");
			
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
					.on("click",function(d){d3.select(this).moveToFront();
											d3.selectAll("circle").style("stroke","none");
											d3.select(this).style("stroke","black");
											d3.select(this).style("stroke-width","1px");
											day = document.getElementById("aux2");
											img = document.getElementById("svgaux2")
											i = document.getElementById("leftContainer")
											ig = document.getElementById("centerContainer")
												if(!!day){
														img.remove();
														day.remove();
														i.remove();
														ig.remove();
											}
											vehicleInfo(d);
											dayMonthBar(d.days,"aux2");
											})
					.on("mouseover",function(d){
												d3.select(this).attr("r",5).transition().duration(500);})
					.on("mouseout",function(d){
												d3.select(this).attr("r",2)}
												)
		
		function onchange() {
			s = document.getElementById("sel")
			selectValue= ""+s[s.selectedIndex].value;
			filter = selectValue;
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
					}  else if (selectValue == "Special Access"){ //
						data = special;
						max = d3.max(special,function(d){return d.sum})+5;
						x = d3.scaleLinear().range([0, w-margin.right])
						y = d3.scaleLinear().range([h,0]);
						x.domain([0,data.length-1]);
						y.domain([0,max]);
					} 
					day = document.getElementById("aux2");
					i = document.getElementById("leftContainer")
					ig = document.getElementById("centerContainer")
					if(!!day){
							day.remove();
							i.remove();
							ig.remove();
					}
					svg.selectAll("circle")
						.remove()
					svg.select("#showButton")
						.attr("text","Hide all");
						
					 svg.selectAll("circle")
						.data(data)
						.enter()
						.append("circle")
						.attr("cx", function (d,i){return x(i);})
						.attr("cy", function (d,i) {return y(d.sum);} )
						.attr("r", function(d) {if (filter == "3 or more Days") {return 3.5} else {return 2}}) //non so perchè non va
						.attr("fill", "lightgray")
						.on("click",function(d){d3.select(this).moveToFront();
											d3.selectAll("circle").style("stroke","none");
											d3.select(this).style("stroke","black");
											d3.select(this).style("stroke-width","1px");
											day = document.getElementById("aux2");
											img = document.getElementById("svgaux2")
											i = document.getElementById("leftContainer")
											ig = document.getElementById("centerContainer")
												if(!!day){
														img.remove();
														day.remove();
														i.remove();
														ig.remove();
											}
											vehicleInfo(d);
											dayMonthBar(d.days,"aux2");
											})
					.on("mouseover",function(d){d3.select(this).attr("r",5)})
					.on("mouseout",function(d){if (filter == "3 or more Days") {
														d3.select(this).attr("r",3.5).transition().duration(500);}
													else {
														d3.select(this).attr("r",2).transition().duration(500);
														}})
											
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
	
    var chart = gauge("aux1",ordered);	}
	)}        

//add details for click on vehicle scatter
function vehicleInfo(data){
	var left = d3.select("#container").append("div").attr("id","leftContainer").attr("class","mainClass");
		document.getElementById("leftContainer").style.width="34.2%";
		document.getElementById("leftContainer").style.float="left";
		document.getElementById("leftContainer").style.height="43%";
	var hl = document.getElementById("leftContainer").clientHeight;
	var wl = document.getElementById("leftContainer").offsetWidth;
	//    wl = wl + 20 - margin.right - margin.left;
	//	hl = hl + margin.top - margin.bottom - 140;
	var center = d3.select("#container").append("div").attr("id","centerContainer").attr("class","mainClass");
		document.getElementById("centerContainer").style.width="34.5%";
		document.getElementById("centerContainer").style.float="left";
		document.getElementById("centerContainer").style.height="43%";	
		m = [["ranger-stops",0],["entrances",0],["campings",0],["gate",0],["general-gates",0]]
	var hc = document.getElementById("centerContainer").clientHeight;
	var wc = document.getElementById("centerContainer").offsetWidth - 10;
		for(j=0;j<data.raw.length;j++){
			dat = data.raw[j];
			for(i=0;i<dat.length;i++){
				d = dat[i]["gate-name"];
				if (d.indexOf("ranger") > -1) {
					m[0][1]++;
				} else if (d.indexOf("general-gate") > -1) {
					m[4][1]++;
				} else if (d.indexOf("entrance") > -1){
					m[1][1]++;
				} else if (d.indexOf("camping") > -1){
					m[2][1]++;
				} else { 
					m[3][1]++;
				}
			}
		}
		m.sort(sortFunction);
		function sortFunction(a, b) {
			if (a[1] === b[1]) {
				return 0;
			}
			else {
				return (a[1] > b[1]) ? -1 : 1;
			}
		}
		//console.log(m);
		var d = d3.select("#centerContainer").append("svg")
				.attr("width", wc)
				.attr("height", hc)
				.attr("id","svgcenter")
				.append("g")
				.attr("transform", "translate(" + wc / 2 + "," + hc/2 + ")");
				
			var c = bb.generate({
					  data: {
						columns: [[m[0][0],m[0][1],0,0,0,0],[m[1][0],0,m[1][1],0,0,0],[m[2][0],0,0,m[2][1],0,0],[m[3][0],0,0,0,m[3][1],0],[m[4][0],0,0,0,0,m[4][1]]],
						type: "bar",
						groups: [[m[0][0],m[1][0],m[2][0],m[3][0],m[4][0]]], //fallo automaticamente seguyendo l'ordine di chi ha più traffico?
						color: function(d){return "steelblue"},
					  },
					  legend:{
						show: false,  
					  },
					  tooltip: {
						  show: false,
					  },
					  
					   axis: {
							x: {
							  type: "category",
						    categories: [m[0][0],m[1][0],m[2][0],m[3][0],m[4][0]]
							},
						}, 
						bar: {
							width: {
							  ratio: 0.5
							}
						  },
						title: {text: "Number of readings for selected vehicle",
											 padding: {
												 top: 10,
												 bottom: 10,
											 },
											 position: "top-center"
										 },
					  bindto: "#svgcenter"
					});

		vehicleForce(data,"left");
}	

function vehicleForce(data,name){
		paths = [];
		gates = [];
		for(j=0;j<data.raw.length;j++){
			dat = data.raw[j];
			p = [];
			for(i=0;i<dat.length;i++){
				p.push(dat[i]["gate-name"]);
				if(!gates.includes(dat[i]["gate-name"])){
					gates.push(dat[i]["gate-name"]);
					
				}
			}
			paths.push(p);
		}
		var order = [];
		var matrix = [];
		var map = {};
		var map1 = {};
		for(var i=0; i<gates.length; i++) {
			matrix[i] = new Array(gates.length);
			matrix[i].fill(0);
			map[gates[i]] = i;
			if(map1[gates[i]] == null){
				map1[gates[i]] = 0;
			} 
			order.push(gates[i]); 

		}
		console.log(gates,matrix);
		console.log(map1);
		console.log("p",paths);
		for(i=0;i<paths.length;i++){
			for(j=0;j<paths[i].length-1;j++){
					curr = paths[i][j]
					next = paths[i][j+1]
					console.log(map1[curr]);
					map1[curr] = map1[curr]+1;
										console.log(map1[curr]);
					map1[next] = map1[next]+1;
					matrix[map[curr]][map[next]] = matrix [map[curr]][map[next]]+1;
			}
		}	
		var nodesGeneral = [];
		for (i=0;i<gates.length;i++){
				n = gates[i]; 
				obj = {"label": n,"value": map1[n] }
				nodesGeneral.push(obj);
			}
		links = [];
		max = 0;
		min = 0;
		for(i=0;i<matrix.length;i++){
			for(j=0;j<matrix[i].length;j++){
					if(matrix[i][j] != 0 && order[i] != order[j]){ //togli le reads una uguale all'altra, farebbero i loop sul nodo
					el = {"source":order[i], "target":order[j], "value": matrix[i][j],"strength":0.7}
					links.push(el);
					if(el.value > max){
						max = el.value;
					} else if (min == 0){
						min = el.value;
					} else if(el.value < min){
						min = el.value;
					}
				}
			}
		}	
		for(i=0;i<links.length;i++){
			for(j=i;j<links.length;j++){
				if((links[i].source == links[j].target) && (links[i].target == links[j].source)){
					links[i].value = links[i].value + links[j].value;
					links.splice(j,1);
				}
			}
		}
		console.log(links);
		var h = document.getElementById("leftContainer").clientHeight;
		var w = document.getElementById("leftContainer").offsetWidth;
		    w = w;
			h = h; 
		var svg = d3.select("#leftContainer").append("svg")
					.attr("id", "svg"+name)
					.attr("width", w)
					.attr("height", h)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
		var legendRect = 10;
		var legendSpacing = 4;
			
		legend = svg.selectAll('.legend')                     // NEW
			.data(["Ranger Camps","General gates","Entrances","Camping sites","Gates"])                                   // NEW
			  .enter()                                                // NEW
			  .append('g')                                            // NEW
			  .attr('class', 'legend')                    
			  .attr("transform", function(d,i){
				  var width = legendRect + legendSpacing;
				  var offset =  70;
				  var vert = i * (legendRect + offset -50) ;
				  var horz = -2 * legendRect - 70;
				  return "translate("+ ((w/2) - horz)+","+ (h - (h/2) - vert) +")";
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
			var simulation = d3.forceSimulation().nodes(nodesGeneral);
			simulation.force("charge_force", d3.forceManyBody())
						.force("center_force", d3.forceCenter(w / 4, h / 3));
			
			var color = d3.scaleLinear()
						.domain([min,max])      // usa questo per cambiare i colori alle linee
						.range(["lightgray","red"]);
			//console.log(links);
			for(i=0;i<links.length;i++){
				for(j=i;j<links.length;j++){
					if((links[i].source == links[j].target) && (links[i].target == links[j].source)){
						links[i].value = links[i].value + links[j].value;
						links.splice(j,1);
					}
				}
			}
		var svgLinks = svg.append("g")
							.attr("class", "links")
							.selectAll("line")
							.data(links)
							.enter()
							.append("line")
							.style("stroke",function(d){return color(d.value)})
							.attr("stroke-width", 2)
							.style("z-index",-1)
							.on("mouseover", function(d) {		
									tool.transition()		
										.duration(200)		
										.style("opacity", .9)
										.style("left", (d3.event.pageX) + "px")		
										.style("top", (d3.event.pageY - 28) + "px")	
									tool.append("div").attr("id","t1").append("text").text("readings: " + d.value);
							;})			
							.on("mouseout", function(d) {		
									tool.transition()		
										.duration(500)		
										.style("opacity", 0);
									d3.selectAll("#t1").remove();
							})

			
		radius = 8;
		console.log(gates);
		var node = svg.append("g")
						//	.attr("class", "nodes")
							.selectAll("circle")
							.data(nodesGeneral)
							.enter()
							.append("circle")
							.attr("r", radius)
							.attr("fill", function(d){if ((d.label).indexOf("ranger") > -1) {
												return "#a6cee3";   //ranger azzurro 
											} else if ((d.label).indexOf("general-gate") > -1) {
												return "#1f78b4"; // general gate blu
											} else if ((d.label).indexOf("entrance") > -1){
												return "#b2df8a";  //verdino entrance
											} else if ((d.label).indexOf("camping") > -1){
												return "#33a02c"; //verde camping
											} else { 
												return "#fb9a99"; //rosa gates 
											}})
							.on("mouseover", function(d) {		
									tool.transition()		
										.duration(200)		
										.style("opacity", .9)
										.style("left", (d3.event.pageX) + "px")		
										.style("top", (d3.event.pageY - 28) + "px")	
									tool.append("div").attr("id","t1").append("text").text(d.label);
									tool.append("div").attr("id","t1").append("text").text("readings: " + d.value);
							;})			
							.on("mouseout", function(d) {		
									tool.transition()		
										.duration(500)		
										.style("opacity", 0);
									d3.selectAll("#t1").remove();
							})
							.on("click",function(d){});

			
		simulation.on("tick", tickActions );
		
		var link_force =  d3.forceLink(links)
                        .id(function(d) {return d.label; })
						
		simulation.force("links",link_force)
		
		function tickActions() {
				//update circle positions to reflect node updates on each tick of the simulation 
				node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(w - radius, d.x)); })
					.attr("cy", function(d) { return d.y = Math.max(radius, Math.min(h -radius, d.y)); });

					
				 svgLinks.attr("x1", function(d){return d.source.x; })
						.attr("y1", function(d) { return d.source.y; })
						.attr("x2", function(d) { return d.target.x; })
						.attr("y2", function(d) { return d.target.y; });

		}
			  
		var drag_handler = d3.drag()
				.on("start", drag_start)
				.on("drag", drag_drag)
				.on("end", drag_end);
				
		function drag_start(d) {
				  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
				  d.fx = d.x;
				  d.fy = d.y;
				}
				 
		function drag_drag(d) {
				  d.fx = d3.event.x;
				  d.fy = d3.event.y;
				}
				 
		function drag_end(d) {
			  if (!d3.event.active) simulation.alphaTarget(0);
			  d.fx = d.x;
			  d.fy = d.y;
			}

		drag_handler(node);

		var tool = d3.select("body").append("div")	
						.attr("class", "tooltip")				
						.style("opacity", 0);
}



function gauge(name,data){  //scatter controller
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

	var div = d3.select("#container").append("div").attr("id",name).attr("class",name).style("font-size","12px");
				document.getElementById(name).style.float="right";
				document.getElementById(name).style.height="54%";
				document.getElementById(name).style.width="34%";
	var h = document.getElementById(name).clientHeight;
	var w = document.getElementById(name).offsetWidth;
	    w = w ;
		h = h + margin.top - 10 - margin.bottom;		
    
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
			svg = d3.select("#svgmain")
			svg.selectAll("circle")
				.filter(function(c){
							if(c.car == val){
								return c}}
								)
				.style("opacity","1")
				.attr("fill",function(c,i) {if(clicked[val+"t"] == 1){
																	return chart.color(val)} else {return "lightgray"}})
				.moveToFront();
	  },
		onover: function(d, i) {
						div.append("div").attr("y",h-40).style("text-align","center").attr("id","temp").text((Math.round (d.ratio*1000))/10 + "%");
		   },
		onout: function(d, i) {
						document.getElementById("temp").remove();
		   }
	  },
	  donut:{
		  title: "% of \n vehicle type"
	  },
	  legend:{
		  item: { onclick:  function(d, i) {},
		  }
	  },
	  bindto: "#d"+name
	});
	chart.load({columns:c});
				
	return chart;
}	

function dayMonthBar(days,name){
	var parseTime = d3.timeParse("%Y-%m-%d");
	var format = d3.timeFormat("%b");
	d = new Array(days.len).fill(0);
	for(i=0;i<days.length;i++){				
		var time = parseTime(days[i]);
		d[i] = format(time);
		}						
	base = d[0];
	counter = 1;
	x = [];
	if(d.length == 1){
		base = d[0];
		counter = 1;
		x.push([base,counter])
	} else {
		j = 1;
		do{
			if(d[j] == base){
				counter = counter + 1;
				j++;
			} else {
				x.push([base,counter]);
				base = d[j];
				counter = 1;
				j++;
			}
		} while (j < d.length);
		x.push([base,counter]);
	}
	arr = []
	for(i=0;i<x.length;i++){
		arr.push(x[i]);
	}
	var div = d3.select("#container").append("div").attr("id",name).attr("class",name).style("font-size","12px");
			document.getElementById(name).style.float="right";
			document.getElementById(name).style.height="43%";
			document.getElementById(name).style.width="30%";
	var h = document.getElementById(name).clientHeight;
	var w = document.getElementById(name).offsetWidth;
	h = h - margin.top;
	var svg = d3.select("#"+name).append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("id","svg"+name)
			.style("float","left")
			.append("g")
			.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
			
	var c = bb.generate({
				data: {	
						columns: arr,
						type: "pie",
								onover: function(d, i) {
										div.append("div").attr("x",w/2).style("text-align","center").attr("id","temp").text((Math.round (d.ratio*1000))/10 + "%");
								},
								onout: function(d, i) {
								document.getElementById("temp").remove();
								},
					  },
					  tooltip: {
						  show: true,
					  },
						bar: {
							width: {
							  ratio: 0.5
							}
						  },
						legend:{
								item: {onclick: function(){},},
							},
						title: {text: "Readings by month for the selected vehicle",
											 padding: {
												 top: 10,
												 bottom: 10,
											 },
											 position: "top-center"
										 },
					  bindto: "#svg"+name
					});
	
	
}		

function vID(){
	main = document.getElementById("main");
	i = document.getElementById("leftContainer")
	ig = document.getElementById("centerContainer")
	if(!!main){
		main.remove();
	}
	if(!!i){
		i.remove();
		ig.remove();
	}
	scatter("main","General","aux1");
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
							multiLine(ordered,name,filter);
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
	var div = d3.select("#container").append("div").attr("id",name).attr("class",name).style("font-size","12px");
				document.getElementById(name).style.float="right";
	var h = document.getElementById(name).clientHeight;
	var w = document.getElementById(name).offsetWidth;
	    w = w + margin.left - margin.right;
		h = h + margin.top - 10 - margin.bottom;		
    radius = Math.min(w, h) / 2;
	var svg = d3.select("#"+name).append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("id","svg"+name)
			.style("float","left")
			.append("g")
			.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
		
		cols = [];
		for(i=0;i<array.length;i++){
			a = [array[i].key,array[i].percent];
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
					div.append("div").attr("x",w/2).style("text-align","center").attr("id","temp").text((Math.round (d.ratio*1000))/10 + "%");
					d3.select("#gatebar").
						selectAll("rect").
						filter(function (e){
									if ((d.id).indexOf("ranger") > -1 && (e.key).indexOf("ranger") < 0){
													d3.select(this).style("opacity",0.1); 
										} else if ((d.id).indexOf("general-gate") > -1 && (e.key).indexOf("general-gate") < 0) {
													d3.select(this).style("opacity",0.1); 
										} else if ((d.id).indexOf("entrance") > -1 && (e.key).indexOf("entrance") < 0){
													d3.select(this).style("opacity",0.1); 
										} else if ((d.id).indexOf("camping") > -1 && (e.key).indexOf("camping") < 0){
													d3.select(this).style("opacity",0.1); 										
										} else if ((d.id) == "gates" && (e.key).length > 6) { 
													d3.select(this).style("opacity",0.1); 
												} 
				})
	   },
		onout: function(d, i) {
					document.getElementById("temp").remove();
					d3.select("#gatebar").selectAll("rect").style("opacity",1);
	   },
	    onclick: function(d){},
	  },
		legend:{
			show: true,
			position:'right',
			onover: function(d,i){alert(d)},
			item: {onclick: function(d){},},
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
			//console.log(data);
			//pieroni(arr,"aux1","% of traffic per \n vehicle type");
			radar = radaroni(data,"aux1");
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.float="left";
					
			var s = d3.select('#'+name)
						  .append('select')
							.attr("id","s")
							.attr('class','select')
							.style("margin-top","10px")
							.style("margin-left","10px")
							.on('change',onchange)
			
			var filters = ["General", "2015", "2016","Monthly"];

			var options = s
					.selectAll('option')
					.data(filters)
					.enter()
					.append('option')
					.text(function (d) { return d})	
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
			
			canvas.append("text")
					.attr("transform","translate(" + (w/2)+ ", -15)")
					.style("font-size","14px")
					.style("text-anchor","middle")
					.text("Number of readings per Vehicle Type")
			
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
			lastFocused = "";	
			canvas.selectAll("rect")
					.data(data)
					.enter()
					.append("rect")
					.attr("height", y.bandwidth())
					.attr("y", function(d,i){return y(d.key)})
					.attr("fill","steelblue") // cambiare sto colore o no?
					.on("mouseover", function(d,i){
								canvas.append("text")
									 .attr('id','t1')
									 .text(d.values.length)
									 .attr("y", y(d.key)+ y.bandwidth()/2)
									.attr("x", x(d.values.length) + 5)
									.style("font-size","10px")
									.style("text-anchor","center")
								d3.select(this).attr("fill","#0091E5");
								radar.defocus();
								radar.focus(d.key);
							})
					.on("mouseout", function(d,i){
									canvas.select("#t1")
										.remove();
									d3.select("#"+name).selectAll("rect").attr("fill","steelblue");
									radar.focus(d.key);
									radar.focus(lastFocused);
					})
					.on("click", function(d){
										d3.select("#"+name).selectAll("rect").style("opacity",0.2);
										d3.select(this).style("opacity",1);
										d3.select(this).attr("fill","#0091E5");
										radar.defocus();
										radar.focus(d.key);
										lastFocused = d.key;
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
}

function radaroni(data,name){
	arr = [];
	arr.push(["x", "Ranger Stops", "General Gates", "Entrances", "Campings", "Gates"])
	for(i=0;i<data.length;i++){
		el = data[i].key;
		ranger = 0;
		entrance = 0;
		camping = 0;
		gate = 0;
		general = 0;
		for(j=0;j<data[i].values.length;j++){
			d = data[i].values[j]["gate-name"];
			if (d.indexOf("ranger") > -1) {
				ranger = ranger + 1;
			} else if (d.indexOf("general-gate") > -1) {
				general = general + 1;				
			} else if (d.indexOf("entrance") > -1){
				entrance = entrance + 1;
			} else if (d.indexOf("camping") > -1){
				camping = camping + 1;
			} else { 
				gate = gate + 1;
			}
		}
		arr.push([el,ranger,general,entrance,camping,gate])
	}
	//console.log(arr);
	
	var div = d3.select("#container").append("div").attr("id",name).attr("class",name).style("font-size","12px");
				document.getElementById(name).style.float="right";
	var h = document.getElementById(name).clientHeight;
	var w = document.getElementById(name).offsetWidth;
	    w = w + margin.left - margin.right;
		h = h + margin.top - 10 - margin.bottom;		
	var svg = d3.select("#"+name).append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("id","svg"+name)
			.style("float","left")
			.append("g")
			.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
	
	var chart = bb.generate({
				  data: {
					x: "x",
					columns: arr,
					type: "radar",
				//	labels: true
				  },
				  radar: {
					level: {
					  depth: 3,
					  text:{show:false,},
					}
				  },
				  legend:{item:{onclick: function(d){},},
				  },
				  bindto: "#svg"+name,
				});
	return chart;
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
					.attr("height", h + margin.top + margin.bottom)
					.attr("id", "svgmain")
					.append("g")
					.attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
				
				canvas.append("text")
					.attr("transform","translate(" + (w/2)+ ", -15)")
					.style("font-size","14px")
					.style("text-anchor","middle")
					.text("Number of readings for Vehicle Type \"" + key + "\" at every sensor")
				
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
				  .style("font-size", "12px")
				  .text("Sensor");
			
			 // Add the y Axis
				canvas.append("g")
					.style("font","8px times")
					.call(d3.axisLeft(y));
			
			// text label for the y axis
			canvas.append("text")
				.attr("transform", "rotate(-90)")
				  .attr("y", 0 - h/2)
				  .attr("x",0 - (h / 2))
				  .attr("dy", "1em")
				  .style("text-anchor", "middle")
				  .style("font-size","12px")
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
												d3.select("#gatebar").selectAll("rect").style("opacity",0.2);
												d3.select(this).style("opacity",1);
									})
					.on("mouseout",function(d){	document.getElementById("t").remove();
												d3.select("#gatebar").selectAll("rect").style("opacity",1);})
					.transition()
					.duration(250)
					.attr("height", function(d, i) {
						return h - y(d.values.length);
					})
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
			pieroni(arr,"aux2","% of traffic per \n type of sensor");
	});	
}

function multiLine(data,name,filter) { 
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.width="57%";
			document.getElementById(name).style.height="100%";
			document.getElementById(name).style.float="left";
			var h = document.getElementById(name).clientHeight - 40;
			var w = document.getElementById(name).clientWidth - margin.right - 20;
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
			var line0 = [data[0].key];
			var da0 = [];
				for (var j=0; j< data[0].values.length; j++){
					var linedata = {"type": data[0].key,"month": data[0].values[j].key, "value":+data[0].values[j].value}
					da0.push(linedata);
					months[j] = data[0].values[j].key;
					line0.push(+data[0].values[j].value);
				}
			var da1 = [];
			var line1 = [data[1].key];
				for (var j=0; j<data[1].values.length; j++){
					var linedata = {"type": data[1].key,"month": data[1].values[j].key, "value":+data[1].values[j].value}
					da1.push(linedata);
					line1.push(+data[1].values[j].value);
				}
			var line2 = [data[2].key];
			var da2 = [];
				for (var j=0; j<data[2].values.length; j++){
					var linedata = {"type": data[2].key,"month": data[2].values[j].key, "value":+data[2].values[j].value}
					da2.push(linedata);
					line2.push(+data[2].values[j].value);
				}
			var line3 = [data[3].key];
			var da3 = [];
				for (var j=0; j<data[3].values.length; j++){
					var linedata = {"type": data[3].key,"month": data[3].values[j].key, "value":+data[3].values[j].value}
					da3.push(linedata);
					line3.push(+data[3].values[j].value);
				}
			var line4 = [data[4].key];
			var da4 = [];
				for (var j=0; j<data[1].values.length; j++){
					var linedata = {"type": data[4].key,"month": data[4].values[j].key, "value":+data[4].values[j].value}
					da4.push(linedata);
					line4.push(+data[4].values[j].value);
				}
			var line5 = [data[5].key];
			var da5 = [];
				for (var j=0; j<data[1].values.length; j++){
					var linedata = {"type": data[5].key,"month": data[5].values[j].key, "value":+data[5].values[j].value}
					da5.push(linedata);
					line5.push(+data[5].values[j].value);
				}
			var line6 = [data[6].key];
			var da6 = [];
				for (var j=0; j<data[1].values.length; j++){
					var linedata = {"type": data[6].key,"month": data[6].values[j].key, "value":+data[6].values[j].value}
					da6.push(linedata);
					line6.push(+data[6].values[j].value);
				}			
			months.unshift("x");
			var s = d3.select('#'+name)
						.append('select')
						.attr("id","s")
						.attr('class','select')
						.style("margin-top","10px")
						.style("margin-left","10px")
						.on('change',onchange)
			var svg = d3.select("#"+name).append("svg")
					.attr("id", "svg"+name)
					.attr("width", w)
					.attr("height", h)
					.append("g")
					.attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
			
			var filters = ["General", "2015", "2016","Monthly"];
			var options = s
					.selectAll('option')
					.data(filters)
					.enter()
					.append('option')
					.text(function (d) { return d})	
					.property("selected", function(d){return d == filter});
			var chart = bb.generate({
				  data: {
					x: "x",
					columns: [
					["x", "2015-05-01", "2015-06-01", "2015-07-01", "2015-08-01", "2015-09-01", "2015-10-01","2015-11-01","2015-12-01","2016-01-01",
					"2016-02-01","2016-03-01","2016-04-01","2016-05-01"],
					line0,line1,line2,line3,line4,line5,line6
					],
				  onclick: function(d, i) { if(clicked == false) {
								clicked = true;
								d3.csv("Lekagul Sensor Data.csv").then(function(data){
								m = ["May 2015","June","July","August","September","October","November","December","January","February","March","April","May 2016"]
								dat = filterData(data, m[d.index]);
								c = g.data() //prende i dati dell'altro, funziona, puoi modificare le cose così
								  var parseTime = d3.timeParse("%Y-%m-%d");
									var format = d3.timeFormat("%a");
									dat.forEach(function(d,i) {   
										var time = parseTime(d.Timestamp);
										d.Timestamp = format(time);
										})
								  var ordered = d3.nest()
									.key(function(d){return d['car-type'];})
									.key(function(d){return d["Timestamp"];})
									.entries(dat)
									map = {"Mon": 1, "Tue":2, "Wed":3, "Thu":4,"Fri":5, "Sat":6, "Sun":7}
									days = [0,0,0,0,0,0,0];
									matrix = [];
									for(i=0;i<ordered.length;i++){
										arr = [ordered[i].key,0,0,0,0,0,0,0];
										for(j=0;j<ordered[i].values.length;j++){
											days[map[ordered[i].values[j].key]] = ordered[i].values[j].key //ordered[i].values[j].values.length] 
											arr[map[ordered[i].values[j].key]] = ordered[i].values[j].values.length;
										}
										matrix.push(arr);
										}
									el = document.getElementById("aux2");
									if(!!el){
										el.remove();
									}
									//gate sensor
									var filtered; 
									//dat1 = filterData(data,m[d.index]);  //filtra i dati in maniera corretta per mese
									filtered = d3.nest()
											.key(function(d){return d['gate-name'];})
											.key(function(d){return d['car-type'];})
											.entries(dat)
											
									temp = []
									rangerStop = 0;
									generalGate = 0;
									entrance = 0;
									gate = 0;
									camping = 0;
									//console.log(filtered);
									for(i=0;i<filtered.length;i++){
										map={"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"2P":0}
										for(j=0;j<filtered[i].values.length;j++){
											value = filtered[i].values[j].values.length;
											map[filtered[i].values[j].key] = map[filtered[i].values[j].key] + value;
											if ((filtered[i].key).indexOf("ranger") > -1) {
																		rangerStop = rangerStop + value ;
																		} else if ((filtered[i].key).indexOf("general-gate") > -1) {
																			generalGate = generalGate + value
																		} else if ((filtered[i].key).indexOf("entrance") > -1){
																			entrance = entrance + value
																		} else if ((filtered[i].key).indexOf("camping") > -1){
																			camping = camping + value
																		} else { 
																			gate = gate + value
																		}
											}
											temp.push([filtered[i].key,map])
										}
									arr = [["ranger-stops",rangerStop],["general-gates",generalGate],["entrances",entrance],["gates",gate],["campings",camping]]
									arr.sort(sortFunction);
									function sortFunction(a, b) {
										if (a[1] === b[1]) {
											return 0;
										}
										else {
											return (a[1] > b[1]) ? -1 : 1;
										}
									}
									week = gateWeek(temp,arr,m[d.index],"aux2");
									//console.log(temp);
									setTimeout(function() {g.unload();	d3.select("#Month").text("Readings per day of the week (" + m[d.index] + ")");},1000);	
									setTimeout(function() {g.load({columns:matrix});clicked = false;},1500)
										})								
									}
				  }
				  },
				  tooltip: {
						show: true,
						 grouped: false,
					 },
				axis: {
					x: {
					  type: "timeseries",
					  tick: {
						format: "%m-%y"
					  }
					}
				  },
				   title: {text: "Readings per vehicle type per month",
						 padding: {
							 top: 10,
							 bottom: 10,
						 },
						 position: "top-center"
					 },
					legend: {
						item: {onclick: function (d) {chart.toggle(d);g.toggle(d); 
														if(lineLegendShow[d]){ 
															week = removeType(d,week,temp)
															lineLegendShow[d] = false;
														} else {
															week = addType(d,week,temp)
															lineLegendShow[d] = true;
													}},
								onover: function(d) {
										matrix = [line0[0],line1[0],line2[0],line3[0],line4[0],line5[0],line6[0]]
										for(i=0;i<matrix.length;i++){
											if(matrix[i] != d){
												chart.defocus(matrix[i]);
												g.defocus(matrix[i]);
											}
										}
									},
								onout: function(d) {
										chart.focus()
										g.focus();
									},
								},
					},
				  bindto: "#svg"+name,
			});
	d3.csv("Lekagul Sensor Data.csv").then(function(data){
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var format = d3.timeFormat("%a");
			data.forEach(function(d,i) {   
				var time = parseTime(d.Timestamp);
				d.Timestamp = format(time);
				})
		    var ordered = d3.nest()
					.key(function(d){return d['car-type'];})
					.key(function(d){return d["Timestamp"];})
					.entries(data)
		map = {"Mon": 1, "Tue":2, "Wed":3, "Thu":4,"Fri":5, "Sat":6, "Sun":7}
		days = [0,0,0,0,0,0,0];
		matrix = [];
		//console.log(arr[map[ordered[0].values[0].key]]);
		for(i=0;i<ordered.length;i++){
			arr = [ordered[i].key,0,0,0,0,0,0,0];
			for(j=0;j<ordered[i].values.length;j++){
				days[map[ordered[i].values[j].key]] = ordered[i].values[j].key //ordered[i].values[j].values.length] 
				arr[map[ordered[i].values[j].key]] = ordered[i].values[j].values.length;
			}
			matrix.push(arr);
		}
		g = weekDays(matrix,data,"aux1","General");
	 })
  }	
var lineLegendShow = {"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"2P":true}// usato per tenere conto di quali tipi di macchine sono mostrati o meno
var clicked = false;

function filterData(data,month){
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var format = d3.timeFormat("%Y-%m-%d");
			data.forEach(function(d,i) {   
				var time = parseTime(d.Timestamp);
				d.Timestamp = format(time);
				})
			if(month == "May 2015"){
				data = data.filter(function(d) {if (d.Timestamp < "2015-05-31") {return d}})
			} else if (month == "June") {
				data = data.filter(function(d) {if ((d.Timestamp > "2015-05-31") && (d.Timestamp < "2015-06-31"))  {return d}})
			} else if (month == "July"){
				data = data.filter(function(d) {if ((d.Timestamp > "2015-06-31")&& (d.Timestamp < "2015-07-31")) {return d}})
			} else if (month == "August"){
				data = data.filter(function(d) {if ((d.Timestamp > "2015-07-31")&& (d.Timestamp < "2015-08-31")) {return d}})
			} else if (month == "September"){
				data = data.filter(function(d) {if ((d.Timestamp > "2015-08-31")&& (d.Timestamp < "2015-09-31")) {return d}})
			} else if (month == "October"){
				data = data.filter(function(d) {if ((d.Timestamp > "2015-09-31")&& (d.Timestamp < "2015-10-31")) {return d}})
			} else if (month == "November"){
				data = data.filter(function(d) {if ((d.Timestamp > "2015-10-31")&& (d.Timestamp < "2015-11-31")) {return d}})
			} else if (month == "December"){
				data = data.filter(function(d) {if ((d.Timestamp > "2015-11-31")&& (d.Timestamp < "2015-12-31")) {return d}})
			} else if (month == "January"){
				data = data.filter(function(d) {if ((d.Timestamp > "2015-12-31")&& (d.Timestamp < "2016-01-31")) {return d}})
			} else if (month == "February"){
				data = data.filter(function(d) {if ((d.Timestamp > "2016-01-31")&& (d.Timestamp < "2016-02-31")) {return d}})
			} else if (month == "March"){
				data = data.filter(function(d) {if ((d.Timestamp > "2016-02-31")&& (d.Timestamp < "2016-03-31")) {return d}})
			} else if (month == "April"){
				data = data.filter(function(d) {if ((d.Timestamp > "2016-03-31")&& (d.Timestamp < "2016-04-31")) {return d}})
			} else if (month == "May 2016"){
				data = data.filter(function(d) {if ((d.Timestamp > "2016-04-31")&& (d.Timestamp < "2016-05-31")) {return d}})
			}
		return data;
}
  
function weekDays(data,raw,name,filter) {
	var div = d3.select("#container").append("div").attr("id",name).attr("class","aux1");
			document.getElementById(name).style.width="42%";
			document.getElementById(name).style.height="58%";
			document.getElementById(name).style.float="right";
	var h = document.getElementById(name).clientHeight;
	var w = document.getElementById(name).offsetWidth;
	    w = w - margin.right ;
		h = h + margin.top - 10 - margin.bottom;		
    
	d3.select("#"+name).append("div")
					.style("text-align", "center")
					.style("vertical-align", "middle")
					.append("text")
					.attr("id","Month")
					.style("font-size","12px")
					.style("text-anchor","middle")
					.text(function(){return "Readings per day of the week (" + filter + ")"}) 
	
	var d = d3.select("#"+name).append("svg")
			.attr("width", w)
			.attr("height", h)
			.attr("id","svg"+name)
			.style("float","left")
			.append("g")
			.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
  //capisci bene come è da organizzare i dati per rappresnetare nella chart i giorni della settimana con sopra "stacked type of vehicle"
	  //se uno clicca da una parte o dall'altra, viene tutto nascosto in entrambi i grafici.
	//console.log(data);

	var chart = bb.generate({
  data: {
	columns: data,
    //type: "bar",
	groups: [
	//	["4","2P","1","2","3","4","5","6"] //non so se è meglio così (stacked) o uno affianco all'altro
	]
  },
  tooltip: {
	  show: false,
  },
    axis: {
		x: {
		  type: "category",
		  categories: [
			"Mon",
			"Tue",
			"Wed",
			"Thu",
			"Fri",
			"Sat",
			"Sun"]
		},
	},
	legend: {
			show:false,
			},
	/*title: {text: "Readings per day of the week",
						 padding: {
							 top: 10,
							 bottom: 10,
						 },
						 position: "top-center"
					 }, */
  bindto: "#svg"+name
});
return chart;
}	

function gateWeek(data,arr,month,name){
	var margin = {top: 40, right: 20, bottom: 120, left: 80};
	
	var div = d3.select("#container").append("div").attr("id",name).attr("class","aux1");
			document.getElementById(name).style.width="42%";
			document.getElementById(name).style.height="39%";
			document.getElementById(name).style.float="right";

			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
					w = w - margin.right;
					h = h;
	
			var d = d3.select("#"+name).append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("id","svg"+name)
				.append("g")
				.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
				
			var c = bb.generate({
					  data: {
						columns: [[arr[0][0],arr[0][1],0,0,0,0],[arr[1][0],0,arr[1][1],0,0,0],[arr[2][0],0,0,arr[2][1],0,0],[arr[3][0],0,0,0,arr[3][1],0],[arr[4][0],0,0,0,0,arr[4][1]]],
						type: "bar",
						groups: [[arr[0][0],arr[1][0],arr[2][0],arr[3][0],arr[4][0]]], //fallo automaticamente seguyendo l'ordine di chi ha più traffico?
						color: function(color,d){
								return "steelblue";
								},
					  },
					  legend:{
						show: false,  
					  },
					  tooltip: {
						  show: false,
					  },
					  
					   axis: {
							x: {
							  type: "category",
						    categories: [arr[0][0],arr[1][0],arr[2][0],arr[3][0],arr[4][0]]
							},
						}, 
						bar: {
							width: {
							  ratio: 0.5
							}
						  },
						title: {text: "Number of readings per sensor type in " + month,
											 padding: {
												 top: 10,
												 bottom: 10,
											 },
											 position: "top-center"
										 },
					  bindto: "#svg"+name
					});
				//console.log(c.data());
				return c;
}
	

//aggiorna il grafico di gate week togliendo i tipi di macchine deselezionati nelle altre legend
function removeType(type,graph,data,month){
	//console.log(data);
	//console.log(graph.data());
	var rangers = 0,
		general = 0,
		entrances = 0,
		gates = 0,
		campings = 0;
	for(i=0;i<data.length;i++){ 
		if ((data[i][0]).indexOf("ranger") > -1) {			//questi sono il numero di visite all'interno dei sensori dei ranger per il tipo di macchina type
					rangers = rangers + data[i][1][type];
				//	console.log(data[i][1], data[i][1][type], type);
				} else if ((data[i][0]).indexOf("general-gate") > -1) {
					general = general + data[i][1][type];
				} else if ((data[i][0]).indexOf("entrance") > -1){
					entrances = entrances + data[i][1][type];
				} else if ((data[i][0]).indexOf("camping") > -1){
					campings = campings + data[i][1][type];
				} else { 
					gates = gates + data[i][1][type];
				}
	}
	//console.log("remove",rangers,gates,entrances,campings,general);
	d = graph.data();
	r = 0;
	ge= 0;
	e = 0;
	c = 0;
	ga = 0;
	for(j=0;j<d.length;j++){    //prendi i valori del grafico attuale e toglici i valori per tipo selezionato, per ogni sensore
			if (d[j].id == "ranger-stops") {
			//	d[j].values[j].value = d[j].values[j].value - rangers;
				r = d[j].values[j].value - rangers;
			//	console.log("valore attuale per rangers meno rangers", d[j].values[j].value, rangers)
			} else if (d[j].id == "general-gates") {
				ge = d[j].values[j].value - general;
			//	console.log("valore attuale per general meno general", d[j].values[j].value, general)				
			} else if (d[j].id == "entrances"){
				e = d[j].values[j].value - entrances;
			} else if (d[j].id == "campings"){
				c = d[j].values[j].value - campings;
			} else if (d[j].id == "gates") { 
				ga = d[j].values[j].value - gates;
		}		
	}
	//console.log("d",d);
	//console.log("valori da caricare dopo aver tolto",r,ga,e,c,ge); //occhio che forse lo chiama quando non deve
	//arr = [["ranger-stops",r,0,0,0,0],["general-gates",0,ge,0,0,0],["entrances",0,0,e,0,0],["gates",0,0,0,ga,0],["campings",0,0,0,0,c]]
	arr = [["ranger-stops",r],["general-gates",ge],["entrances",e],["gates",ga],["campings",c]]
	arr.sort(sortFunction);
		function sortFunction(a, b) {
			if (a[1] === b[1]) {
				return 0;
			}
			else {
				return (a[1] > b[1]) ? -1 : 1;
			}
		}
		document.getElementById("svgaux2").remove();
		var h = document.getElementById("aux2").clientHeight;
		var w = document.getElementById("aux2").offsetWidth;
					w = w - margin.right;
					h = h;
		var d = d3.select("#aux2").append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("id","svgaux2")
				.append("g")
				.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
				var c = bb.generate({
					  data: {
						columns: [[arr[0][0],arr[0][1],0,0,0,0],[arr[1][0],0,arr[1][1],0,0,0],[arr[2][0],0,0,arr[2][1],0,0],[arr[3][0],0,0,0,arr[3][1],0],[arr[4][0],0,0,0,0,arr[4][1]]],
						type: "bar",
						groups: [[arr[0][0],arr[1][0],arr[2][0],arr[3][0],arr[4][0]]], //fallo automaticamente seguyendo l'ordine di chi ha più traffico?
						color: function(color,d){
								return "steelblue";
								},
					  },
					  legend:{
						show: false,  
					  },
					  tooltip: {
						  show: false,
					  },
					  
					   axis: {
							x: {
							  type: "category",
						    categories: [arr[0][0],arr[1][0],arr[2][0],arr[3][0],arr[4][0]]
							},
						}, 
						bar: {
							width: {
							  ratio: 0.5
							}
						  },
						title: {text: "Number of readings per sensor type in " ,//+ month,
											 padding: {
												 top: 10,
												 bottom: 10,
											 },
											 position: "top-center"
										 },
					  bindto: "#svgaux2",
					});
				//console.log(c.data());
				return c;
}

function addType(type,graph,data){
	var rangers = 0,
		general = 0,
		entrances = 0,
		gates = 0,
		campings = 0;
		for(i=0;i<data.length;i++){
		if ((data[i][0]).indexOf("ranger") > -1) {
					rangers = rangers + data[i][1][type];
				} else if ((data[i][0]).indexOf("general-gate") > -1) {
					general = general + data[i][1][type];
				} else if ((data[i][0]).indexOf("entrance") > -1){
					entrances = entrances + data[i][1][type];
				} else if ((data[i][0]).indexOf("camping") > -1){
					campings = campings + data[i][1][type];
				} else { 
					gates = gates + data[i][1][type];
				}
	}
	//console.log("add",rangers,gates,entrances,campings,general);
	d = graph.data();
	r = 0;
	ge= 0;
	e = 0;
	c = 0;
	ga = 0;
	for(j=0;j<d.length;j++){
			if (d[j].id == "ranger-stops") {
				r = d[j].values[j].value + rangers;
			} else if (d[j].id == "general-gates") {
				ge = d[j].values[j].value + general;					
			} else if (d[j].id == "entrances"){
				e = d[j].values[j].value + entrances;
			} else if (d[j].id == "campings"){
				c = d[j].values[j].value + campings;
			} else if (d[j].id == "gates") { 
				ga = d[j].values[j].value + gates;
		}		
	}
//	console.log("d",d);
//	console.log("valori da caricare dopo aver aggiunto",r,ga,e,c,ge);
	arr = [["ranger-stops",r],["general-gates",ge],["entrances",e],["gates",ga],["campings",c]]
	arr.sort(sortFunction);
		function sortFunction(a, b) {
			if (a[1] === b[1]) {
				return 0;
			}
			else {
				return (a[1] > b[1]) ? -1 : 1;
			}
		}
		document.getElementById("svgaux2").remove();
		var h = document.getElementById("aux2").clientHeight;
		var w = document.getElementById("aux2").offsetWidth;
					w = w - margin.right;
					h = h;
		var d = d3.select("#aux2").append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("id","svgaux2")
				.append("g")
				.attr("transform", "translate(" + w / 2 + "," + h/2 + ")");
				var c = bb.generate({
					  data: {
						columns: [[arr[0][0],arr[0][1],0,0,0,0],[arr[1][0],0,arr[1][1],0,0,0],[arr[2][0],0,0,arr[2][1],0,0],[arr[3][0],0,0,0,arr[3][1],0],[arr[4][0],0,0,0,0,arr[4][1]]],
						type: "bar",
						groups: [[arr[0][0],arr[1][0],arr[2][0],arr[3][0],arr[4][0]]], //fallo automaticamente seguyendo l'ordine di chi ha più traffico?
						color: function(color,d){
								return "steelblue";
								},
					  },
					  legend:{
						show: false,  
					  },
					  tooltip: {
						  show: false,
					  },
					  
					   axis: {
							x: {
							  type: "category",
						    categories: [arr[0][0],arr[1][0],arr[2][0],arr[3][0],arr[4][0]]
							},
						}, 
						bar: {
							width: {
							  ratio: 0.5
							}
						  },
						title: {text: "Number of readings per sensor type in " ,//+ month,
											 padding: {
												 top: 10,
												 bottom: 10,
											 },
											 position: "top-center"
										 },
					  bindto: "#svgaux2",
					});
				//console.log(c.data());
				return c;
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
			base = data;
			var ordered = d3.nest()
					.key(function(d){return d['Timestamp'];})
					.entries(data);			
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
			mLabels = ["15-05-31","15-06-30","15-07-31","15-08-31","15-09-30","15-10-31","15-11-30","15-12-31","16-01-31","16-02-29","16-03-31","16-04-30","16-05-31"]
			months = [];
			j = ordered1.filter(function(d){if (d.key <= mLabels[0] ) {return d;}});   
			months.push(j);
			for(i=1;i<mLabels.length;i++){
				obj = ordered1.filter(function(d){if ((d.key <= mLabels[i]) && (d.key > mLabels[i-1])) {return d;}});
				months.push(obj);
			}
			xTicks = ["x"];
			values = [];
			for(i=0;i<ordered1.length;i++){
				xTicks.push(ordered1[i].key);
				values.push(ordered1[i].values.length);
			}
			var div = d3.select("#container").append("div").attr("id",name).attr("class","mainClass");
			document.getElementById(name).style.width="99.5%";
			document.getElementById(name).style.height="49%";
			document.getElementById(name).style.float="left";
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth - margin.right;
			
			var offsets = document.getElementById(name).getBoundingClientRect();
			var top = offsets.top;
			var left = offsets.left;

			
			d3.select("#"+name).append("div")
								.style("margin-top","20px")
								.style("margin-left","20px")
								.style("position","absolute")
								.style("left",left)
								.style("top",top)
								.style("text-align","center")
								.style("z-index",3)
								.attr("id","temp")
								.style("font-size","10px")
								.text("Selected time interval: ")
			
			d3.select("#"+name).append("div")
								.append("input")
								.style("z-index",3)
								.style("display","block")
								.style("position","absolute")
								.style("right","20px")
								.attr("class","filterButton")
								.attr("id","showForce")
								.style("background-color","#38B6FF")
								.style("border","none")
								.style("margin-top","20px")
								.style("margin-left","20px")
								.style("margin-right","20px")
								.style("color","white")
								.attr("type","button")
								.attr("value","Show Detail") 
								.style("opacity",0)
								
			var svg = d3.select("#"+name).append("svg")
					.attr("id", "svg"+name)
					.attr("width", w)
					.attr("height", h)
					.append("g")
					.attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
	//		console.log("months",months); mesi singoli in array 
			var chart = bb.generate({
				  data: {
					x: "x",
					columns: [xTicks,values],
				  },
				axis: {
					x: {
					  type: "timeseries",
					  tick: {
							fit: true,  //guarda bene fa cacar
							count: 12,
							format: "%d-%m-%y",
						}
					}
				  },
				subchart: {
					show:true,
					onbrush: function(domain) { 
												var format = d3.timeFormat("%y-%m-%d");
												beginning = d3.isoParse(domain[0]);
												end = d3.isoParse(domain[1]);
												domain[0] = format(beginning);
												domain[1] = format(end);
												toShow = d3.timeFormat("%d-%m-%y (%a)");
												d3.select("#showForce").style("opacity",1).on("click",function(){
																												a = document.getElementById("a");
																												if(!!a){
																													a.remove();
																												};
																												if(!!document.getElementById("aux2")){
																													document.getElementById("aux2").remove();
																												}
																												force("a",domain)});
												d3.select("#temp").text("Selected time interval: "+ toShow(beginning) +" , "+toShow(end))
												},
					size: {height: 10,},
					axis: {
						x: {
						  type: "timeseries",
						  tick: {
								fit: true,  
								count: 12,
								format: "%d-%m-%y",
							}
						}
					  }
				},  
				   title: {text: "Traffic readings",
						 padding: {
							 top: 10,
							 bottom: 10,
						 },
						 position: "top-center"
					 },
					legend: {
						show:false,
					},
				  bindto: "#svg"+name
				});
	});
}

function force(name,domain) {   
	var margin = {top: 40, right: 20, bottom: 50, left: 10};

	d3.csv("Lekagul Sensor Data.csv").then(function(data){
			var base = data;
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
			var format = d3.timeFormat("%y-%m-%d");
			base.forEach(function(d,i) {   
			time = parseTime (d.Timestamp)
			d.Timestamp = format(time)}
			)
//			console.log(base);
			base = base.filter(function(d){return (d["Timestamp"] >= domain[0])})
			base = base.filter(function(d){return (d["Timestamp"] <= domain[1])})
			var general = d3.nest()
					.key(function(d){return d['gate-name'];})
					.key(function(d){return d['car-id'];})
					.entries(base)
			
			var links = d3.nest()
						.key(function(d) {return d['car-id'];})
						.key(function(d) {return d['Timestamp'];})
						.rollup(function (v) {var arr = [];
												for(i=0;i<v.length;i++){
													arr.push(v[i]['gate-name']);
												}
											  return {"path":arr,"car":v[0]["car-id"],"type": v[0]["car-type"]}
						})
						.entries(base)			
			var nodesGeneral = [];
			for (i=0;i<general.length;i++){
				n = general[i].key 
				obj = {"label": n, "value": general[i].values.length}
				nodesGeneral.push(obj);
			}
			nodesGeneral = nodesGeneral.sort(function(a,b){return d3.ascending(a.label,b.label)})
			var paths = [];
			for(i=0;i<links.length;i++){
				p1 = []
				for(j=0;j<links[i].values.length;j++){
					p = links[i].values[j].value.path
					p1.push(p);
				}
				paths.push(p1);
			}
			console.log(nodesGeneral);
			var map = {};
			var order = [];
			var matrix = [];
			for(var i=0; i<general.length; i++) {
				matrix[i] = new Array(general.length);
				matrix[i].fill(0);
				map[general[i].key] = i;
				order.push(general[i].key);
			}
					
			for(i=0;i<paths.length;i++){
				for(j=0;j<paths[i].length;j++){
					for(k=0;k<paths[i][j].length-1;k++){
							curr = paths[i][j][k]
							next = paths[i][j][k+1]
							matrix[ map[curr] ][ map[next] ]= matrix[ map[curr] ][ map[next] ] + 1;
						}
					}
				}

			links = [];
			max = 0;
			min = 0;
			for(i=0;i<matrix.length;i++){
				for(j=0;j<matrix[i].length;j++){
						if(matrix[i][j] != 0 && order[i] != order[j]){ //togli le reads una uguale all'altra, farebbero i loop sul nodo
						el = {"source":order[i], "target":order[j], "value": matrix[i][j],"strength":0.7}
						links.push(el);
						if(el.value > max){
							max = el.value;
						} else if (min == 0){
							min = el.value;
						} else if(el.value < min){
							min = el.value;
						}
					}
				}
			}
/*			console.log(min,max);
			console.log("links",links);
			console.log("nodesgen",nodesGeneral);
	*/					
			//div utilizzata da questo 
			var div = d3.select("#container").append("div").attr("id",name).attr("class","aux2");
			document.getElementById(name).style.width="70%";
			document.getElementById(name).style.height="49%";
			document.getElementById(name).style.float="left";
			//div utilizzata dall'altra funzione per visualizzare i dettagli
			name1 = "aux2";
			var h = document.getElementById(name).clientHeight;
			var w = document.getElementById(name).offsetWidth;
			    w = w;
				h = h; 

			var svg = d3.select("#"+name).append("svg")
						.attr("id", "svg"+name)
						.attr("width", w)
						.attr("height", h)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
			var legendRect = 10;
			var legendSpacing = 4;
			
			legend = svg.selectAll('.legend')                     // NEW
			  .data(["Ranger Camps","General gates","Entrances","Camping sites","Gates"])                                   // NEW
			  .enter()                                                // NEW
			  .append('g')                                            // NEW
			  .attr('class', 'legend')                    
			  .attr("transform", function(d,i){
				  var width = legendRect + legendSpacing;
				  var offset =  70;
				  var vert = i * (legendRect + offset -50) ;
				  var horz = -2 * legendRect - 70;
				  return "translate("+ (w - (w/4) - horz)+","+ (h - (h/2) - vert) +")";
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
			var simulation = d3.forceSimulation().nodes(nodesGeneral);
			simulation.force("charge_force", d3.forceManyBody())
						.force("center_force", d3.forceCenter(w / 3, h / 3));
			
			var color = d3.scaleLinear()
						.domain([min,max])      // usa questo per cambiare i colori alle linee
						.range(["lightgray","red"]);
			console.log(links);
			for(i=0;i<links.length;i++){
				for(j=i;j<links.length;j++){
					if((links[i].source == links[j].target) && (links[i].target == links[j].source)){
						links[i].value = links[i].value + links[j].value;
						links.splice(j,1);
					}
				}
			}
			var svgLinks = svg.append("g")
							.attr("class", "links")
							.selectAll("line")
							.data(links)
							.enter()
							.append("line")
							.style("stroke",function(d){return color(d.value)})
							.attr("stroke-width", 2)
							.style("z-index",-1)
							.on("mouseover", function(d) {		
									tool.transition()		
										.duration(200)		
										.style("opacity", .9)
										.style("left", (d3.event.pageX) + "px")		
										.style("top", (d3.event.pageY - 28) + "px")	
									tool.append("div").attr("id","t1").append("text").text("readings: " + d.value);
							;})			
							.on("mouseout", function(d) {		
									tool.transition()		
										.duration(500)		
										.style("opacity", 0);
									d3.selectAll("#t1").remove();
							})

			
			radius = 5;
			
			var node = svg.append("g")
						//	.attr("class", "nodes")
							.selectAll("circle")
							.data(nodesGeneral)
							.enter()
							.append("circle")
							.attr("r", radius)
							.attr("fill", function(d){if ((d.label).indexOf("ranger") > -1) {
												return "#a6cee3";   //ranger azzurro 
											} else if ((d.label).indexOf("general-gate") > -1) {
												return "#1f78b4"; // general gate blu
											} else if ((d.label).indexOf("entrance") > -1){
												return "#b2df8a";  //verdino entrance
											} else if ((d.label).indexOf("camping") > -1){
												return "#33a02c"; //verde camping
											} else { 
												return "#fb9a99"; //rosa gates 
											}})
							.on("mouseover", function(d) {		
									tool.transition()		
										.duration(200)		
										.style("opacity", .9)
										.style("left", (d3.event.pageX) + "px")		
										.style("top", (d3.event.pageY - 28) + "px")	
									tool.append("div").attr("id","t1").append("text").text(d.label);
									tool.append("div").attr("id","t1").append("text").text("readings: " + d.value);
							;})			
							.on("mouseout", function(d) {		
									tool.transition()		
										.duration(500)		
										.style("opacity", 0);
									d3.selectAll("#t1").remove();
							})
							.on("click",function(d){console.log(d);});

			
			simulation.on("tick", tickActions );
		
			var link_force =  d3.forceLink(links)
                        .id(function(d) {return d.label; })
						
			simulation.force("links",link_force)
		
		function tickActions() {
				//update circle positions to reflect node updates on each tick of the simulation 
				node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(w - radius, d.x)); })
					.attr("cy", function(d) { return d.y = Math.max(radius, Math.min(h -radius, d.y)); });

					
				 svgLinks.attr("x1", function(d){return d.source.x; })
						.attr("y1", function(d) { return d.source.y; })
						.attr("x2", function(d) { return d.target.x; })
						.attr("y2", function(d) { return d.target.y; });

			}
			  
			var drag_handler = d3.drag()
				.on("start", drag_start)
				.on("drag", drag_drag)
				.on("end", drag_end);
				
			function drag_start(d) {
				  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
				  d.fx = d.x;
				  d.fy = d.y;
				}
				 
			function drag_drag(d) {
				  d.fx = d3.event.x;
				  d.fy = d3.event.y;
				}
				 
			function drag_end(d) {
			  if (!d3.event.active) simulation.alphaTarget(0);
			  d.fx = d.x;
			  d.fy = d.y;
			}

			drag_handler(node);

			var tool = d3.select("body").append("div")	
						.attr("class", "tooltip")				
						.style("opacity", 0);
			
			showInfo(name1,base,"Vehicle Types");
})
}

function showInfo(name,data,filter){
		var div1 = d3.select("#container").append("div").attr("id",name).attr("class","aux2");
		div1.style("margin-left",0);
		document.getElementById(name1).style.width="29%";
		document.getElementById(name1).style.height="49%";
		document.getElementById(name1).style.float="right";
		var h = document.getElementById(name).clientHeight;
		var w = document.getElementById(name).offsetWidth;
		    w = w - margin.right;
			h = h - margin.top; 
		
		var svg = d3.select("#"+name).append("svg")
					.attr("id", "svg"+name)
					.attr("width", w)
					.attr("height", h)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var general = d3.nest()
					.key(function(d){return d['car-type'];})
					.entries(data)
					.sort(function(a, b){ return d3.descending(a.values, b.values);});
					
		arr = [];
		for(i=0;i<general.length;i++){
			arr.push([general[i].key,general[i].values.length]);
		}
		arr.sort(sortFunction);
		function sortFunction(a, b) {
			if (a[1] === b[1]) {
				return 0;
			}
			else {
				return (a[1] > b[1]) ? -1 : 1;
			}
		}
		//console.log(arr);
			var c = bb.generate({
					  data: {
						columns: [[arr[0][0],arr[0][1],0,0,0,0,0,0],[arr[1][0],0,arr[1][1],0,0,0,0,0],[arr[2][0],0,0,arr[2][1],0,0,0,0],[arr[3][0],0,0,0,arr[3][1],0,0,0],
						[arr[4][0],0,0,0,0,arr[4][1],0,0],[arr[5][0],0,0,0,0,0,arr[5][1],0],[arr[6][0],0,0,0,0,0,0,arr[6][1]]],
						type: "bar",
						groups: [[arr[0][0],arr[1][0],arr[2][0],arr[3][0],arr[4][0],arr[5][0],arr[6][0]]], //fallo automaticamente seguyendo l'ordine di chi ha più traffico?
					  color:function(d) {return "steelblue";},			

						},
					  legend:{
						show: false,  
					  },
					  tooltip: {
						  show: false,
					  },
					   axis: {
							x: {
							  type: "category",
						    categories: [arr[0][0],arr[1][0],arr[2][0],arr[3][0],arr[4][0],arr[5][0],arr[6][0]]
							},
						}, 
						bar: {
							width: {
							  ratio: 0.75,
							}
						  },
						title: {text: "Vehicle types in selected time period",
											 padding: {
												 top: 10,
												 bottom: 10,
											 },
											 position: "top-center"
										 },
					  bindto: "#svg"+name
					});

		}


