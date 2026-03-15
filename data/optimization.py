import pandas as pd
from ortools.linear_solver import pywraplp

from data_cleaning import warehouses, demand, distances

solver = pywraplp.Solver.CreateSolver('SCIP')

warehouses_list = warehouses['warehouse_id'].tolist()
demands_list    = demand['location_id'].tolist()

# Decision variables: how many units W sends to D
x = {}
for w in warehouses_list:
    for d in demands_list:
        x[w, d] = solver.NumVar(0, solver.infinity(), f'x_{w}_{d}')

# Constraint 1: each demand point gets what it needs
for d in demands_list:
    need = demand.loc[demand['location_id']==d, 'food_need'].values[0]
    solver.Add(sum(x[w, d] for w in warehouses_list) >= need)

# Constraint 2: warehouses can't send more than they have
for w in warehouses_list:
    stock = warehouses.loc[warehouses['warehouse_id']==w, 'food_units'].values[0]
    solver.Add(sum(x[w, d] for d in demands_list) <= stock)

# Objective: minimize total distance × units shipped
dist_lookup = distances.set_index(['from_id','to_id'])['distance_km'].to_dict()
objective = solver.Objective()
for w in warehouses_list:
    for d in demands_list:
        dist = dist_lookup.get((w, d), 9999)
        objective.SetCoefficient(x[w, d], dist)
objective.SetMinimization()

solver.Solve()

# Extract results
results = []
for w in warehouses_list:
    for d in demands_list:
        units = x[w, d].solution_value()
        if units > 0:
            results.append({'from': w, 'to': d, 'units': round(units)})

results_df = pd.DataFrame(results)
print(results_df)