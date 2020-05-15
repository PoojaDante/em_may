var monthAbbreviationMap = {
    Jan: 'January',
    Feb: 'February',
    Mar: 'March',
    Apr: 'April',
    May: 'May',
    Jun: 'June',
    Jul: 'July',
    Aug: 'August',
    Sep: 'September',
    Oct: 'October',
    Nov: 'November',
    Dec: 'December'
}

window.pointRadius = 1;
window.pointHoverRadius = 3;
$(function(){
    document.body.onresize = function(){
        if(window.innerWidth <= 780) {
            window.canvasRightPadding = 30;
        } else {
            window.canvasRightPadding = 80;
        }
        renderUI(window.resData);
    };
    $("#currentFilter").text();
    if(window.innerWidth <= 780) {
        window.canvasRightPadding = 50;
    } else {
        window.canvasRightPadding = 80;
    }
    window.sliderToJsonDataGap = 16;
    //window.monthValues = ["Dec-17", "Jan-18", "Feb-18", "Mar-18", "Apr-18", "May-18", "Jun-18", "Jul-18", "Aug-18", "Sep-18", "Oct-18", "Nov-18", "Dec-18", "Jan-19", "Feb-19", "Mar-19", "Apr-19", "May-19", "Jun-19", "Jul-19", "Aug-19", "Sep-19","Oct-19","Nov-19","Dec-19","Jan-20","Feb-20","Mar-20"];
    window.monthValues = ["Apr-19", "May-19", "Jun-19", "Jul-19", "Aug-19", "Sep-19","Oct-19","Nov-19","Dec-19","Jan-20","Feb-20","Mar-20"];
    $("#slider1").attr('min', 0);
    $("#slider1").attr('max', monthValues.length -1);
    $("#slider1").val(monthValues.length-1); 
    $('input[type="range"]').rangeslider({polyfill: false});
    $('#sliderLabel').text(monthValues[$("#slider1").val()].split("-").join(" "));
    $('#slider1').change(function() {
        $('#sliderLabel').text(monthValues[this.value].split("-").join(" "));
        renderUI(window.resData);
    });

    fetch('./data/countries_data.json').then(function(res){
        return res.json();
    }).then(function(resData){
        renderUI(resData)
    });
})

