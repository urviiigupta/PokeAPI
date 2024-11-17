document.getElementById('start-battle').addEventListener('click', startBattle);

async function startBattle() {
    const userPokemonName = document.getElementById('user-pokemon').value.toLowerCase();

    const userPokemon = await fetchPokemonData(userPokemonName);
    const computerPokemon = await fetchRandomPokemon();

    if (userPokemon && computerPokemon) {
        const winner = determineWinner(userPokemon, computerPokemon);
        displayResult(userPokemon, computerPokemon, winner);
    } else {
        document.getElementById('battle-result').innerText = 'Please enter a valid Pokémon name.';
    }
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

function displayResult(userPokemon, computerPokemon, winner) {
    const resultDiv = document.getElementById('battle-result');
    const userPokemonImgContainer = document.getElementById('user-pokemon-img-container');
    const computerPokemonImgContainer = document.getElementById('computer-pokemon-img-container');

    if (winner) {
        resultDiv.innerHTML = `<h2>The winner is ${winner.name}!</h2>`;
    } else {
        resultDiv.innerHTML = '<h2>It\'s a tie!</h2>';
    }

    resultDiv.innerHTML += `
        <p>${userPokemon.name} (Power: ${calculatePower(userPokemon)})</p>
        <p>${computerPokemon.name} (Power: ${calculatePower(computerPokemon)})</p>
    `;

    userPokemonImgContainer.innerHTML = `
        <h3>${userPokemon.name}</h3>
        <img src="${userPokemon.sprites.front_default}" alt="${userPokemon.name}">
    `;

    computerPokemonImgContainer.innerHTML = `
        <h3>${computerPokemon.name}</h3>
        <img src="${computerPokemon.sprites.front_default}" alt="${computerPokemon.name}">
    `;
}
