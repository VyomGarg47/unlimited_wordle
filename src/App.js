import text_answers from "./answers";
import text_allowed from "./allowed";
import React, { Component } from "react";
import "./App.css";
import BackspaceIcon from "@mui/icons-material/Backspace";
import CheckIcon from "@mui/icons-material/Check";
import Stack from "@mui/material/Stack";

const colors = {
  green: "#6aaa64",
  black: "#121212",
  grey: "#818384",
  yellow: "#c9b458",
  dark_grey: "#3a3a3c",
  very_dark_grey: "#212121",
};
const answers_strings = text_answers.split("\n");
const answers_strings_size = answers_strings.length - 1;
const combined_strings_set = new Set([
  ...text_allowed.split("\n"),
  ...answers_strings,
]);
const OnScreenKeyboard = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
];
const random_key = Math.floor(Math.random() * answers_strings_size);
const curr_answer = answers_strings[random_key];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      window_width: 0,
      window_height: 0,
      game_over: false,
      prevrow: 0,
      prevcol: -1,
      value: Array(6)
        .fill(0)
        .map(() => new Array(5).fill("")),
      cell_color: Array(6)
        .fill(0)
        .map(() => new Array(5).fill(colors.black)),
      keyboard_key_color: Array(26).fill(colors.grey),
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  handleOnKeyPress = async (e) => {
    console.log(e.key);
    if (e.ctrlKey || e.altKey || e.shiftKey || this.state.game_over) {
      return;
    }
    if (e.keyCode >= 65 && e.keyCode <= 90) {
      let temp_currow = this.state.prevrow.valueOf();
      let temp_currcol = this.state.prevcol.valueOf();
      if (temp_currcol <= 3) {
        temp_currcol++;
        let temp_value = [...this.state.value];
        console.log(temp_value);
        temp_value[temp_currow][temp_currcol] = e.key.toLowerCase();
        this.setState({
          prevrow: temp_currow,
          prevcol: temp_currcol,
          value: temp_value,
        });
      }
    } else if (e.keyCode === 8) {
      // Backspace
      let temp_prevrow = this.state.prevrow.valueOf();
      let temp_prevcol = this.state.prevcol.valueOf();
      let temp_value = [...this.state.value];
      temp_value[temp_prevrow][temp_prevcol] = "";
      if (temp_prevcol >= 0) {
        temp_prevcol--;
      } else {
        return;
      }
      this.setState({
        prevrow: temp_prevrow,
        prevcol: temp_prevcol,
        value: temp_value,
      });
    } else if (e.keyCode === 13) {
      // Enter
      let curr_row = this.state.prevrow.valueOf();
      let curr_col = this.state.prevcol.valueOf();
      if (curr_col === 4) {
        let word = "";
        for (let i = 0; i < 5; ++i) {
          word += this.state.value[curr_row][i].valueOf();
        }
        if (combined_strings_set.has(word)) {
          let temp_cell_color = [...this.state.cell_color];
          let extra_1 = [];
          let extra_2 = new Set();
          let temp_keyboard_key_color = [...this.state.keyboard_key_color];
          for (let i = 0; i < 5; ++i) {
            if (word[i] === curr_answer[i]) {
              temp_cell_color[curr_row][i] = colors.green; //green color
              const temp_keyCode = word[i].toUpperCase().charCodeAt(0) - 65;
              temp_keyboard_key_color[temp_keyCode] = colors.green; //green color
            } else {
              extra_1.push(i);
              extra_2.add(curr_answer[i]);
            }
          }
          for (let i = 0; i < extra_1.length; ++i) {
            const character = word[extra_1[i]];
            if (extra_2.has(character)) {
              const temp_keyCode = character.toUpperCase().charCodeAt(0) - 65;
              if (temp_keyboard_key_color[temp_keyCode] !== colors.green) {
                temp_keyboard_key_color[temp_keyCode] = colors.yellow;
              }
              temp_cell_color[curr_row][extra_1[i]] = colors.yellow;
              extra_2.delete(character);
            } else {
              const temp_keyCode = character.toUpperCase().charCodeAt(0) - 65;
              temp_cell_color[curr_row][extra_1[i]] = colors.dark_grey;
              if (
                temp_keyboard_key_color[temp_keyCode] !== colors.green &&
                temp_keyboard_key_color[temp_keyCode] !== colors.yellow
              ) {
                temp_keyboard_key_color[temp_keyCode] = colors.dark_grey;
              }
            }
          }
          if (curr_row <= 4) {
            curr_row++;
            curr_col = -1;
          } else {
            console.log("curr_row = " + curr_row);
            this.setState({
              game_over: true,
            });
            console.log("Game Over");
          }
          this.setState({
            cell_color: temp_cell_color,
            prevrow: curr_row,
            prevcol: curr_col,
            keyboard_key_color: temp_keyboard_key_color,
            game_over: word === curr_answer,
          });
        } else {
          console.log("word = " + word);
          console.log("Not a valid word");
        }
      } else {
        console.log("curr_col = " + curr_col);
        console.log("word size must be 5");
      }
    }
  };

  handleKeyboard = (value) => {
    let pressed_keyCode;
    if (value === "Backspace") {
      pressed_keyCode = 8;
    } else if (value === "Enter") {
      pressed_keyCode = 13;
    } else {
      pressed_keyCode = value.charCodeAt(0);
    }
    const event = new KeyboardEvent("keydown", {
      key: value,
      keyCode: pressed_keyCode,
      which: pressed_keyCode,
    });
    document.dispatchEvent(event);
  };

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    document.addEventListener("keydown", this.handleOnKeyPress, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({
      window_width: window.innerWidth,
      window_height: window.innerHeight,
    });
  }

  RenderButton(button) {
    if (button === "Enter") {
      return <CheckIcon style={{ color: "white", margin: "0.7vw" }} />;
    } else if (button === "Backspace") {
      return <BackspaceIcon style={{ color: "white", margin: "0.7vw" }} />;
    } else {
      return <p style={{ margin: "0.7vw" }}>{button}</p>;
    }
  }

  render() {
    console.log(curr_answer);
    return (
      <div className="App">
        <nav style={{ height: "5vh" }}>
          <h1 style={{ fontSize: "4.5vh" }}>Unlimited Wordle</h1>
        </nav>
        <div className="wordle_grid" style={{ marginTop: "5vh" }}>
          {this.state.value.map((name, index) => {
            let sz_h = (2 * this.state.window_height) / 30;
            if (sz_h > 100) {
              sz_h = 100;
            }
            return (
              <Stack
                key={index}
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                {name.map((index_value, cindex) => {
                  return (
                    <div
                      key={`${index}${cindex}`}
                      style={{
                        backgroundColor: `${this.state.cell_color[index][cindex]}`,
                        width: sz_h,
                        height: sz_h,
                        margin: "0.5vh",
                        border: "5px solid " + colors.very_dark_grey,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "4vh",
                      }}
                    >
                      {index_value.toUpperCase()}
                    </div>
                  );
                })}
              </Stack>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          {OnScreenKeyboard.map((name, index) => {
            return (
              <Stack key={index} direction="row" justifyContent="center">
                {name.map((index_value, cindex) => {
                  return (
                    <button
                      key={`${index}${cindex}`}
                      style={{
                        borderRadius: 10,
                        backgroundColor:
                          index_value !== "Backspace" && index_value !== "Enter"
                            ? this.state.keyboard_key_color[
                                index_value.charCodeAt(0) - 65
                              ]
                            : colors.grey,
                        fontWeight: "bold",
                        height: "8vh",
                        margin: "0.4vh",
                        fontSize: "2vh",
                        color: "white",
                      }}
                      onClick={() => {
                        this.handleKeyboard(index_value);
                      }}
                    >
                      {this.RenderButton(index_value)}
                    </button>
                  );
                })}
              </Stack>
            );
          })}
        </div>
      </div>
    );
  }
}

export default App;
