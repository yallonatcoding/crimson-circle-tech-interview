import { useEffect, useState } from "react";
import axios from "axios";

const SelectBreed = ({onBreedChange, onBreedLoad}) => {
    const [breeds, setBreeds] = useState([]);

    useEffect(() => {
      const axiosUrl = "https://api.thecatapi.com/v1/breeds";
      
      axios
        .get(axiosUrl)
        .then(({data: breeds}) => setBreeds(breeds))
        .catch((err) => console.error({err}));
    }, []);

    useEffect(() => {
      onBreedLoad(breeds);
    }, [breeds, onBreedLoad]);

    return (
      <select
        id="breed-dropdownmenu"
        className="rounded-md text-base outline-none cursor-pointer"
        onChange={(event) => onBreedChange(event.target.value)}
      >
        <option
          value=""
          selected
        >
          Select breed
        </option>

        {breeds.map((breed) => (
          <option
            key={JSON.stringify(breed)}
            value={breed.id}
          >
            {breed.name}
          </option>
        ))}
    </select>
    )
}

export default SelectBreed