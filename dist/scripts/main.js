var mwb={};mwb.options={previewModulo:3,colorScale:"category10"},$(function(){"use strict";$('[data-toggle="tooltip"]').tooltip(),mwb.resetAll(),$("#reset").on("click",function(t){return t.preventDefault(),mwb.resetAll(),!1}),$("#startBenchmark").on("click",function(t){return t.preventDefault(),mwb.getOptions(),mwb.benchmarkPage(mwb.options.pageName),!1})}),mwb.resetAll=function(){"use strict";mwb.resetIteration(),mwb.benchmarks=[],mwb.benchmark=0,mwb.dataArray=[],mwb.dataObject=[],mwb.analysisObject={},mwb.getOptions(),$("#messages").html(""),$("#bar-chart").html('<div class="chart-description">BAR CHART</div>'),$("#boxplot-chart").html('<div class="chart-description">BOXPLOT CHART</div>'),$("#data-tbody").html("")},mwb.resetIteration=function(){"use strict";mwb.warningSent=!1,mwb.timer=0,mwb.currentIteration=0,mwb.totalIterations=0,$("#lastBenchmark").text(""),$("#progress-bar").attr("aria-valuenow",0).css("width","0%").text("")},mwb.getOptions=function(){"use strict";mwb.options.mediaWikiUrl=$("#mediaWikiUrl").val().trim(),mwb.options.pageName=$("#pageName").val().trim(),mwb.options.jobQueue=[],mwb.options.note=$("#note").val().trim(),mwb.options.iterations=parseInt($("#iterations").val().trim(),10),mwb.options.minRandom=parseInt($("#minRandom").val().trim(),10),mwb.options.maxRandom=parseInt($("#maxRandom").val().trim(),10),mwb.options.barChartHeight=parseInt($("#barChartHeight").val().trim(),10),mwb.options.boxPlotHeight=parseInt($("#boxPlotHeight").val().trim(),10),mwb.options.pageName.indexOf(";")>-1&&(mwb.options.jobQueue=mwb.options.pageName.split(";"),mwb.options.pageName=mwb.options.jobQueue.shift(),mwb.options.pageName=mwb.options.pageName.trim())},mwb.benchmarkPage=function(t){"use strict";console.log("Benchmarking: "+t),mwb.resetIteration(),mwb.startTime=(new Date).getTime(),mwb.analysisObject.benchmarkStartUnix=Math.floor((new Date).getTime()/1e3),mwb.analysisObject.benchmarkStartFormatted=mwb.getFormattedTime(),mwb.timer=0,mwb.totalIterations=mwb.options.iterations,mwb.benchmark+=1,mwb.currentTitle="#"+mwb.benchmark+" "+t,mwb.options.note&&(mwb.currentTitle+=" ("+mwb.options.note+")"),mwb.benchmarks.push(mwb.currentTitle),mwb.dataArray[mwb.benchmark-1]=[mwb.currentTitle];for(var e=0;e<mwb.totalIterations;e++)setTimeout(function(){mwb.fetchPage(t,mwb.onPageFetch)},mwb.timer),mwb.timer+=Math.floor(Math.random()*(mwb.options.maxRandom-mwb.options.minRandom)+mwb.options.minRandom)},mwb.fetchPage=function(t,e){"use strict";var a=(new Date).getTime(),r=$.getJSON(mwb.options.mediaWikiUrl+"?callback=?",{action:"parse",page:t,format:"json"});r.done(function(t){var r=(new Date).getTime()-a;return t.error?(mwb.log('<strong>MediaWiki API:</strong> "'+t.error.code+'" - '+t.error.info+" (See Console)"),console.error(t),e(t.error,!1,r)):e(!1,t,r)}),r.fail(function(t){var r=(new Date).getTime()-a;return console.error(t),mwb.log('<strong>AJAX Request:</strong> Status "'+t.status+'" - '+t.statusText+" (See Console)"),e(t,!1,r)})},mwb.onPageFetch=function(t,e,a){"use strict";if(!t){console.log("Iteration "+mwb.currentIteration+" in "+a+"ms"),$("#lastBenchmark").text("("+a+"ms)"),mwb.dataArray[mwb.benchmark-1].push(a),mwb.dataObject.push({benchmark:mwb.currentTitle,benchmarkCounter:mwb.benchmark,run:mwb.currentIteration+1,timestamp:Math.floor((new Date).getTime()/1e3),time:a}),mwb.currentIteration+=1;var r=Math.round(mwb.currentIteration/mwb.totalIterations*100);if($("#progress-bar").attr("aria-valuenow",r).css("width",r+"%").text(r+"% ("+a+"ms)"),a>mwb.options.minRandom&&!mwb.warningSent){var o="Warning: The MediaWiki API is responding slower than the minimum random time interval.<br>";o+='This may lead to stacked up / queued HTTP requests. See <a href="https://github.com/Fannon/MediaWiki-Benchmarker#known-problems" target="_blank">Known Problems</a>.<br>',o+="To avoid this increase the Minimum Random Intervall so that it is higher than the expected Response time.",mwb.log(o),mwb.warningSent=!0}if(mwb.currentIteration===mwb.totalIterations){var n=(new Date).getTime()-mwb.startTime;mwb.drawChart(),mwb.drawData(),console.log("Completed Benchmark in "+n+"ms on "+mwb.currentTitle),mwb.options.jobQueue[0]&&(console.log("Job Queue detected! "+mwb.options.jobQueue.length+" to go!"),mwb.options.pageName=mwb.options.jobQueue.shift(),mwb.options.pageName=mwb.options.pageName.trim(),mwb.benchmarkPage(mwb.options.pageName))}else mwb.currentIteration%mwb.options.previewModulo===0&&mwb.drawChart()}},mwb.purgePage=function(t,e,a){"use strict";return setTimeout(function(){var a=(new Date).getTime();$.post(mwb.options.mediaWikiUrl+"/api.php?callback=?",{action:"purge",page:t,format:"json"},function(r){if(r.error)return mwb.log('API ERROR: "'+r.error.code+'" - '+r.error.info),console.dir(r),!1;var o=(new Date).getTime(),n=o-a;return console.info("["+e+"] Page "+t+" purged in "+n+"ms."),!0})},a),!0},mwb.drawChart=function(){"use strict";console.log("Drawing Charts"),$("#bar-chart").html(""),$("#boxplot-chart").html(""),mwb.barChart=d3plus.viz().container("#bar-chart").data(mwb.dataObject).type("bar").id("run").x({value:"benchmark",label:!1,grid:!1,axis:!1,scale:"discrete"}).y("time").height(mwb.options.barChartHeight).color({value:"benchmark",scale:mwb.options.colorScale}).legend(!1).text(function(t){return t.benchmark+" ("+t.run+")"}).tooltip(["benchmark","run","time"]).timing({transitions:0}).draw(),mwb.boxPlotChart=d3plus.viz().container("#boxplot-chart").data(mwb.dataObject).type("box").id("run").x({value:"benchmark",label:!1,grid:!1,axis:!1,scale:"discrete"}).y("time").height(mwb.options.boxPlotHeight).color({value:"benchmark",scale:mwb.options.colorScale}).legend(!1).tooltip({children:!1}).timing({transitions:0}).draw()},mwb.drawData=function(){"use strict";console.log("Analyzing Data");for(var t="",e=0;e<mwb.dataArray.length;e++){var a=JSON.parse(JSON.stringify(mwb.dataArray[e])),r=a.shift(),o=a.reduce(function(t,e){return t+e}),n={avg:Math.round(o/a.length*100)/100,min:Math.min.apply(Math,a),max:Math.max.apply(Math,a)};mwb.analysisObject[r]=n,t+="<tr><td>"+r+"</td>",t+="<td>"+n.avg+"</td>",t+="<td>"+n.min+"</td>",t+="<td>"+n.max+"</td></tr>"}$("#data-tbody").html(t);var i=$("#jsonExport");i.removeAttr("disabled");var m={array:mwb.dataArray,object:mwb.dataObject,analysis:mwb.analysisObject,options:mwb.options};i.attr("href","data:text/json;base64,"+btoa(JSON.stringify(m,!1,4))),i.attr("download",mwb.getFormattedTime()+".json");var s=$("#csvExport");s.attr("href","data:text/csv;base64,"+btoa(mwb.convertToCSV(mwb.dataArray))),s.attr("download",mwb.getFormattedTime()+".csv"),s.removeAttr("disabled");var b=$("#svgExportBarChart");setTimeout(function(){b.attr("href","data:text/svg;base64,"+btoa($("#bar-chart svg").prop("outerHTML"))),b.attr("download",mwb.getFormattedTime()+"_BarChart.svg"),b.removeAttr("disabled")},200);var w=$("#svgExportBoxPlotChart");setTimeout(function(){w.attr("href","data:text/svg;base64,"+btoa($("#boxplot-chart svg").prop("outerHTML"))),w.attr("download",mwb.getFormattedTime()+"_BoxPlot.svg"),w.removeAttr("disabled")},200)},mwb.log=function(t){"use strict";var e=new Date,a=mwb.pad(e.getHours())+":"+mwb.pad(e.getMinutes())+":"+mwb.pad(e.getSeconds()),r='<div class="alert alert-warning alert-dismissible" role="alert">';r+='<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>',r+="["+a+"] "+t+"</div>",$("#messages").append(r),$(".alert").alert()},mwb.convertToCSV=function(t){"use strict";for(var e="object"!=typeof t?JSON.parse(t):t,a="",r=0;r<e.length;r++){var o="";for(var n in e[r])e[r].hasOwnProperty(n)&&(""!==o&&(o+=";"),o+=e[r][n]);a+=o+"\r\n"}return a},mwb.pad=function(t){"use strict";return 10>t?"0"+t:t},mwb.getFormattedTime=function(){"use strict";var t=new Date,e=t.getFullYear(),a=mwb.pad(t.getMonth()+1),r=mwb.pad(t.getDate()),o=mwb.pad(t.getHours()),n=mwb.pad(t.getMinutes()),i=mwb.pad(t.getSeconds());return e+"-"+a+"-"+r+"_-_"+o+":"+n+":"+i};