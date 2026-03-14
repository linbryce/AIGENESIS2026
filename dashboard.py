# app.py
import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium

st.set_page_config(page_title="Humanitarian Logistics Optimizer", layout="wide")
st.title("Humanitarian Distribution Optimizer")
st.caption("Upload warehouse + demand data to compute optimal delivery routes")

col1, col2 = st.columns(2)
wh_file  = col1.file_uploader("Warehouses CSV", type="csv")
dem_file = col2.file_uploader("Demand Points CSV", type="csv")

if wh_file and dem_file:
    warehouses = pd.read_csv(wh_file)
    demand     = pd.read_csv(dem_file)
    
    # Run cleaning + optimization (call your functions here)
    st.subheader("Optimization Results")
    st.dataframe(results_df)
    
    st.subheader("Distribution Map")
    st_folium(m, width=900, height=500)
    
    st.metric("Total Distance (km)", round(results_df['distance'].sum()))
    st.metric("Demand Points Covered", len(results_df['to'].unique()))