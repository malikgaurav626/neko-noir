import { useEffect, useState } from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { counterActions } from "../redux/store";
import { fetchAndSetUser } from "../fetch_files";

export default function Mainmenu() {
  const [aboutOffcanvas, setAboutOffcanvas] = useState(false);
  const user = useSelector((state) => state.user);
  const playStatus = useSelector((state) => state.playStatus);
  const settingUser = useSelector((state) => state.settingUser);
  const ambientMusicStatus = useSelector((state) => state.ambientMusicStatus);
  const [localUsername, setLocalUsername] = useState(
    user.username === "_placeholder" ? "" : user.username
  );
  const dispatch = useDispatch();
  useEffect(() => {}, [ambientMusicStatus]);

  const handleBlur = () => {
    if (localUsername !== user.username) {
      dispatch(counterActions.setUser({ ...user, username: localUsername }));
    }
  };
  return (
    <>
      <div className="crt-container">
        <div className="distortion-line"></div>
        <section id="main-menu">
          <video
            src="/main_menu_loop.mp4"
            id="main-menu-loop-video"
            autoPlay={true}
            loop={true}
            controls={false}
            muted={true}
          ></video>
          <div className="main-title">
            <span>猫</span>
            Noir
          </div>
          <div className="positioner">
            <div className="username-container">
              <input
                type="text"
                name="username"
                value={localUsername}
                id="username-id"
                onChange={(e) => setLocalUsername(e.target.value)}
                onBlur={handleBlur}
                placeholder={
                  user.username === "_placeholder" ? "username" : user.username
                }
              />
              <div
                className="username-select"
                onClick={() => {
                  const username = document.getElementById("username-id").value;
                  dispatch(counterActions.setSettingUser(true));
                  fetchAndSetUser(dispatch, username);
                }}
              >
                {settingUser ? (
                  <div className="rotate" id="rotate">
                    <img
                      src="/icons8-loading-100.png"
                      width={15}
                      height={15}
                      alt=""
                    />
                  </div>
                ) : (
                  <div>✔</div>
                )}
              </div>
            </div>
            <div
              className={
                "start-btn button-86 " + (playStatus ? "" : "disabled")
              }
              role="button"
              onClick={() => {
                document.getElementById("main-menu").style.animation =
                  "fade-out 1s forwards";
                setTimeout(() => {
                  dispatch(counterActions.setCurrentUserState("play-screen"));
                }, 1000);
              }}
            >
              PLAY
            </div>
            <div className="settings">
              <div
                className="setting-btn"
                onClick={() => {
                  dispatch(
                    counterActions.setAmbientMusicStatus(!ambientMusicStatus)
                  );
                }}
              >
                <img src="/icons8-mute-96.png" alt="" />
              </div>
              <div
                className="setting-btn"
                onClick={() => setAboutOffcanvas(true)}
              >
                <img src="/icons8-about-96.png" alt="" />
              </div>
            </div>
          </div>
          <section
            className={
              "about-block-container " + (aboutOffcanvas ? " active" : " ")
            }
          >
            <article className="about-block">
              <div
                className="about-header"
                onClick={() => setAboutOffcanvas(false)}
              >
                <div>x</div>
              </div>
              <div className="about-content">
                This game is designed and developed by VaporSquad a.k.a Gaurav
              </div>
            </article>
          </section>
        </section>
      </div>
    </>
  );
}
