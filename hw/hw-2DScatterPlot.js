  var width = 900;
  var height = 600;
  var padding = 110;

  var svgSelection = appendSVG("div #svg", width, height, "svg");
  appendElement("svg", "rect", "100%", "100%", "white");
  appendAxis("axisX");
  appendAxis("axisY");

  d3.csv("invoice.csv", function (dataSet) {
      
      bind(dataSet);
      render(dataSet);

      var uniqueIndustryArray = getUniqueIndustryArray(dataSet);
      appendButton("div #buttonlist", dataSet, uniqueIndustryArray);
      appendOption("div #dropdownlist", dataSet, uniqueIndustryArray);
  });



  function appendSVG(container, width, height, appendId) {
      var svgSelection = d3.select(container).append("svg");
      svgSelection.attr({
          width: width,
          height: height,
          id: appendId
      });

      return svgSelection;
  }

  function appendElement(container, element, width, height, fill) {
      d3.select(container).append("g").append(element)
          .attr({
              width: width,
              height: height,
              fill: fill
          });
  }

  function appendAxis(id) {
      svgSelection.append("g").attr("id", id);
  }

  function bind(dataSet) {
      var selection = svgSelection.selectAll("circle")
          .data(dataSet);

      selection.enter().append("circle");
      selection.exit().remove();
  }

  function render(dataSet) {
      var scale = getScale(dataSet);

      renderXAxis(scale.xScale);
      renderYAxis(scale.yScale);

      d3.selectAll("circle")
          .attr({
              cx: function (item) {
                  return scale.xScale(new Date(item.date));
              },
              cy: function (item) {
                  return scale.yScale(+item.number);
              },
              r: function (item) {
                  return scale.rScale(+item.amount);
              },
              fill: function (item, index) {
                  return scale.fScale(item.cid);
              }
          })
          .on("mouseover", function (item) {
              var cx = d3.select(this).attr("cx");
              var cy = d3.select(this).attr("cy");

              var tooltip = d3.select("#tooltip")
                  .style({
                      left: (+cx + 15) + "px",
                      top: (+cy + 15) + "px"
                  });

              tooltip.select("#city").text(item.city);
              tooltip.select("#industry").text(item.industry);

              d3.select("#tooltip").classed("hidden", false);
          })
          .on("mouseout", function () {
              d3.select("#tooltip").classed("hidden", true)
          });

  }

  function getScale(dataSet) {
      var scale = {};
      scale.xScale = d3.time.scale()
          .domain([new Date(d3.min(dataSet, function (item) { return item.date;})),
                   new Date(d3.max(dataSet, function (item) { return item.date;}))])
          .range([padding, width - padding]);

      scale.yScale = d3.scale.linear()
          .domain([0, d3.max(dataSet, function (item) {
              return +item.number;
          })])
          .range([height - padding, padding]);

      scale.rScale = d3.scale.linear()
          .domain([d3.min(dataSet, function (item) {
                  return +item.amount;
              }),
                                      d3.max(dataSet, function (item) {
                  return +item.amount;
              })])
          .range([5, 30]);

      scale.fScale = d3.scale.category20();

      return scale;
  }

  function renderXAxis(xScale) {
      var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
      d3.select("g#axisX")
          .attr("class", "axis")
          .attr("transform", "translate(0, " + (height - padding + 15) + ")")
          .call(xAxis);
  }

  function renderYAxis(yScale) {
      var yAxis = d3.svg.axis().scale(yScale).orient("left");
      d3.select("g#axisY")
          .attr("class", "axis")
          .attr("transform", "translate(" + (padding - 12) + ",0)")
          .call(yAxis);
  }

  function getUniqueIndustryArray(dataSet) {
      var industryArray = dataSet.map(function (item) {
              return item.industry;
          })
          .filter(function (item) {
              return item != "";
          });
      return unique(industryArray);
  }

  function unique(array) {
      var tempArray = [];
      array.map(function (item) {
          if (tempArray.indexOf(item) < 0) {
              tempArray.push(item);
          }
      });

      return tempArray;
  }

  function appendButton(container, dataSet, industryArray) {
      var selection = d3.select(container)
          .selectAll("button")
          .data(industryArray);

      selection.enter().append("button")
          .attr({
              "class": "btn btn-sm btn-default btn-primary-spacing active"
          })
          .text(function (item) {
              return item;
          })
          .on("click", function (item) {
              update(dataSet, item);
          });

      selection.exit().remove();
  }

  function appendOption(container, dataSet, industryArray) {
      var selection = d3.select(container).append("select")
          .selectAll("option")
          .data(industryArray);

      selection.enter().append("option")
          .attr({
              value: function (item) {
                  return item;
              }
          })
          .text(function (item) {
              return item;
          })

      d3.select("select")
          .on("change", function () {
              var selectedValue = d3.select("select").property("value");
              update(dataSet, selectedValue);
          });

      selection.exit().remove();
  }

  function update(dataSet, industryName) {
      var newDataSet = dataSet.filter(function (item) {
          return item.industry === industryName;
      });
      
      bind(newDataSet);
      render(newDataSet);
  }