import { INITIAL_FETCH_API_URL, INITIAL_FETCH_API_URL_PROD } from "./constants";

export const fetchInitialData = async (filterArray = []) => {
  const response = await fetch(
    INITIAL_FETCH_API_URL + `?modelFilters=${filterArray.join(",")}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("An error occurred while fetching the API.");
  }
  return response.json();
};
