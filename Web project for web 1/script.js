document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("baobaoList");
  const searchInput = document.getElementById("searchInput");
  const popup = document.getElementById("popupOverlay");
  const countdownEl = document.getElementById("countdown");
  const payOnline = document.getElementById("payOnline");
  const payPersonal = document.getElementById("payPersonal");
  const successPopup = document.getElementById("successPopup");

  const destinations = ["Matiao", "Martinez", "ER Mall", "Poblacion", "Baywalk"];
  const gates = ["Gate 1", "Gate 2", "Gate 3"];

  for (let i = 1; i <= 50; i++) {
    const dest = destinations[(i - 1) % destinations.length];
    const gate = gates[(i - 1) % gates.length];
    const img = i % 2 === 0 ? "images/baobao2.jpg" : "images/baobao1.jpg";

    const isAvailable = Math.random() > 0.5;
    const passengersCount = isAvailable ? Math.floor(Math.random() * 5) : 5;
    const passengersText = `${passengersCount}/5`;

    const card = document.createElement("div");
    card.className = "baobao-card";
    card.dataset.available = isAvailable;
    card.innerHTML = `
      <img src="${img}" alt="BaoBao">
      <div class="baobao-info">
        <h2>${dest}</h2>
        <p>Location: ${gate}</p>
        <p>Passengers: ${passengersText}</p>
        <p class="timer">Departure in: <span class="time"></span></p>
        <button class="book-btn" ${isAvailable ? "" : "disabled"} 
                style="cursor: ${isAvailable ? "pointer" : "not-allowed"}; 
                       background: ${isAvailable ? "" : "#888"}">
          ${isAvailable ? "Book Now" : "Full"}
        </button>
      </div>
    `;
    list.appendChild(card);

    const timeDisplay = card.querySelector(".time");
    const bookBtn = card.querySelector(".book-btn");

    let seconds = Math.floor(Math.random() * 300) + 60;
    const updateTimer = () => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    };
    const timerInterval = setInterval(() => {
      seconds--;
      updateTimer();
      if (seconds <= 0) {
        clearInterval(timerInterval);
        timeDisplay.textContent = "Departed 🚗💨";
        bookBtn.disabled = true;
        bookBtn.textContent = "Departed";
        bookBtn.style.backgroundColor = "#888";
        bookBtn.style.cursor = "not-allowed";
      }
    }, 1000);
    updateTimer();

    bookBtn.addEventListener("click", () => {
      if (!isAvailable || bookBtn.disabled) return;
      popup.style.display = "flex";
      payOnline.disabled = true;
      payPersonal.disabled = true;
      let time = 5;
      countdownEl.textContent = time;
      const timer = setInterval(() => {
        time--;
        countdownEl.textContent = time;
        if (time <= 0) {
          clearInterval(timer);
          payOnline.disabled = false;
          payPersonal.disabled = false;
        }
      }, 1000);
    });
  }

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll(".baobao-card").forEach(card => {
      const dest = card.querySelector("h2").textContent.toLowerCase();
      card.style.display = dest.includes(term) ? "block" : "none";
    });
  });

  payPersonal.addEventListener("click", () => {
    popup.style.display = "none";
    successPopup.style.display = "flex";
  });

  payOnline.addEventListener("click", () => {
  popup.style.display = "none"; // close booking popup
  document.getElementById("paymentPopup").style.display = "flex"; // open QR popup
});


  popup.addEventListener("click", e => {
    if (e.target === popup) popup.style.display = "none";
  });
});
