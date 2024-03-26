import pandas as pd

# Read the data from data.csv
data = pd.read_csv("data.csv")

# Filter data for individuals who had a heart attack
heart_attack_data = data[data['HadHeartAttack'] == 'Yes']

# Group data by Age Category and Smoker Status, and calculate the counts
grouped_data = heart_attack_data.groupby(['AgeCategory', 'SmokerStatus']).size().unstack(fill_value=0)

# Calculate the percentage of each smoker status within each age category
grouped_data_percentage = grouped_data.div(grouped_data.sum(axis=1), axis=0) * 100

# Save the results to a new CSV file
grouped_data_percentage.to_csv("stack_bar.csv")
# Print the resulting DataFrame
print(grouped_data_percentage)
