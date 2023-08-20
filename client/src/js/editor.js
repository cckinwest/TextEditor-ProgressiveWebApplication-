// Import methods to save and get data from the indexedDB database in './database.js'
import { initdb, getDb, putDb } from "./database";
import { header } from "./header";

export default class {
  constructor() {
    const localData = localStorage.getItem("content");

    // check if CodeMirror is loaded
    if (typeof CodeMirror === "undefined") {
      throw new Error("CodeMirror is not loaded");
    }

    this.editor = CodeMirror(document.querySelector("#main"), {
      value: "",
      mode: "javascript",
      theme: "monokai",
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true,
      indentUnit: 2,
      tabSize: 2,
    });

    // When the editor is ready, set the value to whatever is stored in indexeddb.
    // Fall back to localStorage if nothing is stored in indexeddb, and if neither is available, set the value to header.
    initdb();

    getDb().then((data) => {
      console.info("Loaded data from IndexedDB, injecting into editor");

      if (data && data.length) {
        this.editor.setValue(header.concat(data.pop().content));
      } else if (localData) {
        this.editor.setValue(header.concat(localData));
      } else {
        this.editor.setValue(header);
      }
    });

    this.editor.on("change", () => {
      localStorage.setItem(
        "content",
        this.editor.getValue().slice(header.length)
      );
    });

    // Save the content of the editor when the editor itself is loses focus
    this.editor.on("blur", async () => {
      console.log("The editor has lost focus");
      const data = await getDb();

      if (data && data.length) {
        const latest = data.pop().content;
        if (localStorage.getItem("content") !== latest) {
          putDb(localStorage.getItem("content"));
        }
      } else {
        putDb(localStorage.getItem("content"));
      }
    });
  }
}
