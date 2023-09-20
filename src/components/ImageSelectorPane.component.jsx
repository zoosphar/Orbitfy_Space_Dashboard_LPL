import React, { useEffect, useMemo, useRef, useState } from "react";
import { map, get, isEmpty } from "lodash";
import StarIcon from "../static/img/ic-round-star.svg";
import SepearatorIcon from "../static/img/vector-5.svg";
import OutlinedStar from "../static/img/outlined-star.svg";
import RemoveIcon from "../static/img/remove.png";
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Popover,
  Skeleton,
} from "@mui/material";
import { FaPause, FaPlay } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import FilterIcon from "../static/icons/mi_filter.png";
import { grey } from "@mui/material/colors";

function ImageSelectorPane({
  recentImages,
  featuredImages,
  isLoading,
  selectedImageData,
  setSelectedImageData,
  handleFeatureImage,
  handleRemoveFeatureImage,
  handleRemoveImage,
  mlModelMap,
  refetchInitialDataAPI,
  selectedFilters,
  setSelectedFilters,
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedImageType, setSelectedImageType] = useState("recent");
  const [isPlaying, setIsPlaying] = useState(false);
  const playImageInterval = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [favoritedIndex, setFavoritedIndex] = useState(null);

  const handleCheckboxChange = (modelName) => {
    setSelectedFilters((prevSelectedFilters) => {
      // Check if the modelName is already in the selectedFilters array
      const index = prevSelectedFilters.indexOf(modelName);
      handleFilterClose();
      if (index === -1) {
        // If not, add it to the array and make a initial API call again with filter
        return [...prevSelectedFilters, modelName];
      } else {
        // If it's already in the array, remove it
        return prevSelectedFilters.filter((id) => id !== modelName);
      }
    });
  };

  const handleSelectImage = (imageData, index, type) => {
    setSelectedImageData(imageData);
    setSelectedImageIndex(index);
    setSelectedImageType(type);
  };

  useEffect(() => {
    handleSelectImage(recentImages[0], 0, "recent");
  }, [recentImages]);

  const recentImagesRenderer = useMemo(
    () =>
      map(recentImages, (image, index) => (
        <div
          className="w-full relative"
          key={index}
          onMouseEnter={() => setFavoritedIndex(index)}
          onMouseLeave={() => setFavoritedIndex(null)}
        >
          <img
            className={`h-5 absolute top-[-6px] left-[-7px] cursor-pointer ${
              favoritedIndex === index ? "opacity-100" : "opacity-0"
            }`}
            alt="delete bin icon"
            data-tooltip="Delete Image"
            src={RemoveIcon}
            onClick={() => handleRemoveImage(image, index)}
          />
          <img
            onClick={() => handleSelectImage(image, index, "recent")}
            className={`object-cover rounded mb-4 cursor-pointer w-full aspect-square ${
              index === selectedImageIndex &&
              selectedImageType === "recent" &&
              "border-4 border-[#6b38fa] border-solid"
            }`}
            alt="Img"
            src={get(image, "original", "")}
            key={get(image, "file_key", index)}
          />
          <img
            className={`h-7 absolute rotate-45 top-[-12px] right-[-14px] cursor-pointer ${
              favoritedIndex === index ? "opacity-100" : "opacity-0"
            }`}
            alt="Ic round star"
            data-tooltip="Feature Image"
            src={OutlinedStar}
            onClick={() => handleFeatureImage(image, index)}
          />
        </div>
      )),
    [recentImages, selectedImageIndex, selectedImageType, favoritedIndex]
  );

  const featuredImagesRenderer = useMemo(
    () =>
      map(featuredImages, (image, index) => (
        <div
          className={`relative flex justify-center cursor-pointer pb-4 w-full`}
          key={get(image, "file_key", index)}
        >
          <img
            className="h-10 absolute top-[-18px] right-[-17px] cursor-pointer"
            alt="Ic round star"
            src={StarIcon}
            onClick={() => handleRemoveFeatureImage(image, index)}
          />
          <img
            className={`object-cover rounded w-full aspect-square ${
              index === selectedImageIndex &&
              selectedImageType === "featured" &&
              "border-4 border-[#6b38fa] border-solid"
            }`}
            alt="Unsplash gvptkmonylk"
            src={get(image, "original", "")}
            onClick={() => handleSelectImage(image, index, "featured")}
          />
        </div>
      )),
    [featuredImages, selectedImageIndex, selectedImageType]
  );

  const handlePlayFeaturedImages = () => {
    if (playImageInterval.current) {
      clearInterval(playImageInterval.current);
      playImageInterval.current = null;
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playImageInterval.current = setInterval(() => {
        setSelectedImageIndex((prevIndex) => {
          const nextIndex =
            prevIndex === featuredImages.length - 1 ? 0 : prevIndex + 1;
          console.log(
            "nextIndex:",
            nextIndex,
            selectedImageIndex,
            selectedImageIndex === featuredImages.length - 1
          );
          handleSelectImage(featuredImages[nextIndex], nextIndex, "featured");
          return nextIndex;
        });
      }, 3000);

      // Initial selection for 0th index when starting the loop
      handleSelectImage(featuredImages[0], 0, "featured");
    }
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const filterOpen = Boolean(anchorEl);
  const filterId = filterOpen ? "popover-filter" : undefined;

  return (
    <div className="p-2 rounded bg-[#2B2D33] h-full overflow-scroll relative">
      {isLoading ? (
        <>
          <Skeleton height={100} width={100} className="mb-4" />
          <Skeleton height={100} width={100} className="mb-4" />
          <Skeleton height={100} width={100} className="mb-4" />
          <Skeleton height={100} width={100} className="mb-4" />
          <Skeleton height={100} width={100} className="mb-4" />
          <Skeleton height={100} width={100} className="mb-4" />
          <Skeleton height={100} width={100} className="mb-4" />
          <Skeleton height={100} width={100} className="mb-4" />
          <Skeleton height={100} width={100} className="mb-4" />
        </>
      ) : (
        <>
          <div className="flex mb-4 justify-between items-center">
            <button
              className="border border-1 border-gray-200 rounded-full p-1 flex justify-center items-center"
              onClick={handlePlayFeaturedImages}
            >
              {isPlaying ? (
                <FaPause className="text-gray-200" size={15} />
              ) : (
                <FaPlay className="text-gray-200" size={15} />
              )}
            </button>
            <button
              aria-describedby={filterId}
              className="border border-1 flex items-center border-gray-200 rounded px-1 py-1 text-xs text-gray-200"
              onClick={handleFilterClick}
            >
              {!isEmpty(selectedFilters) && (
                <GoDotFill
                  size={20}
                  color="#FFC000"
                  className="absolute top-0 right-0"
                />
              )}
              Filter
              <img src={FilterIcon} alt="" className="h-3" />
            </button>
            <Popover
              id={filterId}
              open={filterOpen}
              anchorEl={anchorEl}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <FormGroup className=" bg-[#2B2D33] p-2 text-white">
                {map(mlModelMap, (model) => (
                  <FormControlLabel
                    key={get(model, "modelId", "")}
                    control={
                      <Checkbox
                        defaultChecked={selectedFilters.includes(
                          get(model, "modelName", "")
                        )}
                        onChange={() =>
                          handleCheckboxChange(get(model, "modelName", ""))
                        }
                      />
                    }
                    label={get(model, "modelName", "")}
                  />
                ))}
              </FormGroup>
            </Popover>
          </div>
          {/* Feature Images */}
          <div className="">{featuredImagesRenderer}</div>
          {/* Seperator */}
          {!isEmpty(featuredImagesRenderer) && (
            <Divider className=" bg-gray-500" />
          )}

          {/* Recent Images */}
          <div className="flex flex-col justify-start items-center pt-4">
            {recentImagesRenderer}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageSelectorPane;
