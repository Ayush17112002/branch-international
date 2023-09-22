import { useState } from "react";
import { login } from "../redux/user";
import { toast } from "react-toastify";
import axios from "axios";
const Login = () => {
  const [userName, setUserName] = useState("");
  function inputHandler(e) {
    setUserName(e.value);
  }
  async function submitHandler(e) {
    if (!userName.length) {
      toast.error("Please enter user name");
    } else {
      try {
        const res = await axios.post("http://localhost:8080/login", {
          userName: userName,
        });
        console.log(res.data);
      } catch (err) {
        toast.error("INTERNAL SERVER ERROR");
      }
    }
  }
  return (
    <div className="login">
      <form className="login-form flex absolute justify-center items-center top-1/4 left-1/4 w-1/2 h-1/2">
        <label>
          Enter UserName: <input type="text" onChange={inputHandler}></input>
        </label>
        <input type="submit" onSubmit={submitHandler} />
      </form>
    </div>
  );
};

export default Login;
