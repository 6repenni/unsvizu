'use strict';

let worker;
let N_SAMPLES;
let SAMPLE_DATA;
let LABEL_DATA;
let svg;
let sampleNames;
let sampleColors;
let sampleLabels;


function createWorker(){
    if(typeof(Worker) !== "undefined") {
        if (typeof (worker) == "undefined") {
            worker = new Worker('js/tsneExample.js');
        }
    }
}

/*Gets triggered when a redraw is required because of new data set*/
function redraw(retData){
    console.log("inside redraw");
    console.log(retData);
    SAMPLE_DATA = createBetterJson(_.keys(retData.data.vectors), _.values(retData.data.vectors));
    LABEL_DATA = createSplitJSON(_.keys(retData.data.vectors), _.values(retData.data.vectors));
    draw(N_SAMPLES);
}

/*initiate the tooltip to have easy mouseover later on*/
let tooltip = d3.select("body")
    .append("div")
    .attr("class", "mouse-tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("Tooltip");

/*creates canvas, initiates worker*/
function init () {
        listRepos();
        createWorker();
        svg = d3.select("#embedding-space")
            .append("svg")
            .attr("width", 960)
            .attr("height", 900)
            .call(responsivefy)
            .append("g");

        worker.onmessage = function (e) {
            let msg = e.data;
            switch (msg.type) {
                case 'PROGRESS_STATUS':
                    $('#progress-status').text(msg.data);
                    break;
                case 'PROGRESS_ITER':
                    $('#progress-iter').text(msg.data[0] + 1);
                    $('#progress-error').text(msg.data[1].toPrecision(7));
                    $('#progress-gradnorm').text(msg.data[2].toPrecision(5));
                    break;
                case 'PROGRESS_DATA':
                    drawUpdate(msg.data);
                    break;
                case 'STATUS':
                    if (msg.data === 'READY') {
                        $('#run-button').bind('click', run);
                    } else {
                        $('#run-button').unbind('click', run);
                    }
                    break;
                case 'DONE':
                    drawUpdate(msg.data);
                    $('#stop-button').unbind('click', stop);
                    break;
                case 'RUN':
                    $('#stop-button').bind('click', stop);
                    break;
                default:
            }
        }
    N_SAMPLES = parseInt($('#param-nsamples').val(), 10);
    draw(N_SAMPLES);
}


function sliceSamples(sampledata){
    for (let property in sampledata) {
        if (sampledata.hasOwnProperty(property)) {
            sampledata.property
        }
    }
}

/*initially called draw function. holds all ui functions*/
function draw (num) {
    /*_draw is called when data is loaded successfully*/
    function _draw(samples) {
        $('g').empty();
        let sampleData = samples.data.slice(0, num);
        sampleNames = samples.name.slice(0, num);
        sampleColors = samples.color.slice(0, num);
        sampleLabels = samples.labels.slice(0, num);

        /*let sampleData = samples.slice(0,num);*/

        worker.postMessage({
            type: 'INPUT_DATA',
            data: samples.data.slice(0,num)
        });

        let xScale = d3.scaleLinear()
            .domain([d3.min(sampleData, function(d) { return d[0]; })-0.05, d3.max(sampleData, function(d) { return d[0]; })+0.05])
            .range([0, 960]);
        let yScale = d3.scaleLinear()
            .domain([d3.min(sampleData, function(d) { return d[1]; })-0.05,d3.max(sampleData, function(d) { return d[1]; })+0.05])
            .range([0, 900]);

        svg.selectAll("circle")
            .data(sampleData)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d[0]);
            })
            .attr("cy", function(d) {
                return yScale(d[1]);
            })
            .attr("r", 5);

        //Färben nach Name des Sprechers
        svg.selectAll("circle")
            .data(sampleColors)
            .attr("fill", function (d) {
                return d3.rgb("#" + d);
            });

        //Mouseover Tooltip
        svg.selectAll("circle")
            .data(sampleNames)
            .on("mouseover", function(d){d3.select(this).attr('r', 10); return tooltip.style("visibility", "visible").text(d);})
            .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){d3.select(this).attr('r', 5); return tooltip.style("visibility", "hidden");});

        svg.selectAll("circle")
            .data(sampleLabels)
            .on( "click", function( d, i) {
                var e = d3.event,
                    g = this.parentNode,
                    isSelected = d3.select( g).classed( "selected");

                if( !e.ctrlKey) {
                    d3.selectAll( 'g.selected').classed( "selected", false);
                }

                d3.select( g).classed( "selected", !isSelected);

                // reappend dragged element as last
                // so that its stays on top
                g.parentNode.appendChild( g);
            })
        // On Click Tooltip (Left Menu)
        svg.selectAll("circle")
            .data(sampleLabels)
            .style('stroke', 'none')
            .on("click", function(d) {
                d3.selectAll("#tooltip").classed("hidden", true);
                if($('#tooltip').hasClass("hidden")){
                //Get this bar's x/y values, then augment for the tooltip
                let xPosition = parseFloat(d3.select(this).attr("cx")) + xScale / 2;
                let yPosition = parseFloat(d3.select(this).attr("cy")) ;
                //required because of the json format received from API
                let splittedLabel = d.split("_");
                let fileSource = "audio/" + splittedLabel[1] + "_" + splittedLabel[2].split(/-(.+)/)[0] + ".mp3";
                let timeStampBegin = (parseInt(splittedLabel[2].split("-")[1], 10))*10;
                let timeStampEnd = (parseInt(splittedLabel[2].split("-")[2], 10))*10;
                let sound = new Howl({
                    src: [fileSource],
                    preload: true,
                    sprite: {
                        partPlay: [timeStampBegin,(timeStampEnd - timeStampBegin)]
                    }
                });

                //debugging
                console.log(timeStampBegin + timeStampEnd);
                //sound.play('partPlay'); //AutoPlay

            //Update the tooltip position and value
                d3.select("#tooltip")
                    .select("#value")
                    .text(splittedLabel[1]);
                d3.select("#tooltip")
                    .select("#time")
                    .text(splittedLabel[2]);
                d3.select("#tooltip")
                    .select("#audioplay")
                    .on("click", function () {
                        console.log("clicked" + timeStampBegin + " ende: " + timeStampEnd + "oaiuwefh: " + (timeStampEnd - timeStampBegin));
                        sound.play('partPlay');
                    })
                d3.select("#tooltip")
                    .select("#audiostop")
                    .on("click", function () {
                        console.log("Clicked stop");
                        sound.stop();
                    })

                    //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
                }
                    else{
                d3.select("#tooltip").classed("hidden", true);
                }})
    }

    if (SAMPLE_DATA) {
        _draw(SAMPLE_DATA);
    } else {
        $.getJSON('ivector.json', function (samples) {
            /* console.log(samples);*/
            SAMPLE_DATA = createBetterJson(_.keys(samples.vectors), _.values(samples.vectors));
            LABEL_DATA = createSplitJSON(_.keys(samples.vectors), _.values(samples.vectors));
            _draw(SAMPLE_DATA);
        });
    }
}

