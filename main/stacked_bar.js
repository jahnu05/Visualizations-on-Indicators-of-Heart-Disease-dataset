// Load data from CSV
d3.csv("../stack_bar.csv").then(function(data) {
    // Data preprocessing
    data.forEach(function(d) {
        d["Current smoker - now smokes every day"] = +d["Current smoker - now smokes every day"];
        d["Current smoker - now smokes some days"] = +d["Current smoker - now smokes some days"];
        d["Former smoker"] = +d["Former smoker"];
        d["Never smoked"] = +d["Never smoked"];
    });

    // Define chart dimensions and margins
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select("#chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define x and y scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.AgeCategory))
        .range([0, width])
        .padding(0.1);

    // Define y scale with updated domain
    const y = d3.scaleLinear()
    .domain([0, 130]) // Adjusted domain to accommodate values up to 130
    .range([height, 0]);


    // Define color scale
    const color = d3.scaleOrdinal()
        .domain(["Current smoker - now smokes every day", "Current smoker - now smokes some days", "Former smoker", "Never smoked"])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]);

    // Draw stacked bars
    const drawStackedBars = () => {
        // Draw bars
        const stack = d3.stack()
            .keys(["Current smoker - now smokes every day", "Current smoker - now smokes some days", "Former smoker", "Never smoked"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const series = stack(data);

        svg.selectAll(".ageGroup")
            .data(series)
            .enter().append("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => x(data[i].AgeCategory))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        // Add x-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add y-axis
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        // Add legend
        const legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d);
    };

   // Define tooltip
const tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// Draw grouped bars
const drawGroupedBars = () => {
    // Define color scale
    const color = d3.scaleOrdinal()
        .domain(["Current smoker - now smokes every day", "Current smoker - now smokes some days", "Former smoker", "Never smoked"])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]);

    // Draw bars
    svg.selectAll(".ageGroup")
        .data(data)
        .enter().append("g")
        .attr("class", "ageGroup")
        .attr("transform", d => "translate(" + x(d.AgeCategory) + ",0)")
        .selectAll("rect")
        .data(d => Object.keys(d).slice(1).map(key => ({ key, value: d[key] })))
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x.bandwidth() / 4 * (["Current smoker - now smokes every day", "Current smoker - now smokes some days", "Former smoker", "Never smoked"].indexOf(d.key)))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth() / 4)
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "pink"); // Highlight the bar on mouseover
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("percentage: "+d.value.toFixed(2)) // Round the value to 2 decimal places
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill", d => color(d.key)); // Restore the original color on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
};




    // Initially draw stacked bars
    drawStackedBars();

    // Function to clear the chart
    const clearChart = () => {
        svg.selectAll("*").remove();
    };

    // Function to redraw chart based on selection
    const redrawChart = () => {
        const selectedChartType = document.getElementById("chart-select").value;
        clearChart();

        if (selectedChartType === "stacked") {
            drawStackedBars();
        } else if (selectedChartType === "grouped") {
            drawGroupedBars();
        }
    };

    // Event listener for select change
    document.getElementById("chart-select").addEventListener("change", redrawChart);
});