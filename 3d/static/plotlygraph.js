// Fetch the JSON data
console.log("here")
fetch('/static/reduced_analysisdata.json') // Make sure to use the corrected file name
    .then(response => response.json())
    .then(data => {
        console.log("loaded");
        // Extract latitude and longitude
        var lat = data.map(d => d.Lat);
        var lon = data.map(d => d.Lon);

        // Create the Plotly scatter plot
        var trace = {
            type: 'scattergeo',
            mode: 'markers',
            lat: lat,
            lon: lon,
        };

        var layout = {
            title: 'Spatial Distribution of Buoys',
            geo: {
                projection: {
                    type: 'mercator'
                }
            }
        };

        var plotData = [trace];

        Plotly.newPlot('plotly-graph', plotData, layout);
        console.log("loaded2222")
    });