/*get called from data-service.js when a new dataSet is loaded*/
function loadData(availableRepo){
    if(availableRepo !== undefined){
        $.getJSON(availableRepo, function (samples) {
            /* console.log(samples);*/
            SAMPLE_DATA = createBetterJson(_.keys(samples.vectors), _.values(samples.vectors));
            LABEL_DATA = createSplitJSON(_.keys(samples.vectors), _.values(samples.vectors));
            _draw(SAMPLE_DATA);
        });
    }else{
        console.log("availableRepo is undefined")
    }
}

/*hashing Speaker Names to color data points*/
function hashCode(str) { // java String#hashCode
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i){
    let c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}
/*required because of the form of data received from API*/
function createSplitJSON(inlabels,indata) {
    let returnArray = [];
    for(let i = 0; i < inlabels.length; i++){
        returnArray.push({label:inlabels[i],data:indata[i]});
    }
    return returnArray;
}
/*required because of the form of data received from API*/
function createBetterJson(inlabels,indata){
    let splitLabel = inlabels.map(value => value.split("_"));
    //console.log(splitLabel);
    let returnObject={
        id: [],
        name: [],
        labels: [],
        timestamp: [],
        data: [],
        color:[]
    };
    inlabels.forEach(function () {
        returnObject.labels = inlabels ;
        returnObject.data = indata;
        returnObject.color = splitLabel.map(value => hashCode(value[1])).map(value => intToRGB(value));
        returnObject.id = splitLabel.map(value => value[0]);
        returnObject.name = splitLabel.map(value => value[1]);
        returnObject.timestamp = splitLabel.map(value => value[2]);
    })
    return returnObject;
}

