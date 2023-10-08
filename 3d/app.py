from asyncio import log
from flask import Flask, render_template, render_template_string, jsonify, request
import pandas as pd
import json
import plotly.express as px
app = Flask(__name__, static_url_path='/static')
import plotly.offline as pyo
df=pd.read_parquet("reference/data.parquet")
@app.route('/')
def index():
    return render_template('index2.html')



# @app.route('/plotlydata1')
# def plot_graph():
#     # Read the data (modify the path as needed)
#     # data = pd.read_parquet("reference/data.parquet")

#     # Combine the Start_yr_month_day and Start_hour_min columns to create a Datetime column
#     df['Datetime'] = pd.to_datetime(df['Start_yr_month_day'] + ' ' + df['Start_hour_min'], errors='coerce')

#     # Set the Datetime column as the index
#     df.set_index('Datetime', inplace=True)

#     # Resample the data by month and calculate the mean SST for each month
#     monthly_data = df['SST'].resample('M').mean()

#     # Create a DataFrame for the monthly data
#     heatmap_data = pd.DataFrame({
#         'Month': monthly_data.index.month_name(),
#         'Year': monthly_data.index.year,
#         'SST': monthly_data.values
#     })

#     # Create a pivot table to prepare the data for the heatmap
#     pivot_data = heatmap_data.pivot_table(values='SST', index='Year', columns='Month', aggfunc='mean')

#     # Create the heatmap using Plotly Express
#     fig = px.imshow(pivot_data, 
#                     title='Monthly Average Sea Surface Temperature',
#                     labels=dict(x="Month", y="Year", color="Temperature (°C)"),
#                     color_continuous_scale='Viridis')
# ##################################################################################

#     # Render the Plotly figure as HTML
#     plot_html = pyo.plot(fig, include_plotlyjs=True, output_type='div')

#     # Render the HTML template with the Plotly figure
#     with open('3d/static/plotly_graph.html', 'w', encoding='utf-8') as file:
#         file.write(plot_html)

#     return "done"



@app.route('/plotlydata2')

def plot_graph2():
    print("here")
    # Read the JSON data
     
    # Convert JSON to DataFrame
    
    ################################################################################
    import pandas as pd
    import plotly.express as px

    # Read the data (modify the path as needed)
   
    # data = pd.read_parquet("reference/data.parquet")
    # Combine the Start_yr_month_day and Start_hour_min columns to create a Datetime column
   
    # Perform k-NN clustering using KMeans
    # You can change the number of clusters by modifying n_clusters
    import plotly.express as px
    unique_data = df.drop_duplicates(subset='ID')
    # Create a scatter geo plot using the Start_lat and Start_lon columns
    fig = px.scatter_geo(unique_data,
                        lat='Start_lat',
                        lon='Start_lon',
                        color='buoy_type',
                        hover_name='program_number',
                        hover_data=['Start_yr_month_day', 'End_yr_month_day'],
                        title='Spatial Distribution of Buoys',
                        color_continuous_scale='Jet',
                        size_max=15,
                        opacity=0.7,
                        template='plotly_dark')

    # Update layout to include a legend title
    fig.update_layout(legend_title=dict(text='Buoy Type'))

##################################################################################
    # fig.show()
    # Render the Plotly figure as HTML
    plot_html = pyo.plot(fig, include_plotlyjs=True, output_type='div')

    # Render the HTML template with the Plotly figure
    with open('3d/static/plotly_graph2.html', 'w', encoding='utf-8') as file:
        file.write(plot_html)

    return "done"
