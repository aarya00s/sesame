# # import pandas as pd

# # # Read the parquet file
# # file_path = "data.parquet"
# # data = pd.read_parquet(file_path)
# # # data = data.drop_duplicates(subset='ID')
# # # # Extract the required variables
# # # variables = ["Start_lat", "Start_lon", "End_lat", "End_lon", "SPD", "Datetime"]
# # # data = data[variables]

# # # # Convert Datetime to a datetime object
# # # data['Datetime'] = pd.to_datetime(data['Datetime'])
# # import numpy as np

# # # # Calculate the differences in lat and lon to find the direction
# # # data['dlat'] = data['End_lat'] - data['Start_lat']
# # # data['dlon'] = data['End_lon'] - data['Start_lon']

# # # # Calculate the angle of movement
# # # data['angle'] = np.arctan2(data['dlat'], data['dlon'])
# # # # Resample the data by month
# # # data.set_index('Datetime', inplace=True)
# # # monthly_data = [group for _, group in data.resample('M')]
# # import matplotlib.pyplot as plt

# # # # Create a directory to store the frames
# # # import os
# # # os.makedirs('frames', exist_ok=True)

# # # # Plot the quiver plot for each month and save as an image
# # # for i, month_data in enumerate(monthly_data):
# # #     plt.figure(figsize=(10, 6))
# # #     plt.quiver(month_data['Start_lon'], month_data['Start_lat'], 
# # #                month_data['dlon'], month_data['dlat'], 
# # #                angles='xy', scale_units='xy', scale=0.1, 
# # #                color='blue')
    
# # #     plt.xlim(data['Start_lon'].min(), data['Start_lon'].max())
# # #     plt.ylim(data['Start_lat'].min(), data['Start_lat'].max())
# # #     plt.title(f'Buoy Movement - {month_data.index[0].strftime("%Y-%m")}')
# # #     plt.xlabel('Longitude')
# # #     plt.ylabel('Latitude')
    
# # #     plt.savefig(f'frames/frame_{i}.png')
# # #     plt.close()
# # from PIL import Image

# # # # Read the frames
# # # frames = [Image.open(f'frames/frame_{i}.png') for i in range(len(monthly_data))]

# # # # Save as an animated GIF
# # # frames[0].save('buoy_movement.gif', save_all=True, append_images=frames[1:], loop=0, duration=500)
# # # Resample the data by month
# # # #################################################################################
# # # import pandas as pd
# # # import plotly.express as px

# # # # Read the data (modify the path as needed)
# # # data = pd.read_parquet("data.parquet")

# # # # Combine the Start_yr_month_day and Start_hour_min columns to create a Datetime column
# # # data['Datetime'] = pd.to_datetime(data['Start_yr_month_day'] + ' ' + data['Start_hour_min'], errors='coerce')

# # # # Set the Datetime column as the index
# # # data.set_index('Datetime', inplace=True)

# # # # Resample the data by month and calculate the mean SST for each month
# # # monthly_data = data['SST'].resample('M').mean()

# # # # Create a DataFrame for the monthly data
# # # heatmap_data = pd.DataFrame({
# # #     'Month': monthly_data.index.month_name(),
# # #     'Year': monthly_data.index.year,
# # #     'SST': monthly_data.values
# # # })

# # # # Create a pivot table to prepare the data for the heatmap
# # # pivot_data = heatmap_data.pivot_table(values='SST', index='Year', columns='Month', aggfunc='mean')

# # # # Create the heatmap using Plotly Express
# # # fig = px.imshow(pivot_data, 
# # #                 title='Monthly Average Sea Surface Temperature',
# # #                 labels=dict(x="Month", y="Year", color="Temperature (°C)"),
# # #                 color_continuous_scale='Viridis')
# # # ##################################################################################
# # # Show the figure
# # fig.show()
    
#     # Read the JSON data
     
#     # Convert JSON to DataFrame
    
#     ################################################################################
    
#     # Read the data (modify the path as needed)
   
