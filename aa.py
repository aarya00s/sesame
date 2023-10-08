import matplotlib.pyplot as plt

# Example data
years = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021']
funding = [100, 150, 200, 250, 300, 350, 400, 450]

plt.bar(years, funding)
plt.xlabel('Year')
plt.ylabel('Funding (in millions USD)')
plt.title('Funding Instances for Large Volume Wearable Injectors (2014-2021)')
plt.show()
