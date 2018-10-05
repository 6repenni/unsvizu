/*
const opt = {epsilon: 10, perplexity: 30};
const T = new tsnejs.tSNE(opt); // create a tSNE instance
let Y;
let data;
let labels;

function updateEmbedding() {
    var Y = Y[i][0];
    svg.selectAll('.u')
        .data(data)
        .attr("transform", function(d, i) { return "translate(" +
            ((Y[i][0]*20*ss + tx) + 100) + "," +
            ((Y[i][1]*20*ss + ty) + 100) + ")"; });
}
var svg;
function drawEmbedding() {
    $("#embed").empty();
    var div = d3.select("#embed");

    // get min and max in each column of Y
    var Y = T.Y;

    svg = div.append("svg") // svg is global
        .attr("width", 800)
        .attr("height", 800);

    var g = svg.selectAll(".b")
        .data(T.Y)
        .enter().append("g")
        .attr("class", "u");
*/

    /*g.append("svg:image")
        .attr('x', 0)
        .attr('y', 2)
        .attr('width', 24)
        .attr('height', 24)
        .attr("xlink:href", function(d) { return "scrape/imgs/" + d.substring(1); })*/

  /*  g.append("text")
        .attr("text-anchor", "top")
        .attr("font-size", 12)
        .attr("fill", "#333")
        .text(function(labels) { return labels; });*/

    /*var zoomListener = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .center([0,0])
        .on("zoom", zoomHandler);
    zoomListener(svg);*/
//}

/*var tx=0, ty=0;
var ss=1;
function zoomHandler() {
    tx = d3.event.translate[0];
    ty = d3.event.translate[1];
    ss = d3.event.scale;
}

function step() {
    for(var k=0;k<5;k++) {
        T.step(); // do a few steps
    }
    updateEmbedding();
}

$(window).on("load",function() {
    $.getJSON( "ivector.json", function( j ) {
        data = _.values(j.vectors);
        labels = _.keys(j.vectors);
        T.initDataDist(data); // init embedding
        drawEmbedding(); // draw initial embedding

        //T.debugGrad();
        //setInterval(step, 0);
        step();

    });
});*/

const opt = {epsilon: 10, perplexity: 30};
const tsne = new tsnejs.tSNE(opt); // create a tSNE instance

$(window).on("load", function(){
    $.getJSON("ivector.json", function( j ) {
        dataset = _.values(j.vectors);
        labels = _.keys(j.vectors);
        tsne.initDataDist(dataset);
        createDrawing();
    });
});


function step() {
    for(var k=0;k<5;k++) {
        T.step(); // do a few steps
    }
    updateEmbedding();
}


function createDrawing(){
    var w = 800;
    var h = 800;
    var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
    //create scale
    var xScale = d3.scaleLinear()
        .domain([d3.min(Y, function(d) { return d[0]; })-100, d3.max(Y, function(d) { return d[0]; })+100])
        .range([0, w]);

    var yScale = d3.scaleLinear()
        .domain([d3.min(Y, function(d) { return d[1]; })-100, d3.max(Y, function(d) { return d[1]; })+100])
        .range([0, h]);

    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    svg.selectAll("circle")
        .data(Y)
        .enter()
        .append("circle")

        .attr("cx", function(d) {
            return xScale(d[0]);
        })
        .attr("cy", function(d) {
            return yScale(d[1]);
        })
        .attr("r", 5);
}
