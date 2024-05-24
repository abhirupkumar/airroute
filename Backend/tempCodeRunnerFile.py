
    return 'this is working'


if __name__ == "__main__":

    flight_graph = FlightGraph()
    flight_graph.load_coordinates()
    flight_graph.load_flights()

    app.run(debug=True)