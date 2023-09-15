import Header from "../components/Header.component";
import ImageComparisonView from "../components/ImageComparisonView.component";
import ImageMetricsTable from "../components/ImageMetricsTable.component";
import ImageSelectorPane from "../components/ImageSelectorPane.component";
import Slider from "../components/Slider.component";
import UploadImage from "../components/UploadImage.component";
import { fetchInitialData } from "../utils/fetchInitialData";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { get, orderBy, remove } from "lodash";
import { markImageAsRemoved, postFeaturedImage } from "../utils/imageActions";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  WEBSOCKET_CONNECTION_URL,
  WEBSOCKET_CONNECTION_URL_PROD,
} from "../utils/constants";
import { useEffect, useState } from "react";

function Dashboard({ handleLogout }) {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const { data, isLoading, isError, error, refetch } = useQuery(
    ["apiData", selectedFilters],
    () => fetchInitialData(selectedFilters),
    { enabled: false }
  );

  const { lastMessage, readyState } = useWebSocket(WEBSOCKET_CONNECTION_URL);

  const [selectedImageData, setSelectedImageData] = useState({});
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false);

  const recentImages = get(data, "recentImages", []);
  const featuredImages = get(data, "featuredImages", []);
  const mlModelMap = get(data, "mlModelMap", []);
  const imageMetrics = get(selectedImageData, "metadata.metaData", []) || [];
  const selectedOriginalImageURL = get(selectedImageData, "original", "");
  const selectedProcessedImageURL = get(selectedImageData, "overlay", "");

  const [localRecentImages, setLocalRecentImages] = useState(recentImages);
  const [localFeaturedImages, setLocalFeaturedImages] =
    useState(featuredImages);

  useEffect(() => {
    refetch({ selectedFilters });
  }, [selectedFilters]);

  useEffect(() => {
    setLocalRecentImages(recentImages);
    setLocalFeaturedImages(featuredImages);
  }, [data]);

  useEffect(() => {
    if (lastMessage !== null) {
      // Process the received message data here
      let data = JSON.parse(get(lastMessage, "data", {}))["message"];
      data["file_key"] = get(data, "metadata.originalImage", "")
        .split("_")
        .slice(0, -1)
        .join("_");
      delete data["type"];
      const mockRecentImages = [...localRecentImages];
      mockRecentImages.unshift(data);
      setLocalRecentImages(mockRecentImages);
    }
  }, [lastMessage]);

  const queryClient = useQueryClient();
  const postFeaturedImageMutation = useMutation(postFeaturedImage);
  const markImageAsRemovedMutation = useMutation(markImageAsRemoved);

  useEffect(() => {
    if (!isInitialDataFetched) {
      refetch();
      setIsInitialDataFetched(true);
    }
  }, []);

  const handleFeatureImage = (image, index) => {
    const imageFileKey = get(image, "file_key", index);

    postFeaturedImageMutation.mutate(
      { fileKey: imageFileKey, method: "POST" },
      {
        onSuccess: (data) => {
          if (get(data, "statusCode", null) === 200) {
            const mockRecentImages = localRecentImages;
            remove(mockRecentImages, (obj) => obj["file_key"] === imageFileKey);
            setLocalRecentImages(mockRecentImages);
            setLocalFeaturedImages([...localFeaturedImages, image]);
          }
        },
      }
    );
  };

  const handleRemoveFeatureImage = (image, index) => {
    const imageFileKey = get(image, "file_key", index);
    postFeaturedImageMutation.mutate(
      { fileKey: imageFileKey, method: "DELETE" },
      {
        onSuccess: (data) => {
          if (get(data, "statusCode", null) === 200) {
            queryClient.invalidateQueries("apiData");
            const mockFeaturedImages = localFeaturedImages;
            remove(
              mockFeaturedImages,
              (obj) => obj["file_key"] === imageFileKey
            );
            setLocalFeaturedImages(mockFeaturedImages);
            const newImagesArray = orderBy(
              [...localRecentImages, image],
              ["metadata.LastModified"],
              ["desc"]
            );
            setLocalRecentImages(newImagesArray);
          }
        },
      }
    );
  };

  const handleRemoveImage = (image, index) => {
    const imageFileKey = get(image, "file_key", index);
    markImageAsRemovedMutation.mutate(
      { fileKey: imageFileKey, method: "POST" },
      {
        onSuccess: (data) => {
          if (get(data, "statusCode", null) === 200) {
            queryClient.invalidateQueries("apiData");
            const mockRecentImages = localRecentImages;
            remove(mockRecentImages, (obj) => obj["file_key"] === imageFileKey);
            setSelectedImageData(mockRecentImages[0]);
            setLocalRecentImages(mockRecentImages);
          }
        },
      }
    );
  };

  return (
    <div className="App h-[100vh]">
      <div className="grid grid-cols-12 grid-rows-6 gap-4 h-full">
        <div className="col-span-12 row-span-1">
          <Header handleLogout={handleLogout} />
        </div>
        <div className="col-span-1 row-span-6 h-full flex gap-4 flex-col">
          <UploadImage modelNameArray={mlModelMap} />
          <ImageSelectorPane
            recentImages={localRecentImages}
            featuredImages={localFeaturedImages}
            isLoading={isLoading}
            mlModelMap={mlModelMap}
            selectedImageData={selectedImageData}
            setSelectedImageData={setSelectedImageData}
            handleFeatureImage={handleFeatureImage}
            handleRemoveFeatureImage={handleRemoveFeatureImage}
            handleRemoveImage={handleRemoveImage}
            refetchInitialDataAPI={refetch}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>
        <div className="col-start-2 col-span-5 row-span-6">
          <ImageComparisonView
            originalImageURL={selectedOriginalImageURL}
            processedImageURL={selectedProcessedImageURL}
            imageMetrics={imageMetrics}
            isLoading={isLoading}
          />
        </div>
        <div className="col-start-7 col-span-6 row-span-1">
          <Slider />
        </div>
        <div className="col-start-7 col-span-6 row-span-5">
          <ImageMetricsTable metrics={imageMetrics} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
