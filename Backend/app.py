from navigator import FlightGraph
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin



app=Flask(__name__)
cors = CORS(app, support_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/shortest_path', methods=['GET','POST'])
@cross_origin(supports_credentials=True)
def get_shortest_path():
    
    try:
        start_airport = request.args.get('start')
        end_airport = request.args.get('end')
        intermediate_nodes = request.args.get('int')
        print(start_airport,end_airport)
        if not all([start_airport, end_airport]):
            return jsonify({"error": "Please provide start and end parameters"})
        

        
        route = flight_graph.find_shortest_path(start_airport, end_airport,intermediate_nodes)

        if not route:
            return jsonify({"error": f"No path found between {start_airport} and {end_airport}"})
        if "Tornado" in route or "Thunderstorm alert" in route:
            return jsonify({"error": f"No Flight Available Because of {route[0]}"})
        
        print(route)

        return jsonify({"route": route})
    
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/")
def test():

    return 'this is working'


if __name__ == "__main__":

    flight_graph = FlightGraph()
    flight_graph.load_coordinates()
    flight_graph.load_flights()

    app.run(debug=True,host="0.0.0.0",port=5635)