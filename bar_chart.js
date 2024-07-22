import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function renderBarChart(data, subAgency) {
  const margin = { top: 40, right: 20, bottom: 100, left: 80 };
  const width = window.innerWidth * 0.8 - margin.left - margin.right;
  const height = window.innerHeight * 0.6 - margin.top - margin.bottom;

  const svg = d3.select("#chart").append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip div
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  data.sort((a, b) => d3.descending(+a.office_obligated_dollars, +b.office_obligated_dollars));
  const top10Data = data.slice(0, 10);

  const x = d3.scaleBand()
    .domain(top10Data.map(d => d.funding_office_name))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(top10Data, d => +d.office_obligated_dollars)])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .selectAll("rect")
    .data(top10Data)
    .join("rect")
    .attr("x", d => x(d.funding_office_name))
    .attr("y", d => y(+d.office_obligated_dollars))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(+d.office_obligated_dollars))
    .attr("fill", "steelblue")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("fill", "darkorange");
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(
        `<strong>Office:</strong> ${d.funding_office_name}<br/>
         <strong>Spending:</strong> $${d3.format(".2f")(d.office_obligated_dollars)} Billion`
      )
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this).attr("fill", "steelblue");
      tooltip.transition().duration(500).style("opacity", 0);
    });

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).ticks(10, "$.2f"));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text(`Top 10 Office Spending for ${subAgency} (in Billions)`);



}

function resize() {
  d3.select("svg").remove();
  const urlParams = new URLSearchParams(window.location.search);
  const subAgency = urlParams.get("sub_agency");
  if (subAgency) {
    d3.csv("office.csv").then(data => {
      const filteredData = data.filter(d => d.funding_sub_agency_name === subAgency);
      renderBarChart(filteredData, subAgency);
    });
  }
}

window.addEventListener('resize', resize);

const urlParams = new URLSearchParams(window.location.search);
const subAgency = urlParams.get("sub_agency");
if (subAgency) {
  d3.csv("office.csv").then(data => {
    const filteredData = data.filter(d => d.funding_sub_agency_name === subAgency);
    renderBarChart(filteredData, subAgency);
  });
}

document.getElementById('back-button').addEventListener('click', () => {
  window.location.href = 'index.html';
});
