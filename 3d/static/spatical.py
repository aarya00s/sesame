from flask import Flask, render_template_string
import plotly.express as px
import pandas as pd
import json

app = Flask(__name__)

@app.route('/')
def plot_graph():
    # Read the JSON data
    with open('3d/static/reduced_analysisdata.json', 'r') as file:
        data = json.load(file)
    
    # Convert JSON to DataFrame
    df = pd.DataFrame(data)

    # Create a scatter plot using Plotly
    fig = px.scatter_geo(df, lat='Lat', lon='Lon', title='Spatial Distribution of Buoys')

    # Return the HTML of the plot
    return fig.to_html()

if __name__ == '__main__':
    app.run()