@app.route('/process_video', methods=['POST'])
def process_video():
    try:
        
        # Save video file from request
        video_file = request.files['video']
        video_path = '3d/static/video/video.mp4'
        video_file.save(video_path)
        
        # Your video processing function here (adapted to use video_path)
        process_and_save_audio(video_path)
        
        return jsonify({'status': 'ok', 'message': 'Video processed successfully.'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Error processing video.' ,'error':str(e)})

def process_and_save_audio(video_path):
        import cv2
        import sounddevice as sd
        from scipy.io.wavfile import write
        import numpy as np
        import os
        import pygame
        import time


        # Data Extraction Functions
        def calculate_brightness(frame):
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray_frame)
            return brightness

        def calculate_average_color(frame):
            average_color_per_row = np.average(frame, axis=0)
            average_color = np.average(average_color_per_row, axis=0)
            return average_color

        def calculate_movement(frame1, frame2):
            gray_frame1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
            gray_frame2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
            frame_diff = cv2.absdiff(gray_frame1, gray_frame2)
            total_movement = np.sum(frame_diff)
            return total_movement

        # Data Normalization Function
        def normalize(data, new_min, new_max):
            old_min = np.min(data)
            old_max = np.max(data)
            return ((data - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min

        # Parameter Mapping Functions
        def map_brightness_to_pitch(brightness, min_pitch=220, max_pitch=880):
            return brightness * (max_pitch - min_pitch) + min_pitch

        def map_movement_to_volume(movement, min_volume=0.1, max_volume=1.0):
            return movement * (max_volume - min_volume) + min_volume

        # Video Data Extraction
        video_capture = cv2.VideoCapture(video_path)

        prev_frame = None
        brightness_data = []
        color_data = []
        movement_data = []

        while True:
            ret, frame = video_capture.read()
            if not ret:
                break
            
            brightness = calculate_brightness(frame)
            average_color = calculate_average_color(frame)
            
            movement = calculate_movement(prev_frame, frame) if prev_frame is not None else 0
            
            brightness_data.append(brightness)
            color_data.append(average_color)
            movement_data.append(movement)
            
            prev_frame = frame

        video_capture.release()

        # Data Normalization
        normalized_brightness = normalize(np.array(brightness_data), 0, 1)
        normalized_color = np.array([normalize(channel, 0, 255) for channel in np.array(color_data).T]).T 
        normalized_movement = normalize(np.array(movement_data), 0, 1)

        # Synthesize,
        sample_rate = 44100
        total_duration = len(normalized_brightness) 
        t = np.arange(0, total_duration, 1/sample_rate) 
        audio = np.zeros_like(t, dtype=np.float32)  
        # Generate audio for each frame
        for i, (brightness, movement) in enumerate(zip(normalized_brightness, normalized_movement)):
            pitch = map_brightness_to_pitch(brightness)
            volume = map_movement_to_volume(movement)
            
            # Update audio array
            start_idx = i * sample_rate
            end_idx = (i+1) * sample_rate
            audio[start_idx:end_idx] += np.sin(2 * np.pi * pitch * t[start_idx:end_idx]) * volume

        # Normalize audio to [-1, 1]
        audio /= np.max(np.abs(audio))
        # Save audio as a WAV file
        write("3d/static/audio/output_audio.wav", sample_rate, audio.astype(np.float32))

        # Keep the script alive until audio finishes playing
        sd.wait()
        # Your adapted code here
        
        # Example: 
        # video_capture = cv2.VideoCapture(video_path)
        # ... rest of the logic ...

    # @app.route('/plotlydata3')

    # def plot_graph3():
    #     import plotly.express as px
    #     import pandas as pd

    #     # Sample data loading (replace with your actual DataFrame)
        


    #     # Select and filter the relevant columns
    #     selected_columns = ['Lat', 'Lon', 'SST', 'VAR_LAT', 'VAR_LON', 'VAR_TEMP', 'buoy_type', 'death_code']
    #     filtered_data = df[selected_columns]

    #     # Check the first few rows of the filtered data
    #     print(filtered_data.head())

    #     subset_data = filtered_data.groupby(['buoy_type', 'death_code']).mean().reset_index()

    #     # Create the parallel coordinates plot
    #     fig = px.parallel_coordinates(
    #         subset_data,
    #         color="death_code", # Color lines by death code
    #         title="Multivariate Analysis of Buoys"
    #     )
    #     # fig.update_traces(line=dict(width=2))
        
    #     # Show the plot
    #     # fig.show()
    #     plot_html = pyo.plot(fig, include_plotlyjs=True, output_type='div')

    #     # Render the HTML template with the Plotly figure
    #     with open('3d/static/plotly_graph3.html', 'w', encoding='utf-8') as file:
    #      file.write(plot_html)
    #     return "done"

if __name__ == "__main__":
    app.run(debug=True)