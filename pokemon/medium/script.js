document.getElementById('fetch-pokemons').addEventListener('click', fetchPokemons);

let userPokemons = [];
let computerPokemon = null;

async function fetchPokemons() {
    userPokemons = await Promise.all(Array.from({ length: 5 }, () => fetchRandomPokemon()));
    displayPokemonChoices(userPokemons);
    updateRemainingPokemons();
}

function displayPokemonChoices(pokemons) {
    const choicesDiv = document.getElementById('pokemon-choices');
    choicesDiv.innerHTML = '';
    pokemons.forEach((pokemon, index) => {
        const pokemonDiv = document.createElement('div');
        pokemonDiv.classList.add('pokemon-choice');
        pokemonDiv.innerHTML = `
            <h3>${pokemon.name}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        `;
        pokemonDiv.addEventListener('click', () => startBattle(pokemon, index));
        choicesDiv.appendChild(pokemonDiv);
    });
}

async function startBattle(userPokemon, index) {
    computerPokemon = await fetchRandomPokemon();
    const winner = determineWinner(userPokemon, computerPokemon);
    handleBattleResult(userPokemon, computerPokemon, winner, index);
    updateRemainingPokemons();
}

async function fetchPokemonData(name) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function fetchRandomPokemon() {
    const maxPokemonId = 898; // As of the last update, there are 898 Pokémon
    const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
    return await fetchPokemonDataById(randomId);
}

async function fetchPokemonDataById(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function determineWinner(pokemon1, pokemon2) {
    const pokemon1Power = calculatePower(pokemon1);
    const pokemon2Power = calculatePower(pokemon2);

    if (pokemon1Power > pokemon2Power) {
        return pokemon1;
    } else if (pokemon2Power > pokemon1Power) {
        return pokemon2;
    } else {
        return null; // It's a tie
    }
}

function calculatePower(pokemon) {
    // A simple power calculation based on stats
    const { hp, attack, defense, speed } = pokemon.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
    }, {});
    return hp + attack + defense + speed;
}

function handleBattleResult(userPokemon, computerPokemon, winner, userPokemonIndex) {
    const resultDiv = document.getElementById('battle-result');
    const userPokemonImgContainer = document.getElementById('user-pokemon-img-container');
    const computerPokemonImgContainer = document.getElementById('computer-pokemon-img-container');

    if (winner === userPokemon) {
        userPokemons.push(computerPokemon);
        resultDiv.innerHTML = `<h2>You won! You gained ${computerPokemon.name}!</h2>`;
    } else if (winner === computerPokemon) {
        userPokemons.splice(userPokemonIndex, 1);
        resultDiv.innerHTML = `<h2>You lost! You lost ${userPokemon.name}!</h2>`;
    } else {
        resultDiv.innerHTML = '<h2>It\'s a tie!</h2>';
    }

    resultDiv.innerHTML += `
        <p>${userPokemon.name} (Power: ${calculatePower(userPokemon)}) vs ${computerPokemon.name} (Power: ${calculatePower(computerPokemon)})</p>
    `;

    userPokemonImgContainer.innerHTML = `
        <h3>${userPokemon.name}</h3>
        <img src="${userPokemon.sprites.front_default}" alt="${userPokemon.name}">
    `;

    computerPokemonImgContainer.innerHTML = `
        <h3>${computerPokemon.name}</h3>
        <img src="${computerPokemon.sprites.front_default}" alt="${computerPokemon.name}">
    `;

    if (userPokemons.length === 0) {
        resultDiv.innerHTML += '<h2>Sorry, you lost! You have no more Pokémon left.</h2>';
        document.getElementById('pokemon-choices').innerHTML = ''; // Clear choices if the player has no Pokémon left
    } else {
        displayPokemonChoices(userPokemons); // Display remaining Pokémon choices
    }
}

function updateRemainingPokemons() {
    const remainingPokemonsDiv = document.getElementById('remaining-pokemons');
    remainingPokemonsDiv.innerHTML = `Remaining Pokémon: ${userPokemons.length}`;
}
