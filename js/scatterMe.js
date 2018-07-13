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

function init () {
    console.log(listRepos());
    worker = new Worker('js/tsneExample.js');
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
        var msg = e.data;

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
                break;
            default:
        }
    }

    N_SAMPLES = parseInt($('#param-nsamples').val(), 10);
    draw(N_SAMPLES);

}
function sliceSamples(sampledata){
    for (var property in sampledata) {
        if (sampledata.hasOwnProperty(property)) {
            sampledata.property
        }
    }
}
function draw (num) {

    function _draw(samples) {
        $('g').empty();
        var sampleData = samples.data.slice(0, num);
        sampleNames = samples.name.slice(0, num);
        sampleColors = samples.color.slice(0, num);
        sampleLabels = samples.labels.slice(0, num);

        /*var sampleData = samples.slice(0,num);*/

        worker.postMessage({
            type: 'INPUT_DATA',
            data: samples.data.slice(0,num)
        });
       /* var embeddingSpace = document.getElementById('embedding-space');
        var randWidth = Math.random() * embeddingSpace.clientWidth - 14;
        var randHeight = Math.random() * embeddingSpace.clientHeight - 14;*/

        var xScale = d3.scaleLinear()
            .domain([d3.min(sampleData, function(d) { return d[0]; })-0.05, d3.max(sampleData, function(d) { return d[0]; })+0.05])
            .range([0, 960]);
        var yScale = d3.scaleLinear()
            .domain([d3.min(sampleData, function(d) { return d[1]; })-0.05,d3.max(sampleData, function(d) { return d[1]; })+0.05])
            .range([0, 900]);

        svg
            .selectAll("circle")
            .data(samples.data.slice(0,num))
            .enter()
            .append("circle")

            .attr("cx", function(d) {
                return xScale(d[0]);
            })
            .attr("cy", function(d) {
                return yScale(d[1]);
            })
            .attr("r", 5);
            /*.append("title")
            .text(function (d) {
                return d;
            })*/
            /*.on("mouseover", function(d){
                var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
                var yPosition = parseFloat(d3.select(this).attr("y")) + 14;
                svg.append("text")
                    .attr("id", "tooltip")
                    .attr("x", xPosition)
                    .attr("y", yPosition)
                    .attr("text-anchor", "middle")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "11px")
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(d);
            })
            .on("mouseout", function() {
                //Remove the tooltip
                d3.select("#tooltip").remove();
            })*/


        svg.selectAll("circle")
            .data(sampleColors)
            .attr("fill", function (d) {
                return d3.rgb("#" + d);
            })

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
            /*.on("mouseout", function() {
            //Hide the tooltip
            d3.select("#tooltip").classed("hidden", true);
            });*/

        /*svg.selectAll("circle")
            .data(sampleLabels)
            .on("click", function (d) {
                console.log(d)
            });*/

            /*.on("mouseover", function(d){
            var xPosition = parseFloat(d3.select(this).attr("cx")) + xScale / 2;
            var yPosition = parseFloat(d3.select(this).attr("cy")) + 14;
            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text(d);
            })
            .on("mouseout", function() {
                //Remove the tooltip
                d3.select("#tooltip").remove();
            })*/

        /*$('#embedding-space').empty();
        var embeddingSpace = document.getElementById('embedding-space');
        for (var n = 0; n < num; n++) {
            var c = document.createElement('canvas');
            c.setAttribute('class', 'sample');
            c.setAttribute('id', `sample-${n}`);
            c.setAttribute('width', 150);
            c.setAttribute('height', 150);
            embeddingSpace.appendChild(c);
            var ctx = c.getContext('2d');
            var imgData = ctx.createImageData(150, 150);
            for (var i = 0; i < imgData.data.length; i+=4) {
                imgData.data[i+0] = 255;
                imgData.data[i+1] = 255;
                imgData.data[i+2] = 255;
                imgData.data[i+3] = 255 * sampleData[n][i/4];
            }
            ctx.putImageData(imgData, 0, 0);

            c.style.transform = `translateX(${Math.random() * embeddingSpace.clientWidth - 14}px) translateY(${Math.random() * embeddingSpace.clientHeight - 14}px)`;
        }*/
    }

    if (SAMPLE_DATA) {
        _draw(SAMPLE_DATA);
    } else {
        /*d3.json("ivector.json", function(data){
            SAMPLE_DATA = createBetterJson(_.keys(data.vectors), _.values(data.vectors));
            LABEL_DATA = createSplitJSON(_.keys(data.vectors), _.values(data.vectors));
            _draw(SAMPLE_DATA);
        })*/
        $.getJSON('ivector.json', function (samples) {
           /* console.log(samples);*/
            SAMPLE_DATA = createBetterJson(_.keys(samples.vectors), _.values(samples.vectors));
            LABEL_DATA = createSplitJSON(_.keys(samples.vectors), _.values(samples.vectors));
            _draw(SAMPLE_DATA);
        });
    }
}
function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}
function createSplitJSON(inlabels,indata) {
    var returnArray = [];
    for(var i = 0; i < inlabels.length; i++){
        returnArray.push({label:inlabels[i],data:indata[i]});
    }
    return returnArray;
}
function createBetterJson(inlabels,indata){
    var splitLabel = inlabels.map(value => value.split("_"));
    //console.log(splitLabel);
    var returnObject={
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
    var xScale = d3.scaleLinear()
        .domain([d3.min(embedding, function(d) { return d[0]; })-0.05, d3.max(embedding, function(d) { return d[0]; })+0.05])
        .range([0, 600]);
    var yScale = d3.scaleLinear()
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
   /* svg.selectAll("circle")
        .data(sampleNames)
        .on("mouseover", function(d) {
            //Get this bar's x/y values, then augment for the tooltip
            var xPosition = parseFloat(d3.select(this).attr("cx")) + xScale / 2;
            var yPosition = parseFloat(d3.select(this).attr("cy")) / 2;
            //Update the tooltip position and value
            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#value")
                .text(d);
            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false);
        }).on("mouseout", function() {
        //Hide the tooltip
        d3.select("#tooltip").classed("hidden", true);
    })*/
    /*svg.selectAll("circle")
        .data(sampleNames)
        .on("mouseover", function(d){
            var xPosition = parseFloat(d3.select(this).attr("cx")) + xScale / 2;
            var yPosition = parseFloat(d3.select(this).attr("cy")) + 14;
            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text(d);
        })
        .on("mouseout", function() {
            //Remove the tooltip
            d3.select("#tooltip").remove();
        })*/
    /*var embeddingSpace = document.getElementById('embedding-space');


    var embeddingSpace = document.getElementById('embedding-space');
    var embeddingSpaceWidth = embeddingSpace.clientWidth;
    var embeddingSpaceHeight = embeddingSpace.clientHeight;
    for (var n = 0; n < N_SAMPLES; n++) {
        var c = document.getElementById(`sample-${n}`);
        c.style.transform = `translateX(${(embedding[n][0] + 1) * embeddingSpaceWidth / 2 - 14}px) translateY(${(embedding[n][1] + 1) * embeddingSpaceHeight / 2 - 14}px)`;
    }*/
}
function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
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
        var targetWidth = parseInt(container.style("width"));
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

