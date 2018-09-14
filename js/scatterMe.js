'use strict';

let worker;
let N_SAMPLES;
let SAMPLE_DATA;
let LABEL_DATA;
let svg;
let sampleNames;
let sampleColors;
let sampleLabels;
let lblz;

function createWorker(){
    if(typeof(Worker) !== "undefined") {
        if (typeof (worker) == "undefined") {
            worker = new Worker('js/tsneExample.js');
        }
    }
}
function setCurrentRepo(repo){
    getVectors(repo);
    //var currentRepo = getVectors(repo);
    //console.log("inside setCurrent Repo. Value of currentRepo:\n" + currentRepo);
    /*setTimeout(function () {
        SAMPLE_DATA = createBetterJson(_.keys(currentRepo.vectors), _.values(currentRepo.vectors));
        LABEL_DATA = createSplitJSON(_.keys(currentRepo.vectors), _.values(currentRepo.vectors));
        draw(N_SAMPLES);
    }, 5000);*/
}
function redraw(retData){
    console.log("inside redraw");
    console.log(retData);
    SAMPLE_DATA = createBetterJson(_.keys(retData.data.vectors), _.values(retData.data.vectors));
    LABEL_DATA = createSplitJSON(_.keys(retData.data.vectors), _.values(retData.data.vectors));
    draw(N_SAMPLES);
}
let tooltip = d3.select("body")
    .append("div")
    .attr("class", "mouse-tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

function init () {
    /*console.log(listRepos());*/
        listRepos();
        createWorker();
        svg = d3.select("#embedding-space")
            .append("svg")
            .attr("width", 960)
            .attr("height", 900)
            .call(responsivefy)
            .call(d3.zoom().on("zoom", function () {
                svg.attr("transform", d3.event.transform)
            }))
            .append("g");

        /*.attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('viewBox', '0 0 ' + 600 + ' ' + 900);*/

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
function draw (num) {
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
            .on("mouseover", function(d){return tooltip.style("visibility", "visible").text(d);})
            .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

        // On Click Tooltip (Left Menu)
        svg.selectAll("circle")
            .data(sampleLabels)
            .on("click", function(d) {
                if($('#tooltip').hasClass("hidden")){
            //Get this bar's x/y values, then augment for the tooltip
                let xPosition = parseFloat(d3.select(this).attr("cx")) + xScale / 2;
                let yPosition = parseFloat(d3.select(this).attr("cy")) ;
                let splittedLabel = d.split("_");
                let fileSource = "audio/" + splittedLabel[1] + "_" + splittedLabel[2].split(/-(.+)/)[0] + ".wav";
                let timeStampBegin = (parseInt(splittedLabel[2].split("-")[1], 10))*10;
                let timeStampEnd = (parseInt(splittedLabel[2].split("-")[2], 10))*10;
                let sound = new Howl({
                    src: [fileSource],
                    preload: true,
                    sprite: {
                        partPlay: [timeStampBegin,(timeStampEnd - timeStampBegin)]
                    }
                });

                console.log(timeStampBegin + timeStampEnd);
                sound.play('partPlay');
            //Update the tooltip position and value
                d3.select("#tooltip")
                    /*.style("left", xPosition + "px")
                    .style("top", yPosition + "px")*/
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
                    /*.attr("src", "audio/" + fileName + ".wav")
                    .attr("type", "audio/wave")*/
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
function createSplitJSON(inlabels,indata) {
    let returnArray = [];
    for(let i = 0; i < inlabels.length; i++){
        returnArray.push({label:inlabels[i],data:indata[i]});
    }
    return returnArray;
}
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
        .data(sampleLabels)
        .on("click", function(d) {
            if($('#tooltip').hasClass("hidden")){
                //Get this bar's x/y values, then augment for the tooltip
                let xPosition = parseFloat(d3.select(this).attr("cx")) + xScale / 2;
                let yPosition = parseFloat(d3.select(this).attr("cy")) ;
                let splittedLabel = d.split("_");
                let fileSource = "audio/" + splittedLabel[1] + "_" + splittedLabel[2].split(/-(.+)/)[0] + ".wav";
                let timeStampBegin = (parseInt(splittedLabel[2].split("-")[1], 10))*10;
                let timeStampEnd = (parseInt(splittedLabel[2].split("-")[2], 10))*10;
                let sound = new Howl({
                    src: [fileSource],
                    preload: true,
                    sprite: {
                        partPlay: [timeStampBegin,(timeStampEnd - timeStampBegin)]
                    }
                });

                console.log(timeStampBegin,timeStampEnd);
                sound.play('partPlay');
                //Update the tooltip position and value
                d3.select("#tooltip")
                /*.style("left", xPosition + "px")
                .style("top", yPosition + "px")*/
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
                /*.attr("src", "audio/" + fileName + ".wav")
                .attr("type", "audio/wave")*/
                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            }
            else{
                d3.select("#tooltip").classed("hidden", true);
            }})
}
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

    // to register multiple listeners for same event type,
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        let targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}
//TODO: IF selection changes, call draw with new selection and N_SAMPLES


// form controls
$('#param-nsamples').change(function () {
    N_SAMPLES = parseInt($('#param-nsamples').val(), 10);
    draw(N_SAMPLES);
});

$('#param-perplexity').bind('input', function () { $('#param-perplexity-value').text($('#param-perplexity').val()); });
$('#param-earlyexag').bind('input', function () { $('#param-earlyexag-value').text($('#param-earlyexag').val()); });
$('#param-learningrate').bind('input', function () { $('#param-learningrate-value').text($('#param-learningrate').val()); });
$('#param-maxiter').bind('input', function () { $('#param-maxiter-value').text($('#param-maxiter').val()); });

