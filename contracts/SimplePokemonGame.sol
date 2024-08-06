// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimplePokemonGame {
    // Struct to hold Pokemon data
    struct Pokemon {
        string name;  // Pokemon's name
        int trustLevel;  // Trust level of the Pokemon
    }

    // Array to store 3 Pokemon
    Pokemon[3] public pokemons;

    // Constructor to initialize the array with 3 Pokemon
    constructor() {
        pokemons[0] = Pokemon("Pikachu", 75);
        pokemons[1] = Pokemon("Charmander", 50);
        pokemons[2] = Pokemon("Crustle", 25);
    }

    // Function to feed a Pokemon with a fruit
    function feedPokemon(uint pokemonIndex, string memory fruit) public {
        require(pokemonIndex < pokemons.length, "Invalid Pokemon index");  // Check if index is valid
        require(bytes(pokemons[pokemonIndex].name).length > 0, "No Pokemon in the team");  // Check if Pokemon exists

        // Check which fruit is given and adjust trust level
        if (compareStrings(fruit, "apple")) {
            pokemons[pokemonIndex].trustLevel += 5;  // Increase trust level if fruit is apple
        } else if (compareStrings(fruit, "orange")) {
            pokemons[pokemonIndex].trustLevel -= 5;  // Decrease trust level if fruit is orange
        } else {
            revert("Unknown fruit");  // If fruit is neither apple nor orange, show an error
        }

        // Ensure trust level is between 0 and 100
        assert(pokemons[pokemonIndex].trustLevel >= 0 && pokemons[pokemonIndex].trustLevel <= 100);

    }

    // Function to get a Pokemon's name and trust level
    function getPokemonDetail(uint pokemonIndex) public view returns (string memory, int) {
        require(pokemonIndex < pokemons.length, "Invalid Pokemon index");  // Check if index is valid
        require(bytes(pokemons[pokemonIndex].name).length > 0, "No Pokemon in the team");  // Check if Pokemon exists
        return (pokemons[pokemonIndex].name, pokemons[pokemonIndex].trustLevel);  // Return the name and trust level
    }


    // Internal function to compare two strings
    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (bytes(a).length == bytes(b).length) && (compareBytes(bytes(a), bytes(b)));
    }

    // Internal function to compare two byte arrays
    function compareBytes(bytes memory a, bytes memory b) internal pure returns (bool) {
        if (a.length != b.length) {
            return false;  // If lengths are different, strings are not equal
        }

        for (uint i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;  // If any byte is different, strings are not equal
            }
        }

        return true;  // Strings are equal
    }
}