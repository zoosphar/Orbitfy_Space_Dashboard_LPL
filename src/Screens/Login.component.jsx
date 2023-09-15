import LPLIcon from "../static/icons/lpl_logo.png";
import LoginImage from "../static/img/loginIllustration.png";
function Login() {
  return (
    <div className="grid grid-cols-12 gap-4 h-[100vh] p-4">
      <div className="col-span-1 flex items-start">
        <img src={LPLIcon} className="h-20" />
      </div>
      <div className="col-start-2 col-span-5 flex flex-col items-center justify-center">
        <h4 className="text-2xl font-bold text-white">Welcome to</h4>
        <h3 className="text-3xl font-bold text-[#FFC000] mt-1">
          Little Place Labs Dashboard
        </h3>
        <div className="flex flex-col items-center">
          <p className="text-md float-left text-[#AAAAAA] mt-1 w-full">
            Login with your LPL Email
          </p>
          <button id="google-signin-button" className="mt-2">
            Sign in with google
          </button>
        </div>
      </div>
      <div className="col-start-8 col-span-5 h-full">
        <img src={LoginImage} className="h-full" />
      </div>
    </div>
  );
}

export default Login;
