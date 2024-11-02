import { useEffect, useRef, useState } from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { counterActions } from "../redux/store";
import { updateUser, fetchUsers } from "../fetch_files";

// sound effects for cards
const effects = [
  "/card_hover.wav",
  "/potential.wav",
  "/card_selection.mp3",
  "/game_over.wav",
  "/shuffle.mp3",
  "/defuse.mp3",
  "/cat.wav",
  "/explode.wav",
];
// card border animations
const potential_cards = [
  {
    type: "cat",
    image: "/cat_card_cropped.mp4",
  },
  {
    type: "explode",
    image: "/explode_card_cropped.mp4",
  },
  {
    type: "defuse",
    image: "/defuse_card_cropped.mp4",
  },
  {
    type: "shuffle",
    image: "/shuffle_card_cropped.mp4",
  },
];

// playscreen
export default function Playscreen() {
  const currentScore = useSelector((state) => state.currentScore);
  const winStreak = useSelector((state) => state.winStreak);
  const user = useSelector((state) => state.user);

  return (
    <div className="crt-container">
      <div className="distortion-line"></div>
      <div id="play-screen">
        <video
          src="/play-menu-loop.mp4"
          loop={true}
          muted={true}
          autoPlay={true}
          id="play-menu-loop-video"
        ></video>
        <Deck />
      </div>
      <div id="score-book">
        <div className="score-item">
          <div className="score-title">User</div>
          <div className="score-count">{user.username}</div>
        </div>
        <div className="user-score score-item">
          <div className="score-title">Score</div>
          <div className="score-count">
            {currentScore} {`(+${winStreak > 0 ? winStreak : ""})`}
          </div>
        </div>
        <div className="user-high-score score-item">
          <div className="high-score-title">High Streak</div>
          <div className="high-score-count">{user.highScore}</div>
        </div>

        <div className="user-defuse-count score-item">
          <div className="defuse-title">Defuse</div>
          <div className="defuse-count">{user.defuseCount}</div>
        </div>
      </div>
    </div>
  );
}
function Deck() {
  // deck logic states
  const [currentCard, setCurrentCard] = useState(-1);
  const [cardLength, setCardLength] = useState(5);
  const [enableCards, setEnableCards] = useState(true);
  const dispatch = useDispatch();

  // user data
  const user = useSelector((state) => state.user);
  const score = useSelector((state) => state.currentScore);
  const winStreak = useSelector((state) => state.winStreak);

  // audio effects for cards
  const hoverAudioRef = useRef(new Audio(effects[0]));
  const selectAudioRef = useRef(new Audio(effects[1]));
  const gameoverAudioRef = useRef(new Audio(effects[3]));
  const shuffleAudioRef = useRef(new Audio(effects[4]));
  const defuseAudioRef = useRef(new Audio(effects[5]));
  const catAudioRef = useRef(new Audio(effects[6]));
  const explodeAudioRef = useRef(new Audio(effects[7]));
  const [timeouts, setTimeouts] = useState([]);
  const [deckKey, setDeckKey] = useState(0);
  const [winState, setWinState] = useState(false);

  // deck to gameover logic
  const DeckFadeout = () => {
    gameoverAudioRef.current.volume = 0.5;
    gameoverAudioRef.current.play();
    setTimeout(() => {
      document.getElementById("play-screen").style.animation =
        "fade-out 1s forwards";
      setTimeout(() => {
        dispatch(counterActions.setCurrentUserState("game-over-screen"));
      }, 1000);
    }, 400);
  };

  // refetch user data and rebuild leaderboard
  const fetchUsersData = async () => {
    const users = await fetchUsers();
    const leaderboard = users.sort((a, b) => b.highScore - a.highScore);
    dispatch(counterActions.setUsers(users));
    dispatch(counterActions.setLeaderboard(leaderboard));
  };
  // deckmouse enter logic
  function deckManage() {
    const cards = document.querySelectorAll(".cardd");
    const totalCards = cardLength;
    const middleIndex = Math.floor(totalCards / 2); // Center card index

    cards.forEach((card, index) => {
      // Calculate dynamic rotation for each card around the center
      const rotationAngle = (index - middleIndex) * 15;

      // Calculate translation values; cards further from center move more
      const translateX = 60; // Adjust this to control horizontal spread
      const translateY = (index - middleIndex) * 10;

      // Apply transform to each card dynamically
      card.style.transform = `
      rotate(${rotationAngle}deg) 
      translate(${translateX}%, ${translateY}px)
    `;
    });
  }

  // rerender logic after shuffle
  useEffect(() => {
    const cards = document.querySelectorAll(".cardd");

    const deck = document.querySelector("#deck");

    deck.addEventListener("mouseenter", deckManage);

    deck.addEventListener("mouseleave", () => {
      // Reset all cards to their initial position
      cards.forEach((card) => {
        card.style.transform = "rotate(0deg) translate(0, 0)";
      });
      setCurrentCard(-1);
    });

    return () => {
      deck.removeEventListener("mouseenter", deckManage);
      deck.removeEventListener("mouseleave", () => {
        cards.forEach((card) => {
          card.style.transform = "rotate(0deg) translate(0, 0)";
        });
        setCurrentCard(-1);
      });
    };
  }, [deckKey]);

  // card postions and audio controls
  useEffect(() => {
    if (currentCard !== -1) {
      const cards = document.querySelectorAll(".cardd");
      for (let i = 0; i < currentCard; i++) {
        cards[i].style.transform = `translate(-130px, 0px) rotate(${
          (i - currentCard) * 10
        }deg)`;
      }
      for (let i = currentCard + 1; i < cards.length; i++) {
        cards[i].style.transform = `translate(-130px, 0px) rotate(${
          (i - currentCard) * 10
        }deg)`;
      }
      cards[currentCard].style.transform = `translate(130px, 0px) rotate(0deg)`;
    }

    const cards = document.querySelectorAll(".cardd");
    hoverAudioRef.current.volume = 0.5;
    selectAudioRef.current.volume = 0.8;

    cards.forEach((card, index) => {
      card.addEventListener("click", () => {
        if (currentCard !== index) {
          selectAudioRef.current.src = effects[2];
          selectAudioRef.current.currentTime = 0;
          selectAudioRef.current.play();
          hoverAudioRef.current.pause();
          hoverAudioRef.current.currentTime = 0;
        } else {
          selectAudioRef.current.src = effects[1];
          selectAudioRef.current.currentTime = 0;
          selectAudioRef.current.play();
          hoverAudioRef.current.pause();
          hoverAudioRef.current.currentTime = 0;
        }
      });

      card.addEventListener("mouseenter", () => {
        hoverAudioRef.current.currentTime = 0; // Reset the audio to the start
        hoverAudioRef.current.play();
      });

      card.addEventListener("mouseleave", () => {
        hoverAudioRef.current.pause();
        hoverAudioRef.current.currentTime = 0; // Reset the audio to the start
      });
    });

    // Cleanup function to remove event listeners
    return () => {
      cards.forEach((card, index) => {
        card.removeEventListener("click", () => {
          if (currentCard !== index) {
            selectAudioRef.current.src = effects[2];
            selectAudioRef.current.currentTime = 0;
            selectAudioRef.current.play();
            hoverAudioRef.current.pause();
            hoverAudioRef.current.currentTime = 0;
          } else {
            selectAudioRef.current.src = effects[1];
            selectAudioRef.current.currentTime = 0;
            selectAudioRef.current.play();
            hoverAudioRef.current.pause();
            hoverAudioRef.current.currentTime = 0;
          }
        });

        card.removeEventListener("mouseenter", () => {
          hoverAudioRef.current.currentTime = 0;
          hoverAudioRef.current.play();
        });

        card.removeEventListener("mouseleave", () => {
          hoverAudioRef.current.pause();
          hoverAudioRef.current.currentTime = 0;
        });
      });
    };
  }, [currentCard]);

  // margins and postions based on card count
  useEffect(() => {
    if (cardLength == 0) {
      setWinState(true);
      if (winStreak > user.highScore) {
        const newUser = { ...user, highScore: winStreak };
        updateUser(dispatch, newUser);
      }
      setTimeout(() => {
        shuffleDeck();
      }, 300);
    }
    const cardds_container = document.querySelector(".cardds-container");
    const fakeCardLength = 5 - cardLength;
    cardds_container.style.marginTop = `${fakeCardLength * 20 + 60}px`;

    const deck = document.getElementById("deck");
    deck.style.bottom = `calc(-10% + ${fakeCardLength * 20}px)`;
  }, [cardLength]);

  useEffect(() => {
    const cards = document.querySelectorAll(".cardd");
    if (enableCards) {
      cards.forEach((card) => {
        card.style.pointerEvents = "auto";
      });
    } else {
      cards.forEach((card) => {
        card.style.pointerEvents = "none";
      });
    }
  }, [enableCards]);

  function resetCards() {
    timeouts.forEach(clearTimeout);
    setTimeouts([]);
    setDeckKey((prev) => prev + 1);
    const cards = document.querySelectorAll(".cardd");
    cards.forEach((card) => {
      card.style.transform = "rotate(0deg) translate(0, 0)";
    });
    setCurrentCard(-1);

    setTimeout(() => {
      const deck = document.getElementById("deck");
      deck.style.bottom = "-15%";
      setCardLength(5);
    }, 2100);
  }
  function shuffleDeck() {
    setTimeout(() => {
      resetCards();
    }, 700);
  }
  function increaseDefuseCount() {
    const newUser = { ...user, defuseCount: user.defuseCount + 1 };
    updateUser(dispatch, newUser);
  }
  function increaseScore() {
    dispatch(counterActions.setCurrentScore(score + 1));
  }
  function triggerGameOver() {
    if (user.defuseCount > 0) {
      const newUser = { ...user, defuseCount: user.defuseCount - 1 };
      updateUser(dispatch, newUser);
    } else {
      // Game over
      fetchUsersData();
      DeckFadeout();
    }
  }

  function pointPopUp(type) {
    const pointShower = document.getElementById("point_shower");
    if (type == "cat") {
      pointShower.innerHTML = "";
      pointShower.innerText = "+1";
      pointShower.style.color = "#df2a88";
      catAudioRef.current.volume = 0.5;
      setTimeout(() => {
        catAudioRef.current.play();
      }, 300);
    } else if (type == "defuse") {
      pointShower.innerHTML = "";
      pointShower.innerText = "+1";
      pointShower.style.color = "#64f6f6";
      defuseAudioRef.current.volume = 0.5;
      setTimeout(() => {
        defuseAudioRef.current.play();
      }, 300);
    } else if (type == "shuffle") {
      pointShower.innerHTML = "";
      pointShower.innerHTML = `<img src='/icons8-shuffle-64.png''> </img>`;
      shuffleAudioRef.current.volume = 0.5;
      setTimeout(() => {
        shuffleAudioRef.current.play();
      }, 300);
    } else {
      pointShower.innerHTML = "";
      pointShower.innerHTML = `<img src='/icons8-cross-64.png'> </img>`;
      explodeAudioRef.current.volume = 0.5;
      setTimeout(() => {
        explodeAudioRef.current.play();
      }, 300);
    }
    // animation
    pointShower.style.animation = "pointPopUp 1.2s forwards";
    setTimeout(() => {
      pointShower.style.animation = "";
      pointShower.innerHTML = "";
    }, 1200);
  }

  function switchCard(card) {
    setEnableCards(false);
    const video1 = card.querySelector("video:nth-child(1)");
    const video2 = card.querySelector("video:nth-child(2)");
    card.style.height = "20px";
    const randomCard =
      potential_cards[Math.floor(Math.random() * potential_cards.length)];
    const timeout1 = setTimeout(() => {
      if (randomCard.type === "defuse") {
        // do
        video1.style.width = "300px";
        video2.style.width = "300px";
        card.style.height = "200px";
        video1.style.filter = "hue-rotate(0deg)";
        video2.style.filter = "hue-rotate(0deg)";
        card.querySelector(".cardd-content img").src = "/cat_defuse.png";
        card.querySelector(".cardd-content img").style.filter =
          "drop-shadow(0px 0px 10px #68dbe9) brightness(1.2) contrast(1.5)";
        const oldDivs = card.querySelectorAll(".cardd-content .card-type");
        oldDivs.forEach((div) => {
          div.remove();
        });
        const newDiv = document.createElement("div");
        newDiv.className = "card-type";
        newDiv.innerText = "Defuse \n Card";
        newDiv.style.color = "#4edbd1";
        newDiv.style.textShadow = "0px 0px 10px #4edbd1";
        card.querySelector(".cardd-content").appendChild(newDiv);
      } else if (randomCard.type === "explode") {
        // do
        video1.style.width = "300px";
        video2.style.width = "300px";
        video1.style.filter = "hue-rotate(190deg)";
        video2.style.filter = "hue-rotate(190deg)";
        card.style.height = "250px";
        card.querySelector(".cardd-content img").src = "/cat_explode.png";
        card.querySelector(".cardd-content img").style.filter = "unset";
        const oldDivs = card.querySelectorAll(".cardd-content .card-type");
        oldDivs.forEach((div) => {
          div.remove();
        });
        const newDiv = document.createElement("div");
        newDiv.className = "card-type";
        newDiv.innerText = "Explode \n Card";
        newDiv.style.color = "#c47bfa";
        newDiv.style.textShadow = "0px 0px 10px #c47bfa";
        card.querySelector(".cardd-content").appendChild(newDiv);
      } else if (randomCard.type === "shuffle") {
        // do
        card.style.height = "250px";
        video1.style.width = "350px";
        video2.style.width = "350px";
        video1.style.filter = "hue-rotate(0deg)";
        video2.style.filter = "hue-rotate(0deg)";
        card.querySelector(".cardd-content img").src = "/cat_shuffle.png";
        card.querySelector(".cardd-content img").style.filter = "unset";
        const oldDivs = card.querySelectorAll(".cardd-content .card-type");
        oldDivs.forEach((div) => {
          div.remove();
        });
        const newDiv = document.createElement("div");
        newDiv.className = "card-type";
        newDiv.innerText = "Shuffle \n Card";
        newDiv.style.color = "#61cd6a";
        newDiv.style.textShadow = "0px 0px 10px 10px #61cd6a";
        card.querySelector(".cardd-content").appendChild(newDiv);
      } else {
        //
        card.style.height = "200px";
        video1.style.filter = "hue-rotate(0deg)";
        video2.style.filter = "hue-rotate(0deg)";
        card.querySelector(".cardd-content img").src = "/cat_card.jpg";
        card.querySelector(".cardd-content img").style.filter =
          "hue-rotate(75deg)";
        const oldDivs = card.querySelectorAll(".cardd-content .card-type");
        oldDivs.forEach((div) => {
          div.remove();
        });
        const newDiv = document.createElement("div");
        newDiv.className = "card-type";
        newDiv.innerText = "Cat \n Card";
        newDiv.style.color = "#d21c87";
        newDiv.style.textShadow = "0px 0px 10px #d21c87";
        card.querySelector(".cardd-content").appendChild(newDiv);
      }
      pointPopUp(randomCard.type);
      video1.src = randomCard.image;
      video2.src = randomCard.image;
      const timeout2 = setTimeout(() => {
        card.style.height = "20px";
        const timeout3 = setTimeout(() => {
          // delete the card
          card.style.display = "none";
          const cards = document.querySelectorAll(".cardd");
          cards.forEach((card) => {
            card.style.transform = "rotate(0deg) translate(0, 0)";
          });
          setCurrentCard(-1);
          // const deck = document.getElementById("deck");
          // let currentBottom = parseFloat(deck.style.bottom); // Parse the numeric part and handle the case where it's not set
          // if (currentBottom) {
          //   currentBottom = currentBottom + "px";
          // } else {
          //   currentBottom = `calc(-15% - 20px)`;
          // }
          // deck.style.bottom = `calc(${currentBottom} + 20px)`;
          setCardLength(cardLength - 1);
          setEnableCards(true);
          deckManage();
        }, 300);
        setTimeouts((prev) => [...prev, timeout3]);
      }, 1500);
      setTimeouts((prev) => [...prev, timeout2]);
    }, 300);
    setTimeouts((prev) => [...prev, timeout1]);

    if (randomCard.type === "defuse") {
      increaseDefuseCount();
    } else if (randomCard.type === "cat") {
      increaseScore();
    } else if (randomCard.type === "shuffle") {
      shuffleDeck();
    } else {
      triggerGameOver();
    }
  }
  const pickCard = () => {
    const cards = document.querySelectorAll(".cardd");
    const pickedCard = cards[currentCard];
    switchCard(pickedCard);
  };
  return (
    <>
      <div className={"win-screen " + (winState ? " active" : " ")}>
        <div className="win-screen-title">You Won</div>
        <div className="win-screen-controls">
          <div
            className="win-screen-btn button-86"
            onClick={() => {
              dispatch(counterActions.setWinStreak(winStreak + 1));
              shuffleDeck();
              setWinState(false);
            }}
          >
            Continue
          </div>
          <div
            className="win-screen-btn button-86"
            onClick={() => {
              DeckFadeout();
            }}
          >
            Give Up
          </div>
        </div>
      </div>
      <section id="deck" key={deckKey}>
        <div id="point_shower"></div>
        <div className="deck-title">Deck</div>
        <div className="cardds-container">
          <div
            className={"cardd " + (currentCard == 0 ? " active" : " ")}
            onClick={() => {
              if (currentCard == 0) {
                pickCard();
              } else {
                setCurrentCard(0);
              }
            }}
          >
            <video
              src="/card_static.mp4"
              autoPlay={true}
              muted={true}
              loop={true}
              preload="auto"
            ></video>
            <video
              src="/card_static.mp4"
              autoPlay={true}
              muted={true}
              loop={true}
              preload="auto"
            ></video>
            <div className="cardd-content">
              <img src="/e1b2937825.jpg" alt="" />
            </div>
          </div>
          <div
            className={"cardd " + (currentCard == 1 ? " active" : " ")}
            onClick={() => {
              if (currentCard == 1) {
                pickCard();
              } else {
                setCurrentCard(1);
              }
            }}
          >
            <video
              src="/card_static.mp4"
              autoPlay={true}
              muted={true}
              loop={true}
              preload="auto"
            ></video>
            <video
              src="/card_static.mp4"
              autoPlay={true}
              muted={true}
              preload="auto"
              loop={true}
            ></video>
            <div className="cardd-content">
              <img src="/e1b2937825.jpg" alt="" />
            </div>
          </div>
          <div
            className={"cardd " + (currentCard == 2 ? " active" : " ")}
            onClick={() => {
              if (currentCard == 2) {
                pickCard();
              } else {
                setCurrentCard(2);
              }
            }}
          >
            <video
              src="/card_static.mp4"
              autoPlay={true}
              muted={true}
              preload="auto"
              loop={true}
            ></video>
            <video
              src="/card_static.mp4"
              autoPlay={true}
              preload="auto"
              muted={true}
              loop={true}
            ></video>
            <div className="cardd-content">
              <img src="/e1b2937825.jpg" alt="" />
            </div>
          </div>
          <div
            className={"cardd " + (currentCard == 3 ? " active" : " ")}
            onClick={() => {
              if (currentCard == 3) {
                pickCard();
              } else {
                setCurrentCard(3);
              }
            }}
          >
            <video
              src="/card_static.mp4"
              autoPlay={true}
              muted={true}
              preload="auto"
              loop={true}
            ></video>
            <video
              src="/card_static.mp4"
              autoPlay={true}
              muted={true}
              preload="auto"
              loop={true}
            ></video>
            <div className="cardd-content">
              <img src="/e1b2937825.jpg" alt="" />
            </div>
          </div>
          <div
            className={"cardd " + (currentCard == 4 ? " active" : " ")}
            onClick={() => {
              if (currentCard == 4) {
                pickCard();
              } else {
                setCurrentCard(4);
              }
            }}
          >
            <video
              src="/card_static.mp4"
              autoPlay={true}
              muted={true}
              preload="auto"
              loop={true}
            ></video>
            <video
              src="/card_static.mp4"
              autoPlay={true}
              preload="auto"
              muted={true}
              loop={true}
            ></video>
            <div className="cardd-content">
              <img src="/e1b2937825.jpg" alt="" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
