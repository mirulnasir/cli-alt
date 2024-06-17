## Requirements

You are required to build a command line application to calculate the estimated delivery time for every package by maximizing the number of packages in every shipment.

## Delivery Criteria

The delivery can be made using the criteria illustrated below:

- Shipment should contain the maximum number of packages a vehicle can carry in a trip.
- Prefer heavier packages when there are multiple shipments with the same number of packages.
- If the weights are also the same, preference should be given to the shipment which can be delivered first.

## Input Format

- `base_delivery_cost` `no_of_packages`
- `pkg_id1` `pkg_weight1_in_kg` `distance1_in_km` `offer_code1`
- ...
- `no_of_vehicles` `max_speed` `max_carriable_weight`

## Sample input format

```
100 5
PKG1 50 30 OFR001
PKG2 75 125 OFR008
PKG3 175 100 OFR003
PKG4 110 60 OFR002
PKG5 155 95 NA
2 70 200
```

## Output format

- `pkg_id1` `discount1` `total_cost1` `estimated_delivery_time1_in_hours`

## Sample output

```
 PKG1 0 750 3.98
 PKG2 0 1475 1.78
 PKG3 0 2350 1.42
 PKG4 105 1395 0.85
 PKG5 0 2125 4.19
```

## Summary

- Packages 05 Vehicles 02 Max Speed 70km/hr Max load 200kg
- Packages Remaining: 05

## Important note

- Each Vehicle has a on limit (L) maximum weight (kg)
- that it can carry.
- speed (S km/hr) same route.
- All Vehicles travel at the same and in the same route.
- It is assumed that all the destinations can be covered in a single route.

// STEP 1
// Packages Remaining: 05
// Vehicles Available: 02 | Current Time: 0 hrs
// Find all possible combinations of packages under max load
// PKG1 (50kg) + PKG2 (75kg) = 2 packages (125kg)
// PKG1 (50kg) + PKG4 (110kg) = 2 package (160kg)
// PKG2 (75kg) + PKG4 (110kg) = 2 package (185kg)
// above 3 are the only possible combinations
// So vehicle 01 will deliver 2 packages
// Delivering PKG2 , time = 125kg/70km/hr = 1.78 hrs
// Delivering PKG4 , time = 60kg/70km/hr = 0.85 hrs
// Vehicle 01 will be available after 2\*1.78 = 3.56 hrs
// not 1.78 + 0.85 = 2.63 hrs
