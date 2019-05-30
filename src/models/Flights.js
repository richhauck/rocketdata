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
  rocket_id: types.string,
  rocket_name: types.string,
  description: "",
  country: "",
  company: "",
  cost_per_launch: types.optional(types.number, 0),
  images: types.optional(types.array(types.string), []), 
})
.views(self => ({}))
.actions(self => ({
  setCountry(name){
    self.country = name;
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
  payload_type: types.string,
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
  rocket: types.maybeNull(Rocket),
  payload: types.optional(PayloadList, {}),
})
.views(self => ({
  getRocket(){
    return self.rocket.rocket_id;
  }
}))

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
  setRocket(id, rocket){
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
        let len = self.flightList.flight.length;
        let len2 = rockets.length;
 
        // loop through launches
        for(let i = 0; i < len; i++){
          let targetRocket = self.flightList.flight[i].rocket;
          // loop through rockets
          for(let j = 0; j < len2; j++){
            let rData = rockets[j];
            if(targetRocket.rocket_id == rData.rocket_id){
              targetRocket.description = rData.description;
              targetRocket.country = rData.country;
              targetRocket.company = rData.company;
              targetRocket.cost_per_launch = rData.cost_per_launch;
              targetRocket.images = rData.flickr_images;
            }
          }
        }

        console.log('self.flightList.flight', self.flightList.getFlight(2))
    
      }catch(e){
          console.log('aborted', e);
      }
    }),
    load: flow(function* load(){
      try{
        const response = yield window.fetch('https://api.spacexdata.com/v3/launches');
        const launches = yield response.json();


        // Loop through flight list
        let formattedLaunches = launches;
        let len = self.flightList.flight.length;
 
        // loop through launches
        for(let i = 0; i < len; i++){
          formattedLaunches[i].payload = launches[i].
        }


        self.flightList.flight.push(...launches);

        // Once launches have loaded, load rocket data
        self.loadRockets();
      }catch(e){
          console.log('aborted', e);
      }
    })
}));
