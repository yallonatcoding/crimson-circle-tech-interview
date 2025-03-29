import { useState, useEffect } from 'react'
import axios from 'axios'
import SelectBreed from '@/components/SelectBreed';
import DialogCatDetails from '@/components/DialogCatDetails';
import useIntersectionObserver from './hooks/useIntersectionObserver';

function App() {
  const [images, setImages] = useState([]);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const {isIntersecting, observerRef} = useIntersectionObserver();
  const [isGlobalSectionFetching, setIsGlobalSectionFetching] = useState(true);

  useEffect(() => {
    if (breeds.length <= 0) return;
    
    const getFeaturedImages = async () => {
      const axiosUrl = "https://api.thecatapi.com/v1/images/search";
      const axiosOptions = {
        params: {
          limit: '10',
          breed_ids: breeds.map((breed) => breed.id).join(",")
        },
      };
  
      try {
        const {data: breedImages} = await axios.get(axiosUrl, axiosOptions);
  
        // Since cannot get breed info in retrieved images,
        // I set up a promise list, each promise makes a new req for each image
        const images = (
          await Promise.all(
            breedImages.map(
              (image) => axios.get(`https://api.thecatapi.com/v1/images/${image.id}`)
            )
          )
        ).map(({data}) => data);
  
        setFeaturedImages(images)
      } catch (err) {
        console.error(err)
      }
    };

    getFeaturedImages();
  }, [breeds]);

  useEffect(() => {
    if (!selectedBreed) {
      setIsGlobalSectionFetching(true);
    }

    const getGlobalImages = () => {
      const axiosUrl = "https://api.thecatapi.com/v1/images/search";
      const axiosOptions = {
        params: {
          limit: '10',
          breed_ids: selectedBreed,
        },
      };
  
      axios
        .get(axiosUrl, axiosOptions)
        .then(({data: images}) => setImages(images))
        .catch((err) => console.error({err}))
        .finally(() => setIsGlobalSectionFetching(false)); // Since request could be resolved even as any error thrown, it is not fetching anymore 
    };

    getGlobalImages();
  }, [selectedBreed]);

  useEffect(() => {
    if (!selectedImage) return;

    setIsDialogOpen(true);
  }, [selectedImage]);

  useEffect(() => {
    // Infinite scrolling with any breed selected is not needed
    if (isGlobalSectionFetching || !isIntersecting || selectedBreed) return;

    const getGlobalImages = () => {
      const axiosUrl = "https://api.thecatapi.com/v1/images/search";
      const axiosOptions = {
        params: {
          limit: '10',
        },
      };
  
      axios
        .get(axiosUrl, axiosOptions)
        .then(({data: newImages}) => setImages((prev) => [
          ...prev,
          ...newImages
        ])) // TODO: filter repeated ids
        .catch((err) => console.error({err}))
        .finally(() => setIsGlobalSectionFetching(false)); // Since request could be resolved even as any error thrown, it is not fetching anymore 
    };

    getGlobalImages();
  }, [isIntersecting]);

  return (
    <main>
      <header>
        <nav className="h-max w-full p-4 bg-gray-100">
          <ul className="flex flex-row gap-4 w-full justify-between items-center">
            <li className='font-bold text-xl'>
              Catstagram
            </li>
  
            <li>
              <SelectBreed
                onBreedLoad={(breeds) => setBreeds(breeds)}
                onBreedChange={(breed) => setSelectedBreed(breed)}
              />
            </li>
          </ul>
        </nav>
      </header>

      <section className='w-full h-max p-4 max-w-full overflow-hidden'>
        <ul className='flex gap-4 justify-center items-center max-md:justify-start'>
          {featuredImages.map((image) => (
            <button
              className='flex flex-col items-center justify-center cursor-pointer aspect-square max-w-16 '
              key={JSON.stringify(image)}
            >
              <span className='rounded-full overflow-hidden aspect-square min-w-16 w-16 relative flex items-center justify-center'>
                <span
                  className="absolute inset-0 w-full h-full -z-10 blur-lg"
                  style={{
                    backgroundImage: `url(${image?.url})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }}
                />

                <img
                  src={image?.url}
                  alt={image?.p ?? ""}
                  onClick={() => setSelectedImage(image)}
                />
              </span>

              <h6 className='text-sm overflow-hidden text-ellipsis line-clamp-1'>
                <small>
                  {image.breeds[0].name}
                </small>
              </h6>
            </button>
          ))}
        </ul>
      </section>
      
      <section className="grid grid-cols-3 gap-2 max-sm:grid-cols-1 w-full h-max p-4 mx-auto -max-w-7xl">
        {images.map((image) => (
          <button
            key={JSON.stringify(image)}
            className='cursor-pointer relative overflow-hidden flex items-center justify-center aspect-square'
            onClick={() => setSelectedImage(image)}
          >
            <span
              className="absolute inset-0 w-full h-full -z-10 blur-lg opacity-30"
              style={{
                backgroundImage: `url(${image?.url})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat'
              }}
            />

            <img
              src={image?.url}
              alt={image?.p ?? ""}
            />
          </button>
        ))}

        {/* I personally prefer to use a div instead of trigger last item of any list as ref for intersectionObserver pattern */}
        {!selectedBreed && <div ref={observerRef}/>}
      </section>

      {isDialogOpen && (
        <DialogCatDetails
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedImage(null);
          }}
        >
          <article className='h-96 flex flex-col gap-2 p-2'>
            <h1 className='font-bold text-black overflow-hidden text-ellipsis line-clamp-1 text-base py-px text-center h-max'>
              {selectedImage?.breeds && selectedImage.breeds[0].name}
            </h1>

            <div className='flex-1 w-full flex justify-center items-center overflow-hidden self-center'>
              {selectedImage && <img
                className='max-h-full'
                src={selectedImage?.url}
                alt={selectedImage?.p ?? ""}
              />}
            </div>

            <p className='leading-relaxed p-4'>
              {selectedImage?.breeds
                ? selectedImage?.breeds[0].description
                : "No information available at the moment, we are working on it :)"}
            </p>
          </article>
        </DialogCatDetails>
      )}
    </main>
  )
}

export default App
