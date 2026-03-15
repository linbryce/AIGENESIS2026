import pandas as pd
import numpy as np

warehouses = pd.read_csv("warehouses.csv", skipinitialspace=True)
demand     = pd.read_csv("demand_points.csv", skipinitialspace=True)
distances  = pd.read_csv("distances.csv", skipinitialspace=True)

# Standardize column names
warehouses.columns = warehouses.columns.str.strip().str.lower()
demand.columns     = demand.columns.str.strip().str.lower()
distances.columns  = distances.columns.str.strip().str.lower()

# Fill missing values
demand.fillna(0, inplace=True)

# Validate: every demand point must exist in distance table
missing = set(demand['location_id']) - set(distances['to_id'])
if missing:
    print(f"WARNING: these demand points have no route: {missing}")

# Check stock is sufficient
total_food_need = demand['food_need'].sum()
total_food_stock = warehouses['food_units'].sum()
print(f"Food needed: {total_food_need}, In stock: {total_food_stock}")