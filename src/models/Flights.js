import {types, flow, getParent, applySnapshot, getSnapshot, onSnapshot} from "mobx-state-tree";

/*
[{
  flight_number: 39,
  mission_name: "NROL-76",
  description: '',
  launch_date_unix: 1493637300,
  rocket: {
    rocket_id: 'falcon9',
    rocket_name: 'Falcon 9',
    description: 'Falcon 9 is a two-stage rocket designed and manufactured by SpaceX for the reliable and safe transport of satellites and the Dragon spacecraft into orbit.',
    country: 'United States',
    company: 'SpaceX',
    cost_per_launch: 50000000,
    images: [
      "https://farm1.staticflickr.com/929/28787338307_3453a11a77_b.jpg",
      "https://farm4.staticflickr.com/3955/32915197674_eee74d81bb_b.jpg",
      "https://farm1.staticflickr.com/293/32312415025_6841e30bf1_b.jpg"
    ]
  },
  payloads: [{
    payload_id: "NROL-76",
    reused: false,
    nationality: 'United States',
    manufacturer: 'Boeing',
    type: 'Satellite',
    customers: ['NRO']
  }]
}]
*/
const Rocket = types
.model({
  rocket_id: types.number,
  rocket_name: types.string,
  description: "",
  country: types.string,
  company: types.string,
  launch_date_unix: types.number,
  cost_per_launch: types.number,
  images: types.optional(types.array(types.string), []), 
})
.views(self => ({}))
.actions(self => ({
  setRocketName(name){
    self.rocket_name = name;
  }
}));

const RocketList = types.model({
  rocket: types.optional(types.array(Rocket), []),
});

const Payload = types
.model({
  payload_id: types.string,
  reused: types.boolean,
  nationality: types.string,
  manufacturer: types.string,
  type: types.string,
  customers: types.optional(types.array(types.string), []),
});
const PayloadList = types.model({
  payload: types.optional(types.array(Payload), []),
});

const Flight = types
.model({
  flight_number: types.number,
  mission_name: types.string,
  description: "",
  launch_date_unix: types.number,
  rocket: types.optional(RocketList, {}),
  //payload: types.optional(types.array(Payload), []),
  payload: types.optional(PayloadList, {}),
});

const FlightList = types
.model({
  flight: types.optional(types.array(Flight), [])
})
.views(self => ({
  getFlight(id){
    return self.flight[id].toJSON();
  }
}))
.actions(self => ({
  setRocketData(id, rocket){
    self.flight[id].rocket = rocket;
  }
}));


/**
 * Loads launches data, then rockets data upon creation
 */
export const Flights = window.flights = types
.model({
  flightList: types.optional(FlightList, {}),
})
.views(self => ({
  get mylist() {
      console.log(self.flightList.toJSON());
  }
}))
.actions(self => ({
    afterCreate(){
        self.load();
    },
    loadRockets: flow(function* load(){
      try{
        const response = yield window.fetch('https://api.spacexdata.com/v3/rockets');
        const rockets = yield response.json();

        // Loop through flight list
        console.log('self.flightList.flight', self.flightList.getFlight(11))
        /*
        for(let i = 0; i < self.flightList.flight; i++){
          console.log(self.flightList.getFlight(11))
        }
        */


      }catch(e){
          console.log('aborted', e);
      }
    }),
    load: flow(function* load(){
      try{
        const response = yield window.fetch('https://api.spacexdata.com/v3/launches');
        const launches = yield response.json();
        self.flightList.flight.push(...launches);

        // Once launches have loaded, load rocket data
        self.loadRockets();
      }catch(e){
          console.log('aborted', e);
      }
    })
}));
