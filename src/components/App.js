import React, { useEffect, useReducer } from "react";
import Header from "./Header";
import { Main } from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./startScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./progress";

const initialState = {
  questions: [],

  // we can be in different stages- "loading", "error", "ready", "active", "finished"
  status: "Loading",
  index: 0,
  answer: null,
  points: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };

    case "dataFailed":
      return {
        ...state,
        status: "error",
      };

    case "start":
      return {
        ...state,
        status: "active",
      };

    case "newAnswer":
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };

    case "nextQuestion":
      return {
        ...state,
        index: state.index + 1,
        answer: null,
      };
    default:
      throw new Error("Action Unknown");
  }
}

function App() {
  const [{ questions, status, index }, dispatch, answer, points] = useReducer(
    reducer,
    initialState
  );

  const numQuestion = questions.length;
  const maxPossiblePoint = questions.reduce(
    (prev, curr) => prev + curr.points,
    0
  );

  useEffect(function () {
    fetch("http://localhost:9000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <div className="app">
      <Header></Header>

      <Main>
        {status === "loading" && <Loader></Loader>}
        {status === "error" && <Error></Error>}
        {status === "ready" && (
          <StartScreen
            numQuestion={numQuestion}
            dispatch={dispatch}
          ></StartScreen>
        )}

        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestion={numQuestion}
              maxPossiblePoint={maxPossiblePoint}
              answer={answer}
            >
              {" "}
              points={points}
            </Progress>
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            ></Question>
            <NextButton dispatch={dispatch} answer={answer}></NextButton>
          </>
        )}
      </Main>
    </div>
  );
}

export default App;
