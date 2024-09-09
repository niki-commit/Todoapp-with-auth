import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Auth from "./components/Auth";
import ListHeader from "./components/ListHeader";
import ListItem from "./components/ListItem";

function App() {
  const [cookie, setCookie, removeCookie] = useCookies(null);
  const authToken = cookie.AuthToken;
  const userEmail = cookie.Email;
  const [tasks, setTasks] = useState(null);

  async function getData() {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos/${userEmail}`);
      const json = await response.json();
      setTasks(json);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if(authToken) {
      getData();
    }
  }, []);

  // Sort Tasks By Dates if tasks exist
  const sortedTasks = tasks?.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="app">
      {!authToken && <Auth />}
      {authToken &&
      <>
      <ListHeader listName="Things To-Do" getData={getData} />
      <p className="user-back">Welcome back {userEmail}</p>
      {sortedTasks?.map((task) => <ListItem key={task.id} task={task} getData={getData} />)}
      </>}
      <p className="copyright">© All rights reserved to Ravuri Nikhil</p>
    </div>
  );
}

export default App;
