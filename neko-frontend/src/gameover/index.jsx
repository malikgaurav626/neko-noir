import { useState } from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { counterActions } from "../redux/store";

// game over screen
export default function Gameover() {
  const dispatch = useDispatch();
  const winStreak = useSelector((state) => state.winStreak);
  const user = useSelector((state) => state.user);
  const [leaderboardStatus, setLeaderboardStatus] = useState(false);
  const leaderboard = useSelector((state) => state.leaderboard);

  return (
    <div className="crt-container">
      <div className="distortion-line"></div>
      <div id="game-over-screen">
        <video
          src="/game-over-loop.mp4"
          loop={true}
          muted={true}
          autoPlay={true}
          preload="auto"
          id="game-over-loop-video"
        ></video>
        <div className="game-over-content">
          <div
            className={
              "leaderboard-container " +
              (leaderboardStatus ? " active" : " off")
            }
          >
            <div
              className="leaderboard-header"
              onClick={() => setLeaderboardStatus(false)}
            >
              <span>x</span>
            </div>
            <div className="leaderboard-content">
              {leaderboard.map(
                (leader, index) =>
                  index < 10 && (
                    <div className="leader" key={"idx-" + leader.id}>
                      <div className="leader-username">@ {leader.username}</div>
                      <div className="leader-score">{leader.highScore}</div>
                    </div>
                  )
              )}
            </div>
          </div>
          <div className="game-over-title mt-5">Game Over</div>
          <div className="score-block">
            <div className="current-score gscore-item">
              <div className="score-title">Streak</div>
              <div className="score-count">{winStreak}</div>
            </div>
            <div className="current-score gscore-item">
              <div className="high-score-title">High Streak</div>
              <div className="high-score-count">{user.highScore}</div>
            </div>
            <div className="current-score gscore-item">
              <div className="high-score-title">Leaderboard</div>
              <div className="high-score-count">
                {leaderboard.findIndex((leader) => leader.id === user.id) == -1
                  ? "N/A"
                  : leaderboard.findIndex((leader) => leader.id === user.id) +
                    1}
                th
              </div>
            </div>
          </div>
          <div className="controls mt-5">
            <div
              className="restart-btn button-86"
              role="button"
              onClick={() => {
                dispatch(counterActions.setWinStreak(0));
                dispatch(counterActions.setCurrentScore(0));
                document.getElementById("game-over-screen").style.animation =
                  "fade-out 1s forwards";
                setTimeout(() => {
                  dispatch(counterActions.setCurrentUserState("play-screen"));
                }, 1000);
              }}
            >
              Restart
            </div>
            <div
              className="main-menu-btn button-86"
              role="button"
              onClick={() => {
                document.getElementById("game-over-screen").style.animation =
                  "fade-out 1s forwards";
                dispatch(counterActions.setWinStreak(0));
                dispatch(counterActions.setCurrentScore(0));
                setTimeout(() => {
                  dispatch(counterActions.setCurrentUserState("main-menu"));
                }, 1000);
              }}
            >
              Main Menu
            </div>
            <div
              className="leaderboard-btn button-86"
              onClick={() => {
                setLeaderboardStatus(true);
              }}
            >
              Leaderboard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
