import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function renderTreemap(data) {
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const width = window.innerWidth * 0.5 - margin.left - margin.right;
  const height = window.innerHeight * 0.5 - margin.top - margin.bottom;
  const color = d3.scaleOrdinal(data.children.map(d => d.name), d3.schemeTableau10);

  const root = d3.treemap()
    .tile(d3.treemapSquarify)
    .size([width, height])
    .padding(1)
    .round(true)
    (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value));

  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  const header = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top - 10})`);

  header.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .attr("dy", "1em")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Government Funding Distribution");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const leaf = g.selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`)
    .on("click", (event, d) => {
      window.location.href = `bar_chart.html?sub_agency=${encodeURIComponent(d.data.name)}`;
    });
  const format = d3.format(".2f");

  let uniqueId = 0;
  const generateUniqueId = () => `leaf-${uniqueId++}`;

  leaf.append("title")
    .text(d => `${d.ancestors().reverse().map(d => d.data.name).join(".")}\n$${format(d.value)} Billion`);

  leaf.append("rect")
    .attr("id", d => (d.leafUid = generateUniqueId()))
    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    .attr("fill-opacity", 0.6)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);

  leaf.append("clipPath")
    .attr("id", d => (d.clipUid = generateUniqueId()))
    .append("use")
    .attr("xlink:href", d => `#${d.leafUid}`);

  leaf.append("text")
    .attr("clip-path", d => `url(#${d.clipUid})`)
    .attr("x", 3)
    .attr("y", 15)
    .selectAll("tspan")
    .data(d => {
      const words = d.data.name.split(/(?=[A-Z][a-z])|\s+/g);
      return words;
    })
    .join("tspan")
    .attr("x", 3)
    .attr("y", (d, i) => 15 + i * 15)
    .text(d => d);

  leaf.append("text")
    .attr("clip-path", d => `url(#${d.clipUid})`)
    .attr("x", 3)
    .attr("y", d => (d.y1 - d.y0) - 5) // Positioning the value at the bottom
    .attr("fill-opacity", 0.7)

  document.body.append(svg.node());
}

function resize() {
  d3.select("svg").remove();
  d3.json("sub_agency.json").then(renderTreemap);
}

window.addEventListener('resize', resize);

d3.json("sub_agency.json").then(renderTreemap);