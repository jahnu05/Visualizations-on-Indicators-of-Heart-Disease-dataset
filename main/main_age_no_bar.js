d3.csv("data.csv").then(function(data) {
    // Initialize counts object for heart attacks by age group
    var counts = {};

    // Count number of "Yes" and "No" values for heart attacks for each age group for all states
    data.forEach(function(d) {
        var ageGroup = d.AgeCategory;
        if (ageGroup in counts) {
            counts[ageGroup][d.HadHeartAttack]++;
        } else {
            counts[ageGroup] = {
                Yes: d.HadHeartAttack === "Yes" ? 1 : 0,
                No: d.HadHeartAttack === "No" ? 1 : 0,
            };
        }
    });

    // Prepare data for bar chart
    var barData = Object.keys(counts).map(function(ageGroup) {
        return {
            ageGroup: ageGroup,
            yes: counts[ageGroup].Yes,
            no: counts[ageGroup].No,
        };
    });

    // Sort data by age group
    barData.sort(function(a, b) {
        return a.ageGroup.localeCompare(b.ageGroup);
    });

    // Create bar chart
    var svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", 600)
        .attr("height", 300);

    var margin = { top: 20, right: 30, bottom: 60, left: 60 }; // Increased bottom margin for y-axis label
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().range([0, width]).padding(0.1);
    var y = d3.scaleLinear().range([height, 0]);

    var g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(
        barData.map(function(d) {
            return d.ageGroup;
        })
    );
    y.domain([
        0,
        d3.max(barData, function(d) {
            return Math.max(0, (d.yes / (d.yes + d.no)) * 100 + 5);
        }),
    ]);

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.75em")
        .attr("transform", "rotate(-90)");

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5))
        .append("text") // Y-axis label
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-3em")
        .attr("text-anchor", "end")
        .text("No. of People");

    // Define tooltip
    var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add bars for "Yes" with interactivity
    g.selectAll(".yes-bar")
        .data(barData)
        .enter()
        .append("rect")
        .attr("class", "yes-bar")
        .attr("x", function(d) {
            return x(d.ageGroup);
        })
        .attr("y", function(d) {
            return y((d.yes / (d.yes + d.no)) * 100);
        })
        .attr("width", x.bandwidth() / 2)
        .attr("height", function(d) {
            return height - y((d.yes / (d.yes + d.no)) * 100);
        })
        .style("fill", "green")
        .on("mouseover", function(event, d) {
            var mouseX = event.pageX;
            var mouseY = event.pageY;
            tooltip.transition().duration(200).style("opacity", 0.9);

            tooltip
                .html("Percent of People: " + (d.yes / (d.yes + d.no)) * 100)
                .style("left", mouseX + 10 + "px") // Adjust tooltip position
                .style("top", mouseY - 28 + "px");

            d3.select(this).style("fill", "orange");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
            d3.select(this).style("fill", "green"); // Restore original color
        });

    g.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentage of People");

    g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5));
});
