// Global selections and variables

const colorDivs = document.querySelectorAll(".color");
const generateButton = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustements = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;
// for local Storage
let savedPalettes = [];

// Event Listeners

generateButton.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((slider, index) => {
  slider.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popupBox.classList.remove("active");
  popup.classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustementPanel(index);
  });
});

closeAdjustements.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustementPanel(index);
  });
});

lockButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    lockColor(index);
  });
});

// Functions

//Color Generator

function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    //Add the color to the background

    div.style.backgroundColor = randomColor;

    hexText.innerText = randomColor;

    //check for contrast
    checkTextContrast(randomColor, hexText);

    //Initial Colorize Sliders

    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  resetInput();

  //check for button contrast
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();

  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //scale saturation to

  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);

  const scaleSat = chroma.scale([noSat, color, fullSat]);

  //scale brightness

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update input color slider

  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)}`;

  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)}`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor);

  const setNewColor = color
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = setNewColor;
  //Colorize input colorizeSliders
  colorizeSliders(setNewColor, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();

  //checkContrast

  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInput() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = satValue;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");

  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  //POPUP ANIMATION
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustementPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustementPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockColor(index) {
  colorDivs[index].classList.toggle("locked");
  lockButton[index].children[0].classList.toggle("fa-lock-open");
  lockButton[index].children[0].classList.toggle("fa-lock");
}

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

//event listener

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
saveContainer.addEventListener("click", (e) => {
  const isclickOutside = saveInput.contains(e.target);
  if (!isclickOutside) {
    closePalette();
  }
});

libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const savePopup = saveContainer.children[0];
  saveContainer.classList.add("active");
  savePopup.classList.add("active");
}

function closePalette(e) {
  const savePopup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  savePopup.classList.remove("active");
}

submitSave.addEventListener("click", savePalette);

function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");

  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  let palettesNumber;

  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));

  if (paletteObjects) {
    palettesNumber = paletteObjects.length;
  } else {
    palettesNumber = savedPalettes.length;
  }
  const paletteObj = { name, colors, nbr: palettesNumber };
  savedPalettes.push(paletteObj);
  //save to localStorage
  saveToLocal(paletteObj);
  saveInput.value = "";

  //generate the palette for the library

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((color) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = color;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nbr);
  paletteBtn.innerText = "Select";

  //add event to the btn
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];

    console.log(paletteIndex);
    initialColors = [];

    console.log(savedPalettes);
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });

    resetInput();
  });

  //append to Library

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  let localPalettes;

  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  let localPalettes;

  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));

    savedPalettes = [...paletteObjects];

    console.log(paletteObjects);

    paletteObjects.forEach((paletteObj, index) => {
      //generate the palette for the library

      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((color) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nbr);
      paletteBtn.innerText = "Select";

      //add event to the btn
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });

        resetInput();
      });
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColors();