/*stop. didn't work because webworker would despawn*/
function stop(){
    console.log(getVectors("./feats/unspeech_phn_32_stride1/dev/ivector_online.ark"));
}
function run () {
    worker.postMessage({
        type: 'RUN',
        data: {
            perplexity: parseInt($('#param-perplexity').val(), 10),
            earlyExaggeration: parseFloat($('#param-earlyexag').val()),
            learningRate: parseInt($('#param-learningrate').val(), 10),
            nIter: parseInt($('#param-maxiter').val(), 10),
            metric: $('#param-distance').val()
        }
    });
}

/*required */
function drawUpdate (embedding) {
    embedding = embedding.slice(0, N_SAMPLES);
    let xScale = d3.scaleLinear()
        .domain([d3.min(embedding, function(d) { return d[0]; })-0.05, d3.max(embedding, function(d) { return d[0]; })+0.05])
        .range([0, 600]);
    let yScale = d3.scaleLinear()
        .domain([d3.min(embedding, function(d) { return d[1]; })-0.05,d3.max(embedding, function(d) { return d[1]; })+0.05])
        .range([0, 900]);

    svg.selectAll("circle")
        .data(embedding)

        .attr("cx", function(d) {
            return xScale(d[0]);
        })
        .attr("cy", function(d) {
            return yScale(d[1]);
        })
        .attr("r", 5);

    svg.selectAll("circle")
        .data(sampleNames)
        .on("mouseover", function(d){d3.select(this).attr('r', 10); return tooltip.style("visibility", "visible").text(d);})
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){d3.select(this).attr('r', 5); return tooltip.style("visibility", "hidden");});


    // On Click Tooltip (Left Menu)
    svg.selectAll("circle")
        .data(sampleLabels)
        .style('stroke', 'none')
        .on("click", function(d) {
            d3.selectAll("#tooltip").classed("hidden", true);
            if($('#tooltip').hasClass("hidden")){

                //Get this bar's x/y values, then augment for the tooltip
                let xPosition = parseFloat(d3.select(this).attr("cx")) + xScale / 2;
                let yPosition = parseFloat(d3.select(this).attr("cy")) ;
                //required because of the json format received from API
                let splittedLabel = d.split("_");
                let fileSource = "audio/" + splittedLabel[1] + "_" + splittedLabel[2].split(/-(.+)/)[0] + ".mp3";
                let timeStampBegin = (parseInt(splittedLabel[2].split("-")[1], 10))*10;
                let timeStampEnd = (parseInt(splittedLabel[2].split("-")[2], 10))*10;
                let sound = new Howl({
                    src: [fileSource],
                    preload: true,
                    sprite: {
                        partPlay: [timeStampBegin,(timeStampEnd - timeStampBegin)]
                    }
                });

                //debugging
                console.log(timeStampBegin + timeStampEnd);

                //Update the tooltip position and value
                d3.select("#tooltip")
                    .select("#value")
                    .text(splittedLabel[1]);
                d3.select("#tooltip")
                    .select("#time")
                    .text(splittedLabel[2]);
                d3.select("#tooltip")
                    .select("#audioplay")
                    .on("click", function () {
                        console.log("clicked" + timeStampBegin + " ende: " + timeStampEnd + "oaiuwefh: " + (timeStampEnd - timeStampBegin));
                        sound.play('partPlay');
                    })
                d3.select("#tooltip")
                    .select("#audiostop")
                    .on("click", function () {
                        console.log("Clicked stop");
                        sound.stop();
                    })
                d3.select(this).style('stroke', 'black');

                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            }
            else{
                d3.select("#tooltip").classed("hidden", true);
            }})
}
/*adds responsiveness to the d3js canvas*/
function responsivefy(svg) {
    // get container + svg aspect ratio
    let container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        let targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}


// form controls
$('#param-nsamples').change(function () {
    N_SAMPLES = parseInt($('#param-nsamples').val(), 10);
    draw(N_SAMPLES);
});

$('#param-perplexity').bind('input', function () { $('#param-perplexity-value').text($('#param-perplexity').val()); });
$('#param-earlyexag').bind('input', function () { $('#param-earlyexag-value').text($('#param-earlyexag').val()); });
$('#param-learningrate').bind('input', function () { $('#param-learningrate-value').text($('#param-learningrate').val()); });
$('#param-maxiter').bind('input', function () { $('#param-maxiter-value').text($('#param-maxiter').val()); });

