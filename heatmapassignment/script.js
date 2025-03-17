function _1(md){return(
md`# Heatmap Assignment - CSCE679

`
)}

function _temperature_daily(__query,FileAttachment,invalidation){return(
__query(FileAttachment("temperature_daily.csv"),{from:{table:"temperature_daily"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _chart(d3,FileAttachment)
{
  const width = 800;
  const height = 500;
  const marginTop = 25;
  const marginRight = 20;
  const marginBottom = 50;
  const marginLeft = 60;
  
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  FileAttachment("temperature_daily.csv").csv().then(data => {
      data.forEach(d => {
          const date = new Date(d.date.trim());
          d.year = date.getFullYear();
          d.month = date.getMonth() + 1;  // JavaScript months are 0-indexed
          d.max_temp = +d.max_temperature.trim();
          d.min_temp = +d.min_temperature.trim();
      });

      const years = [...new Set(data.map(d => d.year))].sort();
      const months = [...new Set(data.map(d => d.month))].sort((a, b) => b - a);

      //Scale
      const x = d3.scaleBand()
          .domain(years)
          .range([marginLeft, width - marginRight])
          .padding(0.05);

      const y = d3.scaleBand()
          .domain(months)
          .range([marginTop, height - marginBottom])
          .padding(0.05);

      const color = d3.scaleSequential(d3.interpolateYlOrRd)
          .domain(d3.extent(data, d => d.max_temp));


      const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "#fff")
          .style("border", "1px solid #ddd")
          .style("padding", "5px")
          .style("visibility", "hidden");


      svg.append("g")
          .selectAll("rect")
          .data(data)
          .join("rect")
          .attr("x", d => x(d.year))
          .attr("y", d => y(d.month))
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .attr("fill", d => color(d.max_temp))
          .on("mouseover", (event, d) => {
              tooltip.style("visibility", "visible")
                  .html(`Date: ${d.date}<br>Max Temp: ${d.max_temp}°C<br>Min Temp: ${d.min_temp}°C`);
          })
          .on("mousemove", (event) => {
              tooltip.style("top", (event.pageY - 10) + "px")
                     .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => tooltip.style("visibility", "hidden"));


      svg.append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(d3.axisBottom(x));

      svg.append("g")
          .attr("transform", `translate(${marginLeft},0)`)
          .call(d3.axisLeft(y));
  });

  return svg.node();
}


function _chart2(d3,FileAttachment)
{
  const width = 800;
  const height = 500;
  const marginTop = 25;
  const marginRight = 20;
  const marginBottom = 50;
  const marginLeft = 60;

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  FileAttachment("temperature_daily.csv").csv().then(data => {
      data.forEach(d => {
          const date = new Date(d.date.trim());
          d.year = date.getFullYear();
          d.month = date.getMonth() + 1;
          d.day = date.getDate();
          d.max_temp = +d.max_temperature.trim();
          d.min_temp = +d.min_temperature.trim();
      });

      const recentYears = [...new Set(data.map(d => d.year))].sort().slice(-10);
      data = data.filter(d => recentYears.includes(d.year));

      const years = [...new Set(data.map(d => d.year))].sort();
      const months = [...new Set(data.map(d => d.month))].sort((a, b) => b - a);

      const x = d3.scaleBand()
          .domain(years)
          .range([marginLeft, width - marginRight])
          .padding(0.05);

      const y = d3.scaleBand()
          .domain(months)
          .range([marginTop, height - marginBottom])
          .padding(0.05);

      const color = d3.scaleSequential(d3.interpolateYlOrRd)
          .domain(d3.extent(data, d => d.max_temp));

      const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "#fff")
          .style("border", "1px solid #ddd")
          .style("padding", "5px")
          .style("visibility", "hidden");

      svg.append("g")
          .selectAll("g.cell")
          .data(d3.group(data, d => `${d.year}-${d.month}`))
          .join("g")
          .attr("class", "cell")
          .attr("transform", d => `translate(${x(+d[1][0].year)}, ${y(+d[1][0].month)})`)
          .each(function([key, values]) {
              const cellSvg = d3.select(this);

              cellSvg.append("rect")
                  .attr("width", x.bandwidth())
                  .attr("height", y.bandwidth())
                  .attr("fill", color(d3.mean(values, d => d.max_temp)))
                  .on("mouseover", (event, d) => {
                      tooltip.style("visibility", "visible")
                          .html(`Date: ${values[0].date}<br>Max Temp: ${values[0].max_temp}°C<br>Min Temp: ${values[0].min_temp}°C`);
                  })
                  .on("mousemove", (event) => {
                      tooltip.style("top", `${event.pageY + 10}px`)
                             .style("left", `${event.pageX + 10}px`);
                  })
                  .on("mouseout", () => tooltip.style("visibility", "hidden"));

              const dayScale = d3.scaleLinear()
                  .domain([1, 31])
                  .range([0, x.bandwidth()]);

              const tempScale = d3.scaleLinear()
                  .domain([d3.min(values, d => d.min_temp), d3.max(values, d => d.max_temp)])
                  .range([y.bandwidth(), 0]);

              const lineMax = d3.line()
                  .x(d => dayScale(d.day))
                  .y(d => tempScale(d.max_temp));

              const lineMin = d3.line()
                  .x(d => dayScale(d.day))
                  .y(d => tempScale(d.min_temp));

              cellSvg.append("path")
                  .datum(values)
                  .attr("fill", "none")
                  .attr("stroke", "red")
                  .attr("stroke-width", 1)
                  .attr("d", lineMax);

              cellSvg.append("path")
                  .datum(values)
                  .attr("fill", "none")
                  .attr("stroke", "blue")
                  .attr("stroke-width", 1)
                  .attr("d", lineMin);
          });

      svg.append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(d3.axisBottom(x));

      svg.append("g")
          .attr("transform", `translate(${marginLeft},0)`)
          .call(d3.axisLeft(y));

      const legend = svg.append("g")
          .attr("transform", `translate(${width - 100}, 20)`);

      const legendScale = d3.scaleLinear()
          .domain(d3.extent(data, d => d.max_temp))
          .range([0, 100]);

      const legendAxis = d3.axisRight(legendScale).ticks(5);

      legend.append("g")
          .selectAll("rect")
          .data(d3.range(0, 100))
          .join("rect")
          .attr("y", d => d)
          .attr("width", 10)
          .attr("height", 1)
          .attr("fill", d => color(legendScale.invert(d)));

      legend.append("g")
          .attr("transform", "translate(10, 0)")
          .call(legendAxis);
  });

  return svg.node();
}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["temperature_daily.csv", {url: new URL("./files/b14b4f364b839e451743331d515692dfc66046924d40e4bff6502f032bd591975811b46cb81d1e7e540231b79a2fa0f4299b0e339e0358f08bef900595e74b15.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("temperature_daily")).define("temperature_daily", ["__query","FileAttachment","invalidation"], _temperature_daily);
  main.variable(observer("chart")).define("chart", ["d3","FileAttachment"], _chart);
  main.variable(observer("chart2")).define("chart2", ["d3","FileAttachment"], _chart2);
  return main;
}
