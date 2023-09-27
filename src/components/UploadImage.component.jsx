import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { FileUploader } from "react-drag-drop-files";
import UploadImageIcon from "../static/icons/upload_icon.png";
import { FaTimes } from "react-icons/fa";
import { useRef, useState } from "react";
import AWS from "aws-sdk";
import { SAVE_IMAGE_METADATA_API_URL } from "../utils/constants";
import { useMutation } from "react-query";
import { saveImageMetadata } from "../utils/imageActions";
import { get, isEmpty, map } from "lodash";
import { toast } from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";

const CssTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#A0AAB4",
  },
  "& label": {
    color: "#A0AAB4",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    color: "#A0AAB4",
    "& fieldset": {
      borderColor: "#E0E3E7",
    },
    "&:hover fieldset": {
      borderColor: "#B2BAC2",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6F7E8C",
    },
  },
});

AWS.config.update({
  region: "us-east-1", // e.g., 'us-east-1'
  accessKeyId: "AKIAXNSGGXPRACC3E77Q",
  secretAccessKey: "1UPiBtKNiHL0ZCX5w2kUqkdhvZEclfdoQ3In4o8L",
});

const s3 = new AWS.S3({
  params: { Bucket: "dev-lpl-dash-input-images" },
  region: "us-east-1",
});

const fileTypes = ["JPG", "PNG", "GIF", "TIFF", "HD5"];

function UploadImage({ modelNameArray }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("0%");
  const [uploadingImage, setUploadingImage] = useState(false);
  const tagName = useRef(null);
  const modelName = useRef(null);
  const saveImageMetadataAPI = useMutation(saveImageMetadata);

  const handleFileSelect = (file) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setImageData(event.target.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async () => {
    if (!imageFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!tagName.current.value) {
      toast.error("Please enter a tag name for the image");
      return;
    }
    if (!modelName.current.value) {
      toast.error("Please select a model name");
      return;
    }
    const params = {
      Bucket: "dev-lpl-dash-input-images",
      Key: imageFile.name,
      Body: imageFile,
    };
    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        setUploadProgress(parseInt((evt.loaded * 100) / evt.total) + "%");
      })
      .promise();

    try {
      setUploadingImage(true);
      await upload; // Wait for the upload to complete

      // Once the upload is successful, make a POST request to your API endpoint
      saveImageMetadataAPI.mutate(
        {
          imageName: imageFile.name,
          tagName: tagName.current.value,
          modelName: modelName.current.value,
        },
        {
          onSuccess: (data) => {
            if (get(data, "statusCode", null) === 200) {
              toast.success("Image uploaded successfully");
              setIsModalVisible(false);
            }
          },
          onError: (error) => {
            toast.error("Error uploading image");
          },
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
    } finally {
      setUploadingImage(false);
      setUploadProgress("0%");
      setImageData(null);
      setImageFile(null);
    }
  };

  const hanldeRemoveSelection = () => {
    setImageData(null);
    setImageFile(null);
  };

  return (
    <>
      <button
        onClick={() => setIsModalVisible(true)}
        className="bg-[#FFC000] px-4 py-2 text-black rounded h-8 text-sm w-full justify-center flex items-center font-semibold"
      >
        <FaPlus size={18} color="black" /> &nbsp; Upload
      </button>
      {isModalVisible && (
        <div className="absolute top-0 h-full w-full bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-[#2B2D33] relative rounded-lg py-10 flex flex-col justify-center items-center">
            <div className="flex justify-center items-center">
              <div className="flex w-full justify-end items-end p-3 absolute top-0 ">
                <FaTimes
                  className="text-white cursor-pointer"
                  onClick={() => setIsModalVisible(false)}
                />
              </div>
              <div className="flex divide-x divide-dashed">
                <div className="divide-y divide-dashed gap-10 flex flex-col w-96 px-14">
                  <div>
                    <p className="text-[#AAAAAA] mb-2">
                      Please select the model which you want to run on this file
                    </p>
                    <CssTextField
                      id="outlined-select-currency"
                      fullWidth
                      select
                      label="Model Name"
                      size="small"
                      inputRef={modelName}
                      className="text-white"
                    >
                      {map(modelNameArray, (model) => (
                        <MenuItem
                          key={get(model, "modelId", "")}
                          value={get(model, "modelName", "")}
                        >
                          {get(model, "modelName", "")}
                        </MenuItem>
                      ))}
                    </CssTextField>
                  </div>
                  <div>
                    <p className="text-[#AAAAAA] mt-6 mb-2">
                      Enter the tag name for image
                    </p>
                    <CssTextField
                      fullWidth
                      id="outlined-basic"
                      label="Tag Name"
                      variant="outlined"
                      size="small"
                      inputRef={tagName}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center px-10">
                  {imageData === null ? (
                    <FileUploader
                      handleChange={handleFileSelect}
                      name="file"
                      types={fileTypes}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <img src={UploadImageIcon} className="h-12" />
                        <p className="text-white mt-4 font-bold">
                          Drag & Drop file or{" "}
                          <span className="text-[#FFC000] underline">
                            Browse
                          </span>
                        </p>
                        <p className="text-sm text-[#AAAAAA] mt-2">
                          Supported formats: tiff, jpeg, png, hdf5, etc...
                        </p>
                      </div>
                    </FileUploader>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <img src={imageData} className="h-24" />
                      <p className="text-white mt-4 font-bold">
                        Want to change the image?{" "}
                        <span
                          className="text-[#FFC000] underline cursor-pointer"
                          onClick={hanldeRemoveSelection}
                        >
                          Remove Selection
                        </span>
                      </p>
                      <p className="text-sm text-[#AAAAAA] mt-2">
                        Supported formats: tiff, jpeg, png, hdf5, etc...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center mt-10">
              <button
                className="bg-[#FFC000] px-4 py-3 w-96 text-black rounded font-semibold"
                onClick={handleFileUpload}
                disabled={uploadingImage}
              >
                {uploadingImage ? uploadProgress + " Uploaded" : "Upload Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UploadImage;