function renderUI(resData) {
    $("#rows").html(null);
    var sliderVal = parseInt($("#slider1").val());
//    var monthForCummulating = window.monthValues.slice(0, sliderVal+1);
    var monthToCheck = window.monthValues[sliderVal]
    window.resData = resData.map(function(obj){
        obj.current_composite_index_score = obj.composite_index_score[monthToCheck];
        return obj;
    })
    window.resData = window.resData.sort(function(a,b){
        return b.current_composite_index_score - a.current_composite_index_score
    });
    window.resData.forEach(function(obj){
        var row = document.createElement('div');
        row.setAttribute('class','row');

        var col = document.createElement('div');
        col.setAttribute('class', 'col-7')
        row.append(col);

        var flagRow = document.createElement('div');
        flagRow.setAttribute('class','row h-100');


        var countryImageCol = document.createElement('div');
        countryImageCol.setAttribute('class','col-4');
        var img = document.createElement('img');
        img.setAttribute('class', 'verticalAlign');
        img.setAttribute('id', 'countryImage');
        img.src = obj.flag_url;
        countryImageCol.append(img);
        flagRow.append(countryImageCol);

        var nameFlagCol = document.createElement('div');
        nameFlagCol.setAttribute('class','col-3 text-center');
        var name = document.createElement('p');
        name.innerText = obj.name;
        if (obj.name.toLowerCase() === 'india') {
            name.style.fontWeight = '900';
        }
        name.setAttribute('class', 'nameAndScore');
        nameFlagCol.append(name);
        flagRow.append(nameFlagCol);
        col.append(flagRow);

        var compositeScoreDiv = document.createElement('div');
        compositeScoreDiv.setAttribute('class','col-5 text-center');
        var score = document.createElement('p');
        if (obj.name.toLowerCase() === 'india') {
            score.style.fontWeight = '900';
        }
        score.innerText = obj.current_composite_index_score;
        compositeScoreDiv.append(score);
        score.setAttribute('class', 'nameAndScore');
        flagRow.append(compositeScoreDiv);

        var dataDiv = document.createElement('div');
        dataDiv.setAttribute('class','col-5');

        var countryCanvas = document.createElement('canvas');
        countryCanvas.setAttribute('id', obj.name.toLowerCase()+'_canvas');

        var lastValue = document.createElement('span');
        lastValue.setAttribute('class', 'lastValue');
        lastValue.setAttribute('id', obj.name.toLowerCase() + '_lastValue')
        var countryCanvasContainer = document.createElement('div');
        countryCanvasContainer.append(countryCanvas);
        dataDiv.append(countryCanvasContainer);
        dataDiv.append(lastValue)
        var leftDataDiv = document.createElement('div');
        leftDataDiv.setAttribute('class','col-1'); 
        //row.append(leftDataDiv);
        row.append(dataDiv);

        $("#rows").append(row);
    })

        //<h3>In <i id="currentMonth">October</i>, while the <b id="topCountry">Philippines</b> topped the list, <b id="secondCountry">India</b> came in at <b>No. 2</b> and <span id="lastCountry">Turkey</span> last, based on a composite score of all the indicators.</h3>
    var indiasPosition = 0;
    var countryToBgColor = [];

    window.resData.forEach((obj, index)=>{
        if (obj.name.toLowerCase() === 'india') {
            indiasPosition = index +1
        }
        var labels = []
        var canvasData = obj.datasets[window.currentKey].map(function(obj){
            labels.push(obj.timestamp)
            return {
                t: obj.timestamp,
                y: parseFloat(obj.data)
            }
        });
        var sliderVal = parseInt($("#slider1").val());
        var trimmedCanvasData = canvasData.slice(0,parseInt(sliderVal)+window.sliderToJsonDataGap + 1)
        countryToBgColor.push({
            name: obj.name,
            score: trimmedCanvasData[trimmedCanvasData.length - 1].y
        })
    });

    if (indiasPosition === 1) {
        $("#indiaNotAtTop").css('display', 'none');
        $("#indiaAtTop").css('display', 'block');
        $("#indiaAtTop #currentMonth").text(monthAbbreviationMap[monthValues[$("#slider1").val()].split('-')[0]])
        $("#indiaAtTop #lastCountry").text(window.resData[window.resData.length-1].name)
    } else {
        $("#indiaNotAtTop").css('display', 'block');
        $("#indiaAtTop").css('display', 'none');
        $("#indiaNotAtTop #currentMonth").text(monthAbbreviationMap[monthValues[$("#slider1").val()].split('-')[0]])
        $("#indiaNotAtTop #topCountry").text(window.resData[0].name);
        $("#indiaNotAtTop #indiaPosition").text("No. "+indiasPosition)
        $("#indiaNotAtTop #lastCountry").text(window.resData[window.resData.length-1].name)
    }

    countryToBgColor = countryToBgColor.sort(function(a,b){
        return (a.score > b.score ? -1 : 1)
    }).map(function(obj, i){
        if (window.currentKey === 'cpi_inflation') {
            if (i<=2) {
                obj.color = "#D98569"
            } else if ( i>=3 && i<=6) {
                obj.color = "#F8D88D"
            } else {
                obj.color = "#BFC99B"
            }
        } else {
            if (i<=2) {
                obj.color = "#BFC99B"
            } else if ( i>=3 && i<=6) {
                obj.color = "#F8D88D"
            } else {
                obj.color = "#D98569"
            }
        }
        return obj
    });

    window.resData.forEach(function(countryData){
        var labels = []
        var canvasData = countryData.datasets[window.currentKey].map(function(obj){
            labels.push(obj.timestamp)
            return {
                t: obj.timestamp,
                y: parseFloat(obj.data)
            }
        });
        var bgColor = countryToBgColor.find(function(obj){
            if (obj.name === countryData.name) {
                return true
            }
        }).color;

        var sliderVal = parseInt($("#slider1").val());
        var trimmedCanvasData = canvasData.slice(0,parseInt(sliderVal)+window.sliderToJsonDataGap + 1)
        $("#"+countryData.name.toLowerCase() + "_lastValue").text(trimmedCanvasData[trimmedCanvasData.length - 1].y)
        renderCanvas(countryData.name.toLowerCase()+'_canvas', trimmedCanvasData, labels.slice(0,parseInt(sliderVal)+window.sliderToJsonDataGap + 1), bgColor, 2);
    })
}
window.currentKey = 'real_gdp_growth';
function changeCanvas(event, key, label) {
    $(".action-btns").removeClass('selected');
    $(event.target).addClass('selected');
    $("#currentFilter").text(label)
    window.currentKey = key;
    renderUI(window.resData)
}

function renderCanvas (canvasId, dataset, labels, backgroundColor, inde) {
    var parentNode = document.getElementById(canvasId).parentNode;
    document.getElementById(canvasId).parentNode.innerHTML = null;
    var newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('id', canvasId);
    parentNode.append(newCanvas);
    var ctx = document.getElementById(canvasId).getContext('2d');
    document.getElementById(canvasId).style.backgroundColor = backgroundColor;
    var maxValue = 0;
    dataset.forEach(function(obj){
        if (parseFloat(obj.y) > maxValue) {
            maxValue = parseFloat(obj.y)
        }
    });

    new Chart(ctx, {
      type: 'line',
      axisY:{
        minimum: 50,
        maximum: 50
      },
      data: {
        labels: labels,
        datasets: [
        {
          fill: false,
          data: dataset,
          backgroundColor: 'black',
          borderColor: 'black',
          pointRadius: window.pointRadius,
          pointHoverRadius: window.pointHoverRadius
        }]
      },
      options: {
        tooltips: {
             enabled: false
        },
        layout: {
            padding: {
                right: window.canvasRightPadding,
                left: 10
            }
        },
        legend: {
            display: false,
        },
        
        scales: {
            xAxes: [{
                gridLines: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    display: false
                }
            }],
            yAxes: [{
                gridLines: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    suggestedMax: maxValue+2,
                    beginAtZero: true,
                    display: false
                }
            }]
        }
      }
    });
}