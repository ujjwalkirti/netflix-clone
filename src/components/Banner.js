import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import db from "../Firebase";
import firebase from "firebase";
import "./Banner.css";
import Nav from "./Nav";
import requests from "./Requests";

function Banner() {
  const [movie, setMovie] = useState([]);
  const user = useSelector(selectUser);

  useEffect(() => {
    async function fetchMovies() {
      const response = await axios.get(
        `https://api.themoviedb.org/3${requests.fetchNetflixOriginals}`
      );
      const rand = Math.floor(Math.random() * response.data.results.length - 1);
      setMovie(response.data.results[rand]);
    }
    fetchMovies();
  }, []);

  const playNow = (event) => {
    event.preventDefault();
    //allow users to play a movie only if they are subscribed to any plan
    db.collection("users")
      .doc(user?.uid)
      .get()
      .then((doc) => {
        if (doc.data().selectedPlan !== "None") {
          db.collection("users")
            .doc(user?.uid)
            .update({
              wantToWatch: movie,
            })
            .then(() => {
              console.log(
                "You are watching ",
                movie?.title || movie?.original_name || movie?.name
              );
            });
        } else {
          alert("You have not subscribed to any plan!");
        }
      });
  };

  const addToList = (event) => {
    event.preventDefault();
    db.collection("users")
      .doc(user?.uid)
      .update({
        movieList: firebase.firestore.FieldValue.arrayUnion(movie),
      });
  };

  function shortString(str, len) {
    if (str?.length < len) {
      return str;
    } else {
      return str?.substring(0, len) + "...";
    }
  }

  return (
    <div
      style={{
        backgroundSize: "100% 100%",
        backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
      className="banner"
    >
      <div className="login__gradientTop" />
      <Nav />
      {movie ? (
        <>
          <div className="transparent">
            <div className="banner__title" style={{marginTop:"150px"}}>
              <h1 className="display-3">
                {movie?.title || movie?.original_name || movie?.name}
              </h1>
            </div>

            <div className="banner__buttons">
              <button className="btn btn-dark mr-3" onClick={playNow}>
                Play
              </button>
              <button className="btn btn-dark" onClick={addToList}>
                Add to List
              </button>
            </div>
            <div className="banner__description mt-2">
              <h3>
                {movie?.overview !== "undefined" &&
                  shortString(movie?.overview, 150)}
              </h3>
            </div>
          </div>
        </>
      ) : (
        <div
          class="spinner-border text-primary"
          style={{ position: "fixed", top: "200px", textAlign: "center" }}
          role="status"
        >
          <span class="sr-only">Loading...</span>
        </div>
      )}
      <div className="login__gradientDown" />
    </div>
  );
}

export default Banner;
