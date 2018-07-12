function drawScatterplot(_data, htmlElement) {
    var xScale = d3.scaleLinear()
        .domain([d3.min(_data, function(d) { return d[0]; })-0.05, d3.max(_data, function(d) { return d[0]; })+0.05])
        .range([0, 600]);
    var yScale = d3.scaleLinear()
        .domain([d3.min(_data, function(d) { return d[1]; })-0.05,d3.max(_data, function(d) { return d[1]; })+0.05])
        .range([0, 900]);

    htmlElement
        .selectAll("circle")
        .data(_data)
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

function fillColors(colorData) {
    svg.selectAll("circle")
        .data(colorData)
        .attr("fill", function (d) {
            return d3.rgb("#" + d);
        })
}

function toolTips(tooltipData){
    svg.selectAll("circle")
        .data(tooltipData)
        .on("click", function(d) {
            if($('#tooltip').hasClass("hidden")){

                /*Extract all information from Label Data (sound and name)*/
                let splittedLabel = d.split("_");
                let fileSource = "audio/" + splittedLabel[1] + "_" + splittedLabel[2].split(/-(.+)/)[0] + ".wav";
                let timeStampBegin = (parseInt(splittedLabel[2].split("-")[1], 10))*10;
                let timeStampEnd = (parseInt(splittedLabel[2].split("-")[2], 10))*10;

                /*Creat new Howl and sprite*/
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
                /*.attr("src", "audio/" + fileName + ".wav")
                .attr("type", "audio/wave")*/
                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            }
            else{
                d3.select("#tooltip").classed("hidden", true);
            }})
}