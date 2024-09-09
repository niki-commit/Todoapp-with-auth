import { useState } from "react";
import { useCookies } from "react-cookie";

function Auth() {
  const [cookie, setCookie, removeCookie] = useCookies(null);
  const [isLogIn, setIsLogIn] = useState(true);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [error, setError] = useState(null);

  function viewLogin(status) {
    setError(null);
    setIsLogIn(status)
  }

  // login credentials submiting to backend
  async function handleSubmit(event, endPoint) {
    event.preventDefault();
    if(!isLogIn && password !== confirmPassword) {
      setError("Make sure passwords match!");
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_SERVERURL}/${endPoint}`, {
      method: "POST",
      headers: { "Content-Type" : "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json();

    if(data.details) {
      setError(data.detail);
    } else {
      setCookie("Email", data.email);
      setCookie("AuthToken", data.token);

      window.location.reload();
    }
  }

    return (
      <div className="auth-container">
        <div className="auth-container-box">
          <form>
            <h2>{isLogIn ? "Please Log In" : "Please Sign Up!"}</h2>
            <input type="email" 
              placeholder="Email" 
              value={email}
              onChange={(event) => setEmail(event.target.value)} />
            <input type="password" 
              placeholder="Password" 
              value={password}
              onChange={(event) => setPassword(event.target.value)} />
            {!isLogIn && <input type="password" 
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)} />}
            <input type="submit" className="create" onClick={(event) => handleSubmit(event, isLogIn ? "login" : "signup")} />
            {error && <p>{error}</p>}
          </form>

          <div className="auth-options">
            <button 
              onClick={() => viewLogin(false)}
              style={{backgroundColor: !isLogIn ? "rgb(255, 255, 255)" : "rgb(188, 188, 188)"}}
            >Sign Up</button>
            <button 
              onClick={() => viewLogin(true)}
              style={{backgroundColor: isLogIn ? "rgb(255, 255, 255)" : "rgb(188, 188, 188)"}}
            >Login</button>
          </div>

        </div>
      </div>
    );
  }
  
  export default Auth;