#     # data = pd.read_parquet("data.parquet")
#     # Combine the Start_yr_month_day and Start_hour_min columns to create a Datetime column
# import pandas as pd
# import plotly.express as px
# from asyncio import log
# from flask import Flask, render_template, render_template_string, jsonify
# import pandas as pd
# import json
# import plotly.express as px
# app = Flask(__name__, static_url_path='/static')
# import plotly.offline as pyo

# import plotly.express as px
# import pandas as pd

# import pandas as pd
# import plotly.express as px

# # Sample data loading (replace with your actual DataFrame)
# data = pd.read_parquet('data.parquet')


# import plotly.graph_objects as go

# # Sample data loading (replace with your actual DataFrame)
# # data = pd.read_parquet('data.parquet')

# # Group by 'buoy_type' and 'death_code', and count the number of buo

# # Create subplot layout
# # fig = make_subplots(rows=1, cols=2, specs=[[{'type': 'bar'}, {'type': 'pie'}]])

# # Add bar chart for buoy types
# # bar_chart = px.bar(buoy_summary, x='buoy_type', y='count', color='death_code')
# # for trace in bar_chart.data:
# #     fig.add_trace(trace)

# import pandas as pd
# import plotly.express as px

# # Load your data
# # data = pd.read_pa rquet('data.parquet')
# data= data.groupby(axis='buoy_type')
# # Create scatter plot
# fig = px.scatter(data, x='Lat', y='Lon', color='death_code')

# # Customize layout
# fig.update_layout(title='Geographical Distribution of Buoy Death Codes',
#                   xaxis_title='Latitude', yaxis_title='Longitude')

# # Show plot
# # fig.show()


# # Show the plot


# # ...

# # Death codes description with HTML formatting
# death_codes_description = """
# <b>DEATH CODES:</b><br>
# 0 = still reporting<br>
# 1 = ran aground<br>
# 2 = picked up<br>
# 3 = quit transmitting<br>
# 4 = Unreliable transmissions<br>
# 5 = Bad battery voltage<br>
# 6 = Inactive status
# """

# # Add the death codes description as an annotation to the layout
# fig.update_layout(
#     annotations=[
#         go.layout.Annotation(
#             text=death_codes_description,
#             showarrow=False,
#             xref='paper',
#             yref='paper',
#             x=1.02,  # x position
#             y=0.5,   # y position
#             align='left',
#             font=dict(size=8) # Font size
#         )
#     ]
# )
# fig.show()
import plotly.express as px
import pandas as pd

# Sample data loading (replace with your actual DataFrame)
data = pd.read_parquet('data.parquet')
unique_data = data.drop_duplicates(subset='ID')

# Select and filter the relevant columns
selected_columns = ['Lat', 'Lon', 'SST', 'VAR_LAT', 'VAR_LON', 'VAR_TEMP', 'buoy_type', 'death_code']
filtered_data = data[selected_columns]

# Check the first few rows of the filtered data
print(filtered_data.head())

subset_data = filtered_data.groupby(['buoy_type', 'death_code']).mean().reset_index()

# Create the parallel coordinates plot
fig = px.parallel_coordinates(
    subset_data,
    color="death_code", # Color lines by death code
    title="Multivariate Analysis of Buoys"
)

# Show the plot
fig.show()

# Add dropdown to select buoy type
# buoy_types = filtered_data['buoy_type'].unique()
# buttons = [{"label": buoy_type, "method": "update", "args": [{"visible": filtered_data['buoy_type'] == buoy_type}]} for buoy_type in buoy_types]
# buttons.append({"label": "All", "method": "update", "args": [{"visible": [True] * len(filtered_data)}]})

# fig.update_layout(
#     updatemenus=[
#         {
#             "buttons": buttons,
#             "direction": "down",
#             "showactive": True,
#             "x": 0.1,
#             "xanchor": "left",
#             "y": 1.15,
#             "yanchor": "top",
#         }
#     ]
# )

# Show the plot
# fig.show()


##################################################################################
    # fig.show()
    # Render the Plotly figure as HTML
# plot_html = pyo.plot(fig, include_plotlyjs=True, output_type='div')

#     # Render the HTML template with the Plotly figure
# with open('3d/static/plotly_graph3.html', 'w') as file:
#         file.write(plot_html)
