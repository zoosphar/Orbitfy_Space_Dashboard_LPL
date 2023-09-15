import { useEffect, useState } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import jwtDecode from "jwt-decode";
import Dashboard from "./Screens/Dashboard.component";
import Login from "./Screens/Login.component";
import {
  clearTokensFromLocalStorage,
  generatePasswordFromNumber,
  loadScript,
  storeTokensInLocalStorage,
} from "./utils/helper";
import { Toaster, toast } from "react-hot-toast";

export const userPool = new CognitoUserPool({
  UserPoolId: "us-east-1_JWdpt2MOA",
  ClientId: "ou6avdrioqf5mjb9cll1g8b9m",
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleGoogleLoginSuccess = async (googleResponse) => {
    const profileObj = jwtDecode(googleResponse.credential);
    const email = profileObj.email;
    const sub = profileObj.sub;
    const password = generatePasswordFromNumber(sub);

    const authenticationData = {
      Username: email,
      Password: password, // Use a temporary password for registration
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    try {
      await new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: resolve,
          onFailure: async (error) => {
            if (error.code === "NotAuthorizedException") {
              // If user not found, attempt to register the user
              try {
                await new Promise((regResolve, regReject) => {
                  userPool.signUp(email, password, [], null, (err, result) => {
                    if (err) {
                      regReject(err);
                    } else {
                      console.log(
                        "authenticationDetails: ",
                        authenticationDetails,
                        result
                      );
                      // User is registered successfully
                      const registeredUser = result.user;
                      registeredUser.authenticateUser(authenticationDetails, {
                        onSuccess: (data) => {
                          regResolve();
                          // Store tokens in local storage
                          const tokens = {
                            idToken:
                              registeredUser.getSignInUserSession().idToken
                                .jwtToken,
                            accessToken:
                              registeredUser.getSignInUserSession().accessToken
                                .jwtToken,
                            refreshToken:
                              registeredUser.getSignInUserSession().refreshToken
                                .token,
                          };
                          storeTokensInLocalStorage(tokens);
                          setIsLoggedIn(true);
                          toast.success("Logged in successfully!");
                        },
                        onFailure: (err) =>
                          console.log("authenticate fail err: ", err),
                      });
                    }
                  });
                });
              } catch (regError) {
                console.error("Error registering user:", regError);
              }
            } else {
              reject(error);
            }
          },
        });
      });

      const tokens = {
        idToken: cognitoUser.getSignInUserSession().idToken.jwtToken,
        accessToken: cognitoUser.getSignInUserSession().accessToken.jwtToken,
        refreshToken: cognitoUser.getSignInUserSession().refreshToken.token,
      };
      storeTokensInLocalStorage(tokens);
      setIsLoggedIn(true);
      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Error logging in. Please try again.");
    }
  };

  const checkExistingSession = () => {
    const idToken = localStorage.getItem("idToken");
    const accessToken = localStorage.getItem("accessToken");
    if (idToken && accessToken) {
      // Check if tokens are expired
      const idTokenData = jwtDecode(idToken);
      const accessTokenData = jwtDecode(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (idTokenData.exp > currentTime && accessTokenData.exp > currentTime) {
        setIsLoggedIn(true);
      } else {
        toast.error("Session expired. Please log in again.");
        handleLogout();
      }
    }
  };

  const handleLogout = async () => {
    // Clear tokens from local storage
    clearTokensFromLocalStorage();

    // Reset login status
    setIsLoggedIn(false);

    // Log out from Cognito
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }

    // Clear Google Sign-In (GSI) cache
    if (window.gapi && window.gapi.auth2) {
      const auth2 = window.gapi.auth2.getAuthInstance();
      if (auth2) {
        auth2.signOut();
      }
    }
    window.location.reload();
    // You might also want to perform any other necessary cleanup here
  };

  useEffect(() => {
    //accounts.google.com/gsi/client
    const src = "https://accounts.google.com/gsi/client";
    const id = process.env.REACT_APP_GOOGLE_SIGN_IN_CLIENT_ID;
    loadScript(src).then(() => {
      window.google.accounts.id.initialize({
        client_id:
          "34084853850-4lh56bign4lu4qgh104csh8f4f6juqgm.apps.googleusercontent.com",
        callback: handleGoogleLoginSuccess,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "filled_black",
          size: "large",
          logo_alignment: "center",
          text: "continue_with",
          width: "400",
        }
      );

      checkExistingSession();
    });

    return () => {
      const scriptTag = document.querySelector(`script[src="${src}"]`);
      if (scriptTag) document.body.removeChild(scriptTag);
    };
  }, []);

  return (
    <div>
      {isLoggedIn ? <Dashboard handleLogout={handleLogout} /> : <Login />}
      <Toaster />
    </div>
  );
}

export default App;
