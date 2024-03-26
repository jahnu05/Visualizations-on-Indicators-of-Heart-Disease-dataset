// Load CSV data
d3.csv("data.csv").then(function(data) {
    // Filter data for the specified state and those who had a heart attack
    var stateData = data.filter(function(d) {
        return d.State === stateName && d.HadHeartAttack === "Yes" && d.SmokerStatus !== "Nan";
    });

    // Count number of individuals with different smoker statuses
    var smokerCounts = {};
    stateData.forEach(function(d) {
        var smokerStatus = d.SmokerStatus;
        if (smokerStatus in smokerCounts) {
            smokerCounts[smokerStatus]++;
        } else {
            smokerCounts[smokerStatus] = 1;
        }
    });

    // Prepare data for pie chart
    var pieData = Object.keys(smokerCounts).map(function(key) {
        return { label: key, count: smokerCounts[key] };
    });

    // Setup SVG
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", 600) // Keep width unchanged
        .attr("height", 300); // Decrease height to 300

    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var radius = Math.min(width, height) / 2;

    var g = svg.append("g")
        .attr("transform", "translate(" + (width / 3) + "," + height / 2 + ")"); // Adjust translate for proper alignment

    // Draw legend
    var legend = g.selectAll(".legend")
        .data(pieData)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (i * 20) + ")"; }); // Adjust spacing

    // Define tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Setup pie chart layout
    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 50); // Adjust outer radius

    // Draw slices
    var arcs = g.selectAll(".arc")
        .data(pie(pieData))
        .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", function(d) {
            // You can define custom colors for each smoker status if needed
            return getSmokerColor(d.data.label);
        })
        .on("mouseover", function(event, d) {
            var percentage = (d.data.count / stateData.length) * 100;
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.data.label + ": " + percentage.toFixed(2) + "%")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(this).transition()
                .duration(100)
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius - 30) // Adjust outer radius on mouseover
                );
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).transition()
                .duration(100)
                .attr("d", arc);
        });

    // Add rectangles or circles with colors next to the text labels
    arcs.append("rect") // You can also use circles instead of rectangles
        .attr("x", radius + 10) // Adjust the position according to your preference
        .attr("y", function(d, i) { return i * 20; }) // Use index for y position to achieve equal spacing
        .attr("width", 10) // Adjust size of rectangle/circle
        .attr("height", 10) // Adjust size of rectangle/circle
        .style("fill", function(d) {
            return getSmokerColor(d.data.label);
        });

    // Add text labels for smoker statuses
    arcs.append("text")
        .attr("transform", function(d, i) {
            return "translate(" + (radius + 25) + "," + (i * 20 + 9) + ")"; // Adjust positioning to center text vertically
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "start") // Adjust text anchor
        .text(function(d) {
            return d.data.label;
        });

        // Add a white circle around the state name
    g.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 40) // Adjust the radius to fit the state name
    .style("fill", "white") // Change color as needed
    .style("stroke", "black") // Add border color
    .style("stroke-width", 2); // Add border width
    // Inner circle with state name
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .text(stateName)
        .attr("dy", "0.35em"); // Adjust positioning as needed

    // Text displaying percentage between inner and outer circle
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text("Percentage")
        .attr("font-size", "10px")
        .attr("fill", "gray")
        .attr("transform", "translate(0, 20)");

});

// Function to define colors for each smoker status
function getSmokerColor(smokerStatus) {
    switch (smokerStatus) {
        case "Former smoker":
            return "purple";
        case "Never smoked":
            return "green";
        case "Current smoker - now smokes every day":
            return "red";
        case "Current smoker - now smokes some days":
            return "orange";
        default:
            return "gray";
    }
}
