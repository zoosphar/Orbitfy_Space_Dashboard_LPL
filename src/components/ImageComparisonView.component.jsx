import { Skeleton } from "@mui/material";
import { get } from "lodash";

function ImageComparisonView({
  originalImageURL,
  processedImageURL,
  imageMetrics,
  isLoading,
}) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="h-[50%] bg-[#2B2D33] w-full rounded-xl overflow-scroll relative">
        {isLoading ? (
          <Skeleton
            height={"100vh"}
            animation="wave"
            className="mb-4 w-full bg-white"
          />
        ) : (
          <img
            src={originalImageURL}
            className="object-cover object-top w-full h-auto"
          />
        )}
        <span className="bg-white rounded-full px-4 py-0.5 font-bold absolute z-30 top-2 right-2">
          Original
        </span>
      </div>
      <div className="h-[50%] bg-[#2B2D33] w-full rounded-xl overflow-x-scroll overflow-y-scroll relative">
        {isLoading ? (
          <Skeleton
            height={"100vh"}
            animation="wave"
            className="mb-4 w-full bg-white"
          />
        ) : (
          <img
            src={processedImageURL}
            className="object-cover object-top w-full h-auto"
          />
        )}
        <span className="bg-white rounded-full px-4 py-0.5 font-bold absolute z-30 top-2 right-2">
          Result
        </span>
      </div>
    </div>
  );
}

export default ImageComparisonView;
