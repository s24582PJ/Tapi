import { clientTeam } from '../client.js';

// Test pobierania wszystkich drużyn
clientTeam.GetTeams({}, (error, response) => {
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('GetTeams Response:', response);
});

// Test dodawania drużyny
const newTeam = {
    team_id: "1610612799",
    nickname: "Test Team",
    city: "Test City",
    arena: "Test Arena",
    owner: "Test Owner"
};

clientTeam.AddTeam({ team: newTeam }, (error, response) => {
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('AddTeam Response:', response);
}); 