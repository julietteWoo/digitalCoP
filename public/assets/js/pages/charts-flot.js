//------------- charts-flot.js -------------//
$(document).ready(function() {

	//------------- Sparklines in header stats -------------//
	$('#spark-visitors').sparkline([5,8,10,8,7,12,11,6,13,8,5,8,10,11,7,12,11,6,13,8], {
		type: 'bar',
		width: '100%',
		height: '20px',
		barColor: '#dfe2e7',
		zeroAxis: false,
	});

	$('#spark-templateviews').sparkline([12,11,6,13,8,5,8,10,12,11,6,13,8,5,8,10,12,11,6,13,8,5,8], {
		type: 'bar',
		width: '100%',
		height: '20px',
		barColor: '#dfe2e7',
		zeroAxis: false,
	});

	$('#spark-sales').sparkline([19,18,20,17,20,18,22,24,23,19,18,20,17,20,18,22,24,23,19,18,20,17], {
		type: 'bar',
		width: '100%',
		height: '20px',
		barColor: '#dfe2e7',
		zeroAxis: false,
	});

	//------------- Flot charts -------------//

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

	var coloursByIndex = ['#bac3d2','#43aea8','#60b1cc','#df6a78','#cfa448','#e8ecf1','#777777','#bfbfbf'];

	//convert the object to array for flot use
	var chartColoursArr = Object.keys(chartColours).map(function (key) {return chartColours[key]});

	//generate random number for charts
	randNum = function(){
		//return Math.floor(Math.random()*101);
		return (Math.floor( Math.random()* (1+40-20) ) ) + 20;
	}

	//get Data
	pieChartData=function(type){
		var data=$(type).text();
		data=data.split('|');
		return data;
	}

	//------------- Bars chart -------------//
	$(function () {	
    	var month=chartData("#bar_month_last");
    	var dataFree=chartData("#bar_free_last");
    	var dataNotFree=chartData("#bar_notfree_last");
    	var d1 = [];
    	var d2 = [];
    	month.forEach(function(item,index){
    		d1.push([item,parseInt(dataFree[index])]);
    		d2.push([item,parseInt(dataNotFree[index])]);
    	});

    	var options = {
    		series : {
				stack: true
			},
			bars: {
				show:true,
				barWidth: 0.5,
				fill:1,
				align: "center"
			},
			grid: {
				show:true,
				hoverable: true,
				borderWidth: 0,
			    borderColor:null
			},
	        colors: chartColoursArr,
	        tooltip: true, //activate tooltip
			tooltipOpts: {
				content: "$%y.0",
				shifts: {
					x: -30,
					y: -50
				}
			},
			yaxis: {
				tickLength: 0,
				show:false
			},
			xaxis: { 
	        	mode: "categories",
				tickLength: 0
	        }
		};
		 
		$.plot($("#bars-chart"), [d1, d2], options);
	});

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
				content: "%s : %y.1"+"%",
				shifts: {
					x: -30,
					y: -50
				},
				theme: 'dark',
				defaultTheme: false
			}
		};
		var dataName=chartData("#pie_type");
		var dataValue=chartData("#pie_type_value");
		var data = [];
		dataName.forEach(function(item,index){
			data.push({ label: item,  data: dataValue[index], color: coloursByIndex[index]});
		});
	    $.plot($("#pie-chart"), data, options);

	});

	//------------- Donut chart -------------//
	$(function () {
		var options = {
			series: {
				pie: { 
					show: true,
					innerRadius: 0.55,
					highlight: {
						opacity: 0.1
					},
					radius: 1,
					stroke: {
						width: 10
					},
					startAngle: 2.15
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
				content: "%s : %y.1"+"%",
				shifts: {
					x: -30,
					y: -50
				},
				theme: 'dark',
				defaultTheme: false
			}
		};
		var dataName=chartData("#pie_age");
		var dataValue=chartData("#pie_age_value");
		var data = [];
		dataName.forEach(function(item,index){
			data.push({ label: item,  data: dataValue[index], color: coloursByIndex[index]});
		});
	    $.plot($("#donut-chart"), data, options);

	});
	
});