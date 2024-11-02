import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { counterActions } from "./redux/store";
import { fetchUsers } from "./fetch_files";
import Mainmenu from "./mainmenu";
import Playscreen from "./playscreen";
import Gameover from "./gameover";

// soundtracks
const tracks = ["/02.mp3"];

function App() {
  const currentUserState = useSelector((state) => state.currentUserState);
  const [audioStarted, setAudioStarted] = useState(false);
  const ambientMusicStatus = useSelector((state) => state.ambientMusicStatus);
  const audioRef = useRef(new Audio(tracks[0]));
  const dispatch = useDispatch();

  // Play the ambient music
  function ambientMusic() {
    audioRef.current.loop = true;
    audioRef.current.play();
  }

  // Play the ambient music when the user interacts with the page
  useEffect(() => {
    const handleUserInteraction = () => {
      ambientMusic();
      setAudioStarted(true);
      document.removeEventListener("click", handleUserInteraction);
    };

    if (ambientMusicStatus) {
      if (!audioStarted) {
        document.addEventListener("click", handleUserInteraction);
      } else {
        audioRef.current.play();
      }
    } else {
      audioRef.current.pause();
    }

    // Cleanup function to remove the event listener if the component unmounts
    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [ambientMusicStatus, audioStarted]);

  // Function to set the volume
  const setVolume = (volume) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  // Set the volume to 0.3 when the user is on the play screen
  useEffect(() => {
    if (currentUserState == "main-menu") {
      setVolume(1);
    } else {
      setVolume(0.3);
    }
  }, [currentUserState]);

  // Fetch users data
  useEffect(() => {
    const fetchUsersData = async () => {
      const users = await fetchUsers();
      const leaderboard = users.sort((a, b) => b.highScore - a.highScore);
      dispatch(counterActions.setUsers(users));
      dispatch(counterActions.setLeaderboard(leaderboard));
    };
    fetchUsersData();
  }, [dispatch]);

  return (
    <>
      {currentUserState === "main-menu" && <Mainmenu />}
      {currentUserState === "play-screen" && <Playscreen />}
      {currentUserState === "game-over-screen" && <Gameover />}
    </>
  );
}

export default App;
