import requests
import pandas as pd
import networkx as nx
import math
import csv
from collections import defaultdict

class HaversineCalculator:
    @staticmethod
    def calculate(lat1, lon1, lat2, lon2):
        """
        Calculate the great-circle distance between two points on the Earth
        using the Haversine formula.

        Parameters:
        lat1, lon1 : float : Latitude and Longitude of point 1 (in decimal degrees)
        lat2, lon2 : float : Latitude and Longitude of point 2 (in decimal degrees)

        Returns:
        float : Distance between the two points in kilometers
        """
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        R = 6371.0
        distance = R * c
        return distance

class FlightGraph:
    def __init__(self):
        self.graph = nx.Graph()
        self.coordinates = {}
        self.weather_api_key = 'b21a2633ddaac750a77524f91fe104e7'
        self.routes_file = 'datasets/routes.csv'
        self.airports_file = 'datasets/Full_Merge_of_All_Unique Airports.csv'

    def load_coordinates(self, encoding='utf-8'):
        with open(self.airports_file, 'r', encoding=encoding) as csvfile:
            csvreader = csv.reader(csvfile)
            next(csvreader)
            for row in csvreader:
                self.coordinates[row[1]] = [float(i) for i in row[2:4]]
                self.coordinates[row[1]].append(row[0])


    def load_flights(self, encoding='utf-8'):
        flights_df = pd.read_csv(self.routes_file, encoding=encoding)
        
        for index, row in flights_df.iterrows():
            departure_airport = row[2]
            arrival_airport = row[4]
            if (departure_airport   not in self.coordinates.keys() or arrival_airport not in self.coordinates.keys()):
                continue
            lat1, lon1 = self.coordinates[departure_airport][:2]
            lat2, lon2 = self.coordinates[arrival_airport][:2]
            distance = HaversineCalculator.calculate(lat1, lon1, lat2, lon2)
            #check (start or end) in birdstrike - > calculate severity
            self.graph.add_edge(departure_airport, arrival_airport, weight=distance)
            
  

    def calculate_bearing(self,cordinate1, cordinate2):
        """
        Calculate the bearing between two points on the earth's surface.
        
        Parameters:
        lat1 (float): Latitude of the starting point in degrees
        lon1 (float): Longitude of the starting point in degrees
        lat2 (float): Latitude of the ending point in degrees
        lon2 (float): Longitude of the ending point in degrees
        
        Returns:
        float: Bearing in degrees from the starting point to the ending point
        """
        
        # Convert degrees to radians
        lat1 = math.radians(cordinate1[0])
        lon1 = math.radians(cordinate1[1])
        lat2 = math.radians(cordinate2[0])
        lon2 = math.radians(cordinate2[1])
        
        # Calculate the difference in the longitudes
        delta_lon = lon2 - lon1
        
        # Calculate the components of the bearing formula
        x = math.sin(delta_lon) * math.cos(lat2)
        y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1) * math.cos(lat2) * math.cos(delta_lon))
        
        # Calculate the initial bearing in radians
        initial_bearing = math.atan2(x, y)
        
        # Convert the bearing from radians to degrees
        initial_bearing = math.degrees(initial_bearing)
        
        # Normalize the bearing to be between 0 and 360 degrees
        compass_bearing = (initial_bearing + 360) % 360
        
        return compass_bearing

    def update_weights_based_on_weather(self, airport,destination_airport,previous=None):
        weather_data = WeatherFetcher.fetch(self.coordinates[airport])
        weather_data_destination = WeatherFetcher.fetch(self.coordinates[destination_airport])
        for edge in self.graph.edges(data=True):
            
            if (edge[0] == airport or edge[1] == destination_airport) :
                #thunderstorm

                if 300 > weather_data['weather'][0]['id'] >= 200 or 300 > weather_data_destination['weather'][0]['id'] >=200:
                    if not previous:
                        return "Thunderstorm alert"
                    
                
                direction = self.calculate_bearing(self.coordinates[airport],self.coordinates[destination_airport])

                if 60> abs(direction-weather_data["wind"]["deg"]) >= 0 or 360> abs(direction-weather_data["wind"]["deg"]) >= 300:
                    edge[2]['weight'] *= 0.7


                elif 300> abs(direction-weather_data["wind"]["deg"]) >= 60:
                    edge[2]['weight'] *= 1.2


                if weather_data["main"]["temp"]>323.15 or weather_data["main"]["temp"]<218.5 :
                    edge[2]['weight'] *= 1.05   
                
    

                #rain
                if 600 > weather_data['weather'][0]['id'] >= 500 :
                    edge[2]['weight'] *= 1.1
                
                #snow
                elif 623 > weather_data['weather'][0]['id'] >= 600 :
                    edge[2]['weight'] *= 1.4
                
                #fog
                elif  weather_data['weather'][0]['id'] == 741 :
                    edge[2]['weight'] *= 1.3
                
                #volcanic ash
                elif  weather_data['weather'][0]['id'] == 762 :
                    edge[2]['weight'] *= 2.5
                
                elif  weather_data['weather'][0]['id'] == 741 :
                    edge[2]['weight'] *= 1.3
                
                #tornado
                elif  weather_data['weather'][0]['id'] == 781 :
                    edge[2]['weight'] *= 1000
                    return "Tornado"
               
        return ""
     
                
    def get_coordinates(self,val):
        return val in self.coordinates

    def find_shortest_path(self, start, end,previous=None):

        val=self.update_weights_based_on_weather(start,end,previous)
        l=[]
        if val:
            l.append(val)
            return l

        if not self.get_coordinates(val=start) or not self.get_coordinates(val=end):
            return l
        
        try:    
            path = nx.dijkstra_path(self.graph, start, end, weight='weight')
            # fuel_consumed =nx.dijkstra_path_length(self.graph, start, end, weight='weight')
        except:
            path=[]
        return path
        

class WeatherFetcher:
    @staticmethod
    def fetch(coordinate):
        weather_url = "http://api.openweathermap.org/data/2.5/weather"
        weather_params = {'appid': 'b21a2633ddaac750a77524f91fe104e7', 'lat': coordinate[0], 'lon': coordinate[1]}
        weather_response = requests.get(weather_url, params=weather_params)
        return weather_response.json()



