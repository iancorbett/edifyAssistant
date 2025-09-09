

const chatEl = document.getElementById("chat");
const msgEl = document.getElementById("msg");
const sendBtn = document.getElementById("send");

function addMsg(text, who = "bot") {
    const row = document.createElement("div"); //This acts as the container row for the chat message
    row.className = "row";
    const bubble = document.createElement("div"); //This will hold the actual message text (the chat bubble)
    bubble.className = who === "me" ? "me" : "bot"; //This is how you get different styling for user vs bot messages
    bubble.innerText = text; //Sets the chat bubble’s visible text to whatever message you passed in
    row.appendChild(bubble); //Puts the bubble inside the row container
    chatEl.appendChild(row); //Adds the whole row (with bubble inside) to the chat log container
    chatEl.scrollTop = chatEl.scrollHeight; //Auto-scrolls the chat box to the bottom whenever a new message is added
  }

  function addSpinner() {
    const row = document.createElement("div"); //row container for the spinner
    row.className = "row system"; //assigns custom css styles
    row.id = "sysrow";
    const dot = document.createElement("div"); //This is the actual spinner circle
    dot.className = "spinner"; //aplies spinner class where we defined the spin animation
    row.appendChild(dot); //Puts the spinner div inside the row container
    chatEl.appendChild(row); //Inserts the whole row (with the spinner inside) into the chat log
    chatEl.scrollTop = chatEl.scrollHeight; //Auto-scrolls to the bottom so the spinner is visible, just like new messages
  }
  function removeSpinner() {
    const r = document.getElementById("sysrow");
    if (r) r.remove();
  }
  
  let useModel, kbEmbeddings;
  //useModel = the sentence encoder model (pretrained by Google)
  // kbEmbeddings = all your KB questions converted into semantic vectors (512-numbers each)
    async function loadModel() {
    addMsg("Loading brain… (first load ~5–10s)", "bot");
    // global "use" object comes from the CDN script in index.html
    useModel = await use.load(); // Load Universal Sentence Encoder
    const questions = KB.map(item => item.q);
    kbEmbeddings = await useModel.embed(questions); // Tensor shape: [N, 512]
    removeSpinner();
    addMsg("Ready! Ask me something 😎", "bot");
    }

    function cosineSim(a, b) { //a and b are arrays (vectors), each is 512 numbers long
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
          dot += a[i] * b[i]; //Computes the dot product of the two vectors
          na  += a[i] * a[i]; //Compute the squared lengths (magnitudes) of each vector
          nb  += b[i] * b[i];
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8); //returns output between -1 and 1
      }

      async function answer(userText) {
        if (!useModel || !kbEmbeddings) return "Model not ready yet — one sec!";
        const qEmbed = await useModel.embed([userText]);     //enoding user text, reutrns a vector shaped [1,512], representing the meaning of the question
        const qVec = (await qEmbed.array())[0];              //Converts that tensor into a plain JavaScript array so you can loop over it, has one row, and [0] grabs it and returns the 512 numbers in an array
        const kb = await kbEmbeddings.array();               // array with N rows, each row has 512 floats
        qEmbed.dispose();
      
        // Find best match
        let bestIdx = 0, bestScore = -1;
        for (let i = 0; i < kb.length; i++) { //Loops through every row in kb (every stored question)
          const score = cosineSim(qVec, kb[i]); //Uses cosineSim(qVec, kb[i]) to measure similarity (0–1 scale, closer to 1 = more similar meaning)
          if (score > bestScore) { bestScore = score; bestIdx = i; } //Keeps track of the highest score (bestScore) and its index (bestIdx)
        }  
        const THRESHOLD = 0.47; // decide whether any question is similar enough
        if (bestScore < THRESHOLD) return "I’m not totally sure 🤔 — can you rephrase?"; //limitation of a semantic search bot, only able to answer questions similar to whats in the knowledge base
        return KB[bestIdx].a + `\n\n(score: ${bestScore.toFixed(2)})`;
      }

      function send() {
        const text = msgEl.value.trim(); //TRIM WHITESPACE
        if (!text) return;
        addMsg(text, "me"); //MESSAGE IS SENT BY USER
        msgEl.value = ""; //value is initialixed to empty string
        addSpinner(); //spinner is added
        answer(text).then(res => { //answer function is called with text passed in 
          removeSpinner(); //spinner is removed
          addMsg(res, "bot"); //response comes from bot
        });
      }
    
      sendBtn.addEventListener("click", send);
      msgEl.addEventListener("keydown", e => { if (e.key === "Enter") send(); });

    addSpinner();
    loadModel();
