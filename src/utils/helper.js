export const storeTokensInLocalStorage = (tokens) => {
  localStorage.setItem("idToken", tokens.idToken);
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
};

export const clearTokensFromLocalStorage = () => {
  localStorage.removeItem("idToken");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });

export function generatePasswordFromNumber(inputNumber) {
  const alphabetMap = "abcdefghijklmnopqrstuvwxyz";
  let password = "";

  // Convert the inputNumber to a string to iterate over its digits
  const inputStr = inputNumber.toString();

  for (let i = 0; i < inputStr.length; i++) {
    const digit = parseInt(inputStr[i], 10); // Parse the digit as an integer
    if (!isNaN(digit) && digit >= 0 && digit <= 9) {
      // Check if the digit is valid (0-9)
      password += alphabetMap[digit];
    } else {
      // Handle invalid digits (e.g., non-numeric characters)
      throw new Error("Invalid input. Please provide a numeric input (0-9).");
    }
  }

  return password;
}
