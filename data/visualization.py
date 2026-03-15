import folium
import pandas as pd
from data_cleaning import warehouses, demand, distances
from optimization import results_df

m = folium.Map(location=[15.5, 32.8], zoom_start=8, tiles='CartoDB positron')

# Add warehouses (blue markers)
for _, row in warehouses.iterrows():
    folium.CircleMarker(
        location=[row['lat'], row['lon']],
        radius=12, color='blue', fill=True, fill_opacity=0.8,
        popup=f"Warehouse {row['warehouse_id']}<br>Food: {row['food_units']}"
    ).add_to(m)

# Add demand points (color by severity)
severity_colors = {1:'green', 2:'lightgreen', 3:'orange', 4:'red', 5:'darkred'}
for _, row in demand.iterrows():
    color = severity_colors.get(int(row['severity']), 'gray')
    folium.CircleMarker(
        location=[row['lat'], row['lon']],
        radius=8, color=color, fill=True, fill_opacity=0.9,
        popup=f"{row['name']}<br>Severity: {row['severity']}"
    ).add_to(m)

# Draw routes from optimization output
for _, row in results_df.iterrows():
    w_row = warehouses[warehouses['warehouse_id'] == row['from']].iloc[0]
    d_row = demand[demand['location_id'] == row['to']].iloc[0]
    folium.PolyLine(
        [[w_row['lat'], w_row['lon']], [d_row['lat'], d_row['lon']]],
        color='black', weight=1.5, opacity=0.5,
        tooltip=f"{row['from']} → {row['to']}: {row['units']} units"
    ).add_to(m)

m.save("distribution_map.html")