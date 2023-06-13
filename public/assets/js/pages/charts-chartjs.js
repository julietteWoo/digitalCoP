//------------- chart-chartjs.js -------------//
$(document).ready(function() {
	//------------- Chartjs -------------//

	//get Data
	chartData=function(type){
		var data=$(type).text();
		data=data.split('|');
		return data;
	}
	
	var coloursByIndex = ['#bac3d2','#43aea8','#60b1cc','#df6a78','#cfa448','#e8ecf1','#777777','#bfbfbf'];
	
	//------------- Bar chart  -------------//
	var barChartData = {
		labels : chartData("#bar_items"),
		datasets : [
			{
				fillColor : "rgba(186,195,210,0.5)",
				strokeColor : "rgba(186,195,210,0.3)",
				highlightFill: "rgba(186,195,210,0.75)",
				highlightStroke: "rgba(186,195,210,1)",
				data : chartData("#bar_values")
			}
		]
	}

	var ctxBar = document.getElementById("bar-chartjs").getContext("2d");
	myBar = new Chart(ctxBar).Bar(barChartData, {
		responsive : true,
		scaleShowGridLines : true,
    	scaleGridLineColor : "#bfbfbf",
    	scaleGridLineWidth : 0.2,
    	//bar options
    	barShowStroke : true,
    	barStrokeWidth : 2,
    	barValueSpacing : 5,
    	barDatasetSpacing : 2,
    	//animations
    	animation: true,
    	animationSteps: 60,
    	animationEasing: "easeOutQuart",
    	//scale
    	showScale: true,
    	scaleFontFamily: "'Roboto'",
    	scaleFontSize: 13,
    	scaleFontStyle: "normal",
    	scaleFontColor: "#333",
    	scaleBeginAtZero : true,
    	//tooltips
    	showTooltips: true,
    	tooltipFillColor: "#344154",
    	tooltipFontFamily: "'Roboto'",
    	tooltipFontSize: 13,
    	tooltipFontColor: "#fff",
    	tooltipYPadding: 8,
    	tooltipXPadding: 10,
    	tooltipCornerRadius: 2,
    	tooltipTitleFontFamily: "'Roboto'",
	});

	//------------- Morris charts parameters-------------//
	//define chart colours first
	var chartColours = {
		gray: '#bac3d2',
		teal: '#43aea8',
		blue: '#60b1cc',
		red: '#df6a78',
		orange: '#cfa448',
		gray_lighter: '#e8ecf1',
		gray_light: '#777777',
		gridColor: '#bfbfbf'
	}

	//convert the object to array for flot use
	var chartColoursArr = Object.keys(chartColours).map(function (key) {return chartColours[key]});

	
	//------------- Pie chart -------------//

	$(function () {
		var options = {
			series: {
				pie: { 
					show: true,
					innerRadius: 0,
					radius: 'auto',
					highlight: {
						opacity: 0.1
					},
					stroke: {
						width: 2,
					}
				}					
			},
			legend:{
				show:false,
				labelFormatter: function(label, series) {
				    return '<div style="font-weight:bold;font-size:13px;">&nbsp;'+ label +'</div>'
				},
				labelBoxBorderColor: null,
				margin: 50,
				width: 20,
				padding: 1
			},
			grid: {
	            hoverable: true,
	            clickable: true,
	        },
	        tooltip: true, //activate tooltip
			tooltipOpts: {
				content: "%s",
				shifts: {
					x: -30,
					y: -50
				},
				theme: 'dark',
				defaultTheme: false
			}
		};


		var dataName = chartData("#pie_type");
		var dataValue = chartData("#pie_type_value");
		var data = [];
		dataName.forEach(function(item,index){
			data.push({ label: item,  data: dataValue[index], color: coloursByIndex[index]});
		});
	    $.plot($("#pie-chart"), data, options);

	});

	//------------- Morris Donut chart -------------//
	var overall = chartData("#dounut_items");
	var overallValue = chartData("#dounut_items_value");
	var overallData = [];
	overall.forEach(function(item,index){
		overallData.push({value: overallValue[index],label:item})
	});

	var arts = chartData("#dounut_arts");
	var artsValue = chartData("#dounut_arts_value");
	var artsData = [];
	arts.forEach(function(item,index){
		artsData.push({value: artsValue[index],label:item})
	});

	var stem = chartData("#dounut_stem");
	var stemValue = chartData("#dounut_stem_value");
	var stemData = [];
	stem.forEach(function(item,index){
		stemData.push({value: stemValue[index],label:item})
	});

	Morris.Donut({
		element: 'morris-donut',
		data: overallData,
		formatter: function (x) { return x + "%"},
		colors: chartColoursArr,
		resize: true
	});
	

	//------------- Donut chart -------------//
	Morris.Donut({
		element: 'morris-donut-arts',
		data: artsData,
		formatter: function (x) { return x + "%"},
		colors: chartColoursArr,
		resize: true
	});


	//------------- Donut chart -------------//
	Morris.Donut({
		element: 'morris-donut-stem',
		data: stemData,
		formatter: function (x) { return x + "%"},
		colors: chartColoursArr,
		resize: true
	});
			
});