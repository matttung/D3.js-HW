(function () {
    var margin = {top:50,left:50,right:50,bottom:50},
        height=400-margin.top-margin.bottom,
        width =800-margin.left-margin.right;
    
    var svg = d3.select("#map")
                .append("svg")
                .attr("height",height+margin.top+margin.bottom)
                .attr("width", width+margin.left+margin.right)
                .append("g")
                .attr("transform", "translate("+margin.left+","+margin.top+")");
    
    d3.queue()
      .defer(d3.json, "world.topojson")
      .defer(d3.csv, "population.csv")
      .await(ready);
    
    var projection = d3.geoMercator()
                       .translate([width/2, height/2])
                       .scale(100);
    
    var path = d3.geoPath()
                 .projection(projection);
    
    function ready(error, data, population){
        //console.log(data);
        
        var populationArray =[];
        var countryArray=[];
        for(var i= 0; i<population.length; i++)
        {
            populationArray[population[i].Id] = population[i].Y2015;
            countryArray[population[i].Id] = population[i].CountryName;
        }
        //console.log(populationArray);
        //console.log(countryArray);
        
        var countries = topojson.feature(data,data.objects.countries).features;
        //console.log(countries);
         
        for(var i=0; i<countries.length; i++){
            var name = countryArray[countries[i].id];
            if(name) countries[i].CountryName = name;
        }
        
        for(var i=0; i<countries.length; i++){
            var pop = populationArray[countries[i].id];
            if(pop) countries[i].Population = pop;
        }       
        
        //console.log(countries);
        var cScale = d3.scaleLinear()
                       .domain([d3.min(countries, function (data) {
                                                        return +data.Population;}), 
                                d3.max(countries, function (data) {
                                                        return +data.Population;})
                                   ])
                       .range(["#00f","#f00"]);
        
        svg.selectAll(".country")
        .data(countries)
        .enter().append('path')
        //.attr("class", "country")
        .attr("fill",function(data){
                        return cScale(data.Population);})
        .attr("stroke","#333333")
        .attr("stroke-width",0.5)
        .attr("d", path)
        .on("mouseover", function(data){
            d3.select(this).classed("selected", true);
            //console.log(data)
            
            var coordinates = d3.mouse(this);
             //console.log(coordinates);
            var xMouse = coordinates[0];
            var yMouse = coordinates[1];
            
            var tooltip = d3.select("#tooltip")
                            .style({
                                     left: (+xMouse + 15) + "px",
                                      top: (+yMouse + 15) + "px"
                                    });
            
            d3.select("#country").text(data.CountryName);
            d3.select("#population").text(data.Population);
            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function(data){
            d3.select(this).classed("selected", false);
            d3.select("#tooltip").classed("hidden", true);
        });
        
        //console.log(population);
    }
})()