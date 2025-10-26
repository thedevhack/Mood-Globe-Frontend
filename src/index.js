import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
var renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var Globe;
var countries = null;
var userMoodValue = null;


const domain = "https://mood-globe-backend.onrender.com"


function setUserMoodValue(moodValue){
  if (!(moodValue >= -2 && moodValue <= 2)){
    alert("Some error occurred!");
  }
  userMoodValue = parseInt(moodValue);
}



async function intializeApp() {
  init();
  await fetchGlobeData();
  initGlobe();
  onWindowResize();
  animate();
  introduceIUserInputPopup();
}

intializeApp()



// SECTION Initializing core ThreeJS elements
function init() {
  // Initialize renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Initialize scene, light
  scene = new Scene();
  scene.add(new AmbientLight(0xbbbbbb, 0.3));
  scene.background = new Color(0x040d21);

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight(0xffffff, 0.8);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  var dLight1 = new DirectionalLight(0x7982f6, 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  var dLight2 = new PointLight(0x8566cc, 0.5);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  scene.add(camera);

  // Additional effects
  scene.fog = new Fog(0x535ef3, 400, 2000);

  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1;
  controls.autoRotate = false;

  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
}

async function fetchGlobeData(){

  const url = domain + "/api/getGlobeData";
  try {
    const response = await fetch(url);
    const responseData = await response.json()
    countries = responseData

} catch (err){
    console.error("error while fetching globe data", err)
  }
}

// SECTION Globe
function initGlobe() {
  // Initialize the Globe
  Globe = new ThreeGlobe({
    waitForGlobeReady: true,
    animateIn: true,
  })
    .hexPolygonsData(countries)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .hexPolygonColor("#ff0005")
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.5)
    .hexPolygonColor((e) => {
      if (e.colour) {
        return e.colour;
      } else return "#ffffff";
    });

  // NOTE Arc animations are followed after the globe enters the scene
  setTimeout(async() => {

    const latestUserMoodsResponse = await fetch(domain + "/api/getLatestUserMoods")
    const latestUserMoods = await latestUserMoodsResponse.json()

    Globe.arcsData(latestUserMoods.arcsData)
      .arcColor((e) => {
        return e.color ? e.color: "#ffffff";
      })
      .arcAltitude((e) => {
        return e.arcAlt;
      })
      .arcStroke((e) => {
        return 0.9;
      })
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(1000)
      .arcsTransitionDuration(1000)
      .arcDashInitialGap((e) => e.order * 1)

      // Globe.labelsData(latestUserMoods.labelsData)
      // .labelColor((e) => {return e.color ? e.color: "#ffffff"})
      // .labelDotOrientation((e) => {
      //   return "top";
      // })
      // .labelDotRadius(0.3)
      // .labelSize((e) => e.size)
      // .labelText("text")
      // .labelResolution(6)
      // .labelAltitude(0.15)

      Globe.pathsData([[90.872211, 25.132601],
        [89.920693, 25.26975],
        [89.832481, 25.965082],
        [89.355094, 26.014407],
        [88.563049, 26.446526],
        [88.209789, 25.768066],
        [88.931554, 25.238692]])
        .pathColor("#ff0000").pathPointAlt(0.001).pathResolution(6).path
  }, 1000);

  Globe.rotateY(-Math.PI * (5 / 9));
  Globe.rotateZ(-Math.PI / 6);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color(0x3a228a);
  globeMaterial.emissive = new Color(0x220038);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  // NOTE Cool stuff
  // globeMaterial.wireframe = true;

  scene.add(Globe);
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
  // console.log("x: " + mouseX + " y: " + mouseY);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowHalfX = window.innerWidth / 2.5;
  windowHalfY = window.innerHeight / 2.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
  camera.position.x +=
    Math.abs(mouseX) <= windowHalfX / 2
      ? (mouseX / 2 - camera.position.x) * 0.005
      : 0;
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function introduceIUserInputPopup(){
  let rootDiv = document.createElement("div");
  rootDiv.id = "userMoodPopup";
  rootDiv.style.position = "fixed";
  rootDiv.style.top = "0";
  rootDiv.style.left = "0";
  rootDiv.style.width = "100%";
  rootDiv.style.height = "100%";
  rootDiv.style.background = "rgba(0, 0, 0, 0.7)";
  rootDiv.style.backdropFilter = "blur(10px)";
  rootDiv.style.display = "flex";
  rootDiv.style.alignItems = "center";
  rootDiv.style.justifyContent = "center";
  rootDiv.style.zIndex = "1000";
  rootDiv.style.opacity = "0";
  rootDiv.style.visibility = "hidden";
  rootDiv.style.transition = "all 0.3s ease";

  let divinsideRootDiv = document.createElement("div")
  console.log(userMoodValue)

  function resetAllMoodsUI(){
    mood1.style.color = "";
    mood1.style.borderColor = "";
    mood1.style.background = "rgba(255, 255, 255, 0.05)";
    mood1.style.transform = "";
    mood1.style.boxShadow = "";
    mood2.style.color = "";
    mood2.style.borderColor = "";
    mood2.style.background = "rgba(255, 255, 255, 0.05)";
    mood2.style.transform = "";
    mood2.style.boxShadow = "";
    mood3.style.color = "";
    mood3.style.borderColor = "";
    mood3.style.background = "rgba(255, 255, 255, 0.05)";
    mood3.style.transform = "";
    mood3.style.boxShadow = "";
    mood4.style.color = "";
    mood4.style.borderColor = "";
    mood4.style.background = "rgba(255, 255, 255, 0.05)";
    mood4.style.transform = "";
    mood4.style.boxShadow = "";
    mood5.style.color = "";
    mood5.style.borderColor = "";
    mood5.style.background = "rgba(255, 255, 255, 0.05)";
    mood5.style.transform = "";
    mood5.style.boxShadow = "";
  }

  function hideMoodPopup(){
    let popup = document.getElementById("userMoodPopup");
    popup.style.opacity = '0';
    popup.style.visibility = 'hidden';
    userMoodValue = null;
    resetAllMoodsUI();
  }

  async function sendUserMood(){
    if (userMoodValue === null){
      alert("Please choose a mood!")
    }
    await fetch(domain + "/api/addUserMood", {
      method: "POST",
      body:JSON.stringify({
        "user_mood_value": userMoodValue
      }),
      headers:{
        "Content-Type":"application/json"
      }
    }).then(resp => {
      if (!resp.ok){
        alert("Some error occurred!");
      }
      alert("Successfully submitted mood ✔️");
      hideMoodPopup();
    })
  }

    divinsideRootDiv.style.background = "linear-gradient(145deg, rgba(26, 26, 46, 0.95), rgba(15, 15, 35, 0.95))";
    divinsideRootDiv.style.border = "2px solid rgba(58, 34, 138, 0.3)";
    divinsideRootDiv.style.borderRadius = "20px";
    divinsideRootDiv.style.padding = "40px";
    divinsideRootDiv.style.maxWidth = "80%";
    divinsideRootDiv.style.width = "80%";
    divinsideRootDiv.style.boxShadow = "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)";
    divinsideRootDiv.style.transform = "scale(0.8) translateY(10px)";
    divinsideRootDiv.style.transition = "all 0.3s ease";
    divinsideRootDiv.style.position = "relative";

  let popupcloseButton = document.createElement("button")
  popupcloseButton.onclick="hideMoodPopup()"
  popupcloseButton.style.position = "absolute";
  popupcloseButton.style.top = "15px";
  popupcloseButton.style.right = "20px";
  popupcloseButton.style.background = "linear-gradient(45deg, #7982f6, #8566cc)";
  popupcloseButton.style.border = "none";
  popupcloseButton.style.color = "rgba(255, 255, 255, 0.6)";
  popupcloseButton.style.fontSize = "24px";
  popupcloseButton.style.cursor = "pointer";
  popupcloseButton.style.width = "40px";
  popupcloseButton.style.height = "40px";
  popupcloseButton.style.borderRadius = "50%";
  popupcloseButton.style.display = "flex";
  popupcloseButton.style.alignItems = "center";
  popupcloseButton.style.justifyContent = "center";
  popupcloseButton.style.transition = "all 0.3s ease";
  popupcloseButton.innerHTML="&times;"
  divinsideRootDiv.appendChild(popupcloseButton)
  popupcloseButton.addEventListener("click", hideMoodPopup);

  popupcloseButton.addEventListener("mouseover", () => {
    popupcloseButton.style.background = "rgba(255, 255, 255, 0.1)";
    popupcloseButton.style.color = "rgba(255, 255, 255, 0.9)";
    popupcloseButton.style.transform = "rotate(90deg)";
  });

// Fixed mouse out effect - revert to original styles
  popupcloseButton.addEventListener("mouseout", () => {
    popupcloseButton.style.background = "linear-gradient(45deg, #7982f6, #8566cc)";
    popupcloseButton.style.color = "rgba(255, 255, 255, 0.6)";
    popupcloseButton.style.transform = "rotate(0deg)";
  });


  let div2 = document.createElement("div")

  let header = document.createElement("h2")
  header.style.textAlign = "center";
  header.style.marginBotton = "30px";
  header.textContent = "How are you feeling today?";
  header.style.color="#7C7BEB";
  header.style.fontFamily = "Arial, sans-serif";
  header.style.fontSize="32px";
  div2.appendChild(header)

  let headerPara = document.createElement("p")
  headerPara.style.color = "rgba(255, 255, 255, 0.7)";
  headerPara.style.fontSize = "20px";
  headerPara.style.textAlign = "center";
  headerPara.style.lineHeight = "1.4";
  headerPara.style.fontFamily = "Arial, sans-serif";
  headerPara.textContent = "Share your mood with the world and see how others are feeling around the globe";
  div2.appendChild(headerPara)
  divinsideRootDiv.appendChild(div2)


  let moodGrid = document.createElement("div")
  moodGrid.style.display = "grid";
  moodGrid.style.gridTemplateColumns = "1fr 1fr";
  moodGrid.style.gap = "20px";
  moodGrid.style.marginBottom = "30px";

  // happy mood div
  let mood1 = document.createElement("div")

  mood1.style.background = "rgba(255, 255, 255, 0.05)";
  mood1.style.border = "2px solid rgba(255, 255, 255, 0.1)";
  mood1.style.borderRadius = "15px";
  mood1.style.padding = "25px 20px";
  mood1.style.cursor = "pointer";
  mood1.style.transition = "all 0.3s ease";
  mood1.style.textAlign = "center";
  mood1.style.position = "relative";
  mood1.style.overflow = "hidden";

  mood1.addEventListener("mouseover", () => {
    mood1.style.color = "red";
    mood1.style.borderColor = "rgba(121, 130, 246, 0.5)";
    mood1.style.background = "rgba(121, 130, 246, 0.1)";
    mood1.style.transform = "translateY(-5px)";
    mood1.style.boxShadow = "0 10px 25px rgba(121, 130, 246, 0.2)";
  });

  mood1.addEventListener("mouseout", () => {
    if (!(userMoodValue === 1)) {
      mood1.style.color = "";
      mood1.style.borderColor = "";
      mood1.style.background = "rgba(255, 255, 255, 0.05)";
      mood1.style.transform = "";
      mood1.style.boxShadow = "";
    }
  });

  mood1.addEventListener("click", () => {
    resetAllMoodsUI();
    setUserMoodValue(1);
    mood1.style.borderColor = "#7982f6";
    mood1.style.background = "rgba(121, 130, 246, 0.2)";
    mood1.style.transform = "scale(1.05)";
    mood1.style.boxShadow = "0 15px 35px rgba(121, 130, 246, 0.3)";
  })

  let spanDiv = document.createElement("span")
  spanDiv.innerHTML = "😊"
  spanDiv.style.fontSize = "48px";
  spanDiv.style.marginBottom = "15px";
  spanDiv.style.display = "block";
  spanDiv.style.filter = "drop-shadow(0 5px 10px rgba(0, 0, 0, 0.3))";
  mood1.appendChild(spanDiv)
  let innerMoodDiv1 = document.createElement("div")
  innerMoodDiv1.style.color ="#fff";
  innerMoodDiv1.style.fontSize = "18px";
  innerMoodDiv1.style.fontWeight = "600";
  innerMoodDiv1.style.marginBottom = "5px";
  innerMoodDiv1.innerHTML = "Happy"
  mood1.appendChild(innerMoodDiv1)
  let innerMoodDiv2 = document.createElement("div")
  innerMoodDiv2.innerHTML = "Feeling great and positive!"
  innerMoodDiv2.style.color = "rgba(255, 255, 255, 0.6)";
  innerMoodDiv2.style.fontSize = "14px";
  innerMoodDiv2.style.lineHeight = "1.3";
  mood1.appendChild(innerMoodDiv2)
  moodGrid.appendChild(mood1)

  // excited mood div
  let mood2 = document.createElement("div")

  mood2.style.background = "rgba(255, 255, 255, 0.05)";
  mood2.style.border = "2px solid rgba(255, 255, 255, 0.1)";
  mood2.style.borderRadius = "15px";
  mood2.style.padding = "25px 20px";
  mood2.style.cursor = "pointer";
  mood2.style.transition = "all 0.3s ease";
  mood2.style.textAlign = "center";
  mood2.style.position = "relative";
  mood2.style.overflow = "hidden";

  mood2.addEventListener("mouseover", () => {
    mood2.style.color = "red";
    mood2.style.borderColor = "rgba(121, 130, 246, 0.5)";
    mood2.style.background = "rgba(121, 130, 246, 0.1)";
    mood2.style.transform = "translateY(-5px)";
    mood2.style.boxShadow = "0 10px 25px rgba(121, 130, 246, 0.2)";
  });

  mood2.addEventListener("mouseout", () => {
    if (!(userMoodValue === 2)){
      mood2.style.color = "";
      mood2.style.borderColor = "";
      mood2.style.background = "rgba(255, 255, 255, 0.05)";
      mood2.style.transform = "";
      mood2.style.boxShadow = "";
    }
  });

  mood2.addEventListener("click", () => {
    resetAllMoodsUI();
    setUserMoodValue(2);
    mood2.style.borderColor = "#7982f6";
    mood2.style.background = "rgba(121, 130, 246, 0.2)";
    mood2.style.transform = "scale(1.05)";
    mood2.style.boxShadow = "0 15px 35px rgba(121, 130, 246, 0.3)";
  })

  let spanDiv2 = document.createElement("span")
  spanDiv2.innerHTML = "🤩"
  spanDiv2.style.fontSize = "48px";
  spanDiv2.style.marginBottom = "15px";
  spanDiv2.style.display = "block";
  spanDiv2.style.filter = "drop-shadow(0 5px 10px rgba(0, 0, 0, 0.3))";
  mood2.appendChild(spanDiv2)
  let innerMoodDiv3 = document.createElement("div")
  innerMoodDiv3.style.color ="#fff";
  innerMoodDiv3.style.fontSize = "18px";
  innerMoodDiv3.style.fontWeight = "600";
  innerMoodDiv3.style.marginBottom = "5px";
  innerMoodDiv3.innerHTML = "Excited"
  mood2.appendChild(innerMoodDiv3)
  let innerMoodDiv4 = document.createElement("div")
  innerMoodDiv4.innerHTML = "Full of energy and enthusiasm!"
  innerMoodDiv4.style.color = "rgba(255, 255, 255, 0.6)";
  innerMoodDiv4.style.fontSize = "14px";
  innerMoodDiv4.style.lineHeight = "1.3";
  mood2.appendChild(innerMoodDiv4)
  moodGrid.appendChild(mood2)


  // neutral mood div
  let mood3 = document.createElement("div")

  mood3.style.background = "rgba(255, 255, 255, 0.05)";
  mood3.style.border = "2px solid rgba(255, 255, 255, 0.1)";
  mood3.style.borderRadius = "15px";
  mood3.style.padding = "25px 20px";
  mood3.style.cursor = "pointer";
  mood3.style.transition = "all 0.3s ease";
  mood3.style.textAlign = "center";
  mood3.style.position = "relative";
  mood3.style.overflow = "hidden";

  mood3.addEventListener("mouseover", () => {
    mood3.style.color = "red";
    mood3.style.borderColor = "rgba(121, 130, 246, 0.5)";
    mood3.style.background = "rgba(121, 130, 246, 0.1)";
    mood3.style.transform = "translateY(-5px)";
    mood3.style.boxShadow = "0 10px 25px rgba(121, 130, 246, 0.2)";
  });

  mood3.addEventListener("mouseout", () => {
    if (!(userMoodValue === 0)){
      mood3.style.color = "";
      mood3.style.borderColor = "";
      mood3.style.background = "rgba(255, 255, 255, 0.05)";
      mood3.style.transform = "";
      mood3.style.boxShadow = "";
    }
  });

  mood3.addEventListener("click", () => {
    resetAllMoodsUI();
    setUserMoodValue(0);
    mood3.style.borderColor = "#7982f6";
    mood3.style.background = "rgba(121, 130, 246, 0.2)";
    mood3.style.transform = "scale(1.05)";
    mood3.style.boxShadow = "0 15px 35px rgba(121, 130, 246, 0.3)";
  })



  let spanDiv3 = document.createElement("span")
  spanDiv3.innerHTML = "😐"
  spanDiv3.style.fontSize = "48px";
  spanDiv3.style.marginBottom = "15px";
  spanDiv3.style.display = "block";
  spanDiv3.style.filter = "drop-shadow(0 5px 10px rgba(0, 0, 0, 0.3))";
  mood3.appendChild(spanDiv3)
  let innerMoodDiv5 = document.createElement("div")
  innerMoodDiv5.style.color ="#fff";
  innerMoodDiv5.style.fontSize = "18px";
  innerMoodDiv5.style.fontWeight = "600";
  innerMoodDiv5.style.marginBottom = "5px";
  innerMoodDiv5.innerHTML = "Neutral"
  mood3.appendChild(innerMoodDiv5)
  let innerMoodDiv6 = document.createElement("div")
  innerMoodDiv6.innerHTML = "Just a regular day"
  innerMoodDiv6.style.color = "rgba(255, 255, 255, 0.6)";
  innerMoodDiv6.style.fontSize = "14px";
  innerMoodDiv6.style.lineHeight = "1.3";
  mood3.appendChild(innerMoodDiv6)
  moodGrid.appendChild(mood3)


  // sad mood div
  let mood4 = document.createElement("div")

  mood4.style.background = "rgba(255, 255, 255, 0.05)";
  mood4.style.border = "2px solid rgba(255, 255, 255, 0.1)";
  mood4.style.borderRadius = "15px";
  mood4.style.padding = "25px 20px";
  mood4.style.cursor = "pointer";
  mood4.style.transition = "all 0.3s ease";
  mood4.style.textAlign = "center";
  mood4.style.position = "relative";
  mood4.style.overflow = "hidden";

  mood4.addEventListener("mouseover", () => {
    mood4.style.color = "red";
    mood4.style.borderColor = "rgba(121, 130, 246, 0.5)";
    mood4.style.background = "rgba(121, 130, 246, 0.1)";
    mood4.style.transform = "translateY(-5px)";
    mood4.style.boxShadow = "0 10px 25px rgba(121, 130, 246, 0.2)";
  });

  mood4.addEventListener("mouseout", () => {
    if (!(userMoodValue === -1)) {
      mood4.style.color = "";
      mood4.style.borderColor = "";
      mood4.style.background = "rgba(255, 255, 255, 0.05)";
      mood4.style.transform = "";
      mood4.style.boxShadow = "";
    }
  });

  mood4.addEventListener("click", () => {
    resetAllMoodsUI();
    setUserMoodValue(-1);
    mood4.style.borderColor = "#7982f6";
    mood4.style.background = "rgba(121, 130, 246, 0.2)";
    mood4.style.transform = "scale(1.05)";
    mood4.style.boxShadow = "0 15px 35px rgba(121, 130, 246, 0.3)";
  })

  let spanDiv4 = document.createElement("span")
  spanDiv4.innerHTML = "😞"
  spanDiv4.style.fontSize = "48px";
  spanDiv4.style.marginBottom = "15px";
  spanDiv4.style.display = "block";
  spanDiv4.style.filter = "drop-shadow(0 5px 10px rgba(0, 0, 0, 0.3))";
  mood4.appendChild(spanDiv4)
  let innerMoodDiv7 = document.createElement("div")
  innerMoodDiv7.style.color ="#fff";
  innerMoodDiv7.style.fontSize = "18px";
  innerMoodDiv7.style.fontWeight = "600";
  innerMoodDiv7.style.marginBottom = "5px";
  innerMoodDiv7.innerHTML = "Sad"
  mood4.appendChild(innerMoodDiv7)
  let innerMoodDiv8 = document.createElement("div")
  innerMoodDiv8.innerHTML = "Not feeling great today"
  innerMoodDiv8.style.color = "rgba(255, 255, 255, 0.6)";
  innerMoodDiv8.style.fontSize = "14px";
  innerMoodDiv8.style.lineHeight = "1.3";
  mood4.appendChild(innerMoodDiv8)
  moodGrid.appendChild(mood4)

  // Struggling mood div
  let mood5 = document.createElement("div")

  mood5.style.background = "rgba(255, 255, 255, 0.05)";
  mood5.style.border = "2px solid rgba(255, 255, 255, 0.1)";
  mood5.style.borderRadius = "15px";
  mood5.style.padding = "25px 20px";
  mood5.style.cursor = "pointer";
  mood5.style.transition = "all 0.3s ease";
  mood5.style.textAlign = "center";
  mood5.style.position = "relative";
  mood5.style.overflow = "hidden";

  mood5.addEventListener("mouseover", () => {
    mood5.style.color = "red";
    mood5.style.borderColor = "rgba(121, 130, 246, 0.5)";
    mood5.style.background = "rgba(121, 130, 246, 0.1)";
    mood5.style.transform = "translateY(-5px)";
    mood5.style.boxShadow = "0 10px 25px rgba(121, 130, 246, 0.2)";
  });

  mood5.addEventListener("mouseout", () => {
    if (!(userMoodValue === -2)) {
      mood5.style.color = "";
      mood5.style.borderColor = "";
      mood5.style.background = "rgba(255, 255, 255, 0.05)";
      mood5.style.transform = "";
      mood5.style.boxShadow = "";
    }
  });

  mood5.addEventListener("click", () => {
    resetAllMoodsUI();
    setUserMoodValue(-2);
    mood5.style.borderColor = "#7982f6";
    mood5.style.background = "rgba(121, 130, 246, 0.2)";
    mood5.style.transform = "scale(1.05)";
    mood5.style.boxShadow = "0 15px 35px rgba(121, 130, 246, 0.3)";
  })

  let spanDiv5 = document.createElement("span")
  spanDiv5.innerHTML = "😞"
  spanDiv5.style.fontSize = "48px";
  spanDiv5.style.marginBottom = "15px";
  spanDiv5.style.display = "block";
  spanDiv5.style.filter = "drop-shadow(0 5px 10px rgba(0, 0, 0, 0.3))";
  mood5.appendChild(spanDiv5)
  let innerMoodDiv9 = document.createElement("div")
  innerMoodDiv9.style.color ="#fff";
  innerMoodDiv9.style.fontSize = "18px";
  innerMoodDiv9.style.fontWeight = "600";
  innerMoodDiv9.style.marginBottom = "5px";
  innerMoodDiv9.innerHTML = "Struggling"
  mood5.appendChild(innerMoodDiv9)
  let innerMoodDiv10 = document.createElement("div")
  innerMoodDiv10.innerHTML = "Things feel difficult right now"
  innerMoodDiv10.style.color = "rgba(255, 255, 255, 0.6)";
  innerMoodDiv10.style.fontSize = "14px";
  innerMoodDiv10.style.lineHeight = "1.3";
  mood5.appendChild(innerMoodDiv10)
  moodGrid.appendChild(mood5)
  


  divinsideRootDiv.appendChild(moodGrid)

  let submitButtonDiv = document.createElement("div")
  submitButtonDiv.style.display = "flex";
  submitButtonDiv.style.gap = "15px";
  submitButtonDiv.style.justifyContent = "center";
  let submitButton = document.createElement("button")
  submitButton.style.padding = "15px 30px";
  submitButton.style.border = "none";
  submitButton.style.borderRadius = "10px";
  submitButton.style.fontSize = "16px";
  submitButton.style.fontWeight = "600";
  submitButton.style.cursor = "pointer";
  submitButton.style.transition = "all 0.3s ease";
  submitButton.style.position = "relative";
  submitButton.style.overflow = "hidden";
  submitButton.style.minWidth = "120px";
  submitButton.style.background = "linear-gradient(45deg, #7982f6, #8566cc)";
  submitButton.style.color =  "white";
  submitButton.style.boxShadow = "0 5px 15px rgba(121, 130, 246, 0.3)";
  submitButton.style.background = "linear-gradient(45deg, #7982f6, #8566cc)";
  submitButton.style.color = "white";
  submitButton.style.boxShadow = "0 5px 15px rgba(121, 130, 246, 0.3)";
  submitButton.innerHTML = "Submit"
  submitButtonDiv.appendChild(submitButton)

  submitButtonDiv.addEventListener("mouseover", () => {
    submitButton.style.transform = "translateY(-2px)";
    submitButton.style.boxShadow = "0 8px 25px rgba(121, 130, 246, 0.4)";
  });

  submitButtonDiv.addEventListener("mouseout", () => {
    submitButton.style.transform = "";
    submitButton.style.boxShadow = "";
  });

  submitButton.addEventListener("click", sendUserMood);

  divinsideRootDiv.appendChild(submitButtonDiv)

  rootDiv.appendChild(divinsideRootDiv)
  document.body.appendChild(rootDiv)

  let showPopupbutton = document.createElement("button")
  showPopupbutton.style.position = "fixed";
  showPopupbutton.style.top = "30px";
  showPopupbutton.style.right = "30px";
  showPopupbutton.style.background = "linear-gradient(45deg, #7982f6, #8566cc)";
  showPopupbutton.style.color = "white";
  showPopupbutton.style.border = "none";
  showPopupbutton.style.padding = "15px 25px";
  showPopupbutton.style.borderRadius = "50px";
  showPopupbutton.style.fontSize = "16px";
  showPopupbutton.style.fontWeight = "600";
  showPopupbutton.style.cursor = "pointer";
  showPopupbutton.style.boxShadow = "0 5px 20px rgba(121, 130, 246, 0.3)";
  showPopupbutton.style.transition = "all 0.3s ease";
  showPopupbutton.style.zIndex = "100";
  showPopupbutton.innerHTML = "🌍 Share Your Mood"
  showPopupbutton.addEventListener("click", () => {
    rootDiv.style.opacity = "1";
    rootDiv.style.visibility = "visible";
  })
  document.body.appendChild(showPopupbutton)

    // Create info icon button
    let infoButton = document.createElement("button");
    infoButton.innerHTML = "ℹ️";
    infoButton.style.position = "fixed";
    infoButton.style.bottom = "30px";
    infoButton.style.right = "30px";
    infoButton.style.background = "rgba(121, 130, 246, 0.2)";
    infoButton.style.color = "white";
    infoButton.style.border = "2px solid rgba(121, 130, 246, 0.5)";
    infoButton.style.width = "50px";
    infoButton.style.height = "50px";
    infoButton.style.borderRadius = "50%";
    infoButton.style.fontSize = "24px";
    infoButton.style.cursor = "pointer";
    infoButton.style.display = "flex";
    infoButton.style.alignItems = "center";
    infoButton.style.justifyContent = "center";
    infoButton.style.boxShadow = "0 5px 20px rgba(121, 130, 246, 0.3)";
    infoButton.style.transition = "all 0.3s ease";
    infoButton.style.zIndex = "100";

    // Create the info popup (hidden by default)
    let infoPopup = document.createElement("div");
    infoPopup.style.position = "fixed";
    infoPopup.style.bottom = "90px";
    infoPopup.style.right = "30px";
    infoPopup.style.background = "linear-gradient(145deg, rgba(26, 26, 46, 0.98), rgba(15, 15, 35, 0.98))";
    infoPopup.style.border = "2px solid rgba(121, 130, 246, 0.5)";
    infoPopup.style.borderRadius = "15px";
    infoPopup.style.padding = "20px";
    infoPopup.style.maxWidth = "320px";
    infoPopup.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.5)";
    infoPopup.style.opacity = "0";
    infoPopup.style.visibility = "hidden";
    infoPopup.style.transform = "translateY(10px)";
    infoPopup.style.transition = "all 0.3s ease";
    infoPopup.style.zIndex = "101";

    // Popup header
    let infoHeader = document.createElement("h3");
    infoHeader.textContent = "Mood Color Guide";
    infoHeader.style.color = "#7982f6";
    infoHeader.style.fontSize = "20px";
    infoHeader.style.fontWeight = "700";
    infoHeader.style.marginTop = "0";
    infoHeader.style.marginBottom = "15px";
    infoHeader.style.fontFamily = "Arial, sans-serif";
    infoPopup.appendChild(infoHeader);

    // Mood color explanations
    const moodColors = [
      { color: "#00ff00", label: "Excited", description: "Excited, very happy (2.0 to 1.5)" },
      { color: "#00fff0", label: "Happy", description: "Feeling good and content (1.5 to 0.5)" },
      { color: "#ffffff", label: "Neutral", description: "Regular, balanced day (0.5 to -0.5)" },
      { color: "#fff000", label: "Sad", description: "Not feeling great (-0.5 to -1.5)" },
      { color: "#ff0000", label: "Struggling", description: "Difficult times (-1.5 to -2.0)" }
    ];

    moodColors.forEach(mood => {
      let colorRow = document.createElement("div");
      colorRow.style.display = "flex";
      colorRow.style.alignItems = "center";
      colorRow.style.marginBottom = "12px";
      colorRow.style.gap = "12px";

      // Color indicator
      let colorBox = document.createElement("div");
      colorBox.style.width = "24px";
      colorBox.style.height = "24px";
      colorBox.style.borderRadius = "4px";
      colorBox.style.background = mood.color;
      colorBox.style.boxShadow = `0 2px 8px ${mood.color}40`;
      colorBox.style.flexShrink = "0";
      colorRow.appendChild(colorBox);

      // Text container
      let textContainer = document.createElement("div");
      textContainer.style.flex = "1";

      let labelDiv = document.createElement("div");
      labelDiv.textContent = mood.label;
      labelDiv.style.color = "#fff";
      labelDiv.style.fontSize = "14px";
      labelDiv.style.fontWeight = "600";
      labelDiv.style.marginBottom = "2px";
      labelDiv.style.fontFamily = "Arial, sans-serif";
      textContainer.appendChild(labelDiv);

      let descDiv = document.createElement("div");
      descDiv.textContent = mood.description;
      descDiv.style.color = "rgba(255, 255, 255, 0.6)";
      descDiv.style.fontSize = "12px";
      descDiv.style.lineHeight = "1.3";
      descDiv.style.fontFamily = "Arial, sans-serif";
      textContainer.appendChild(descDiv);

      colorRow.appendChild(textContainer);
      infoPopup.appendChild(colorRow);
    });

    // Footer note
    let footerNote = document.createElement("div");
    footerNote.textContent = "Country colors represent the average mood of all users from that region today.";
    footerNote.style.color = "rgba(255, 255, 255, 0.5)";
    footerNote.style.fontSize = "11px";
    footerNote.style.marginTop = "15px";
    footerNote.style.paddingTop = "15px";
    footerNote.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
    footerNote.style.lineHeight = "1.4";
    footerNote.style.fontFamily = "Arial, sans-serif";
    footerNote.style.fontStyle = "italic";
    infoPopup.appendChild(footerNote);

    // Hover events for info button
    infoButton.addEventListener("mouseenter", () => {
      infoButton.style.background = "rgba(121, 130, 246, 0.4)";
      infoButton.style.transform = "scale(1.1)";
      infoPopup.style.opacity = "1";
      infoPopup.style.visibility = "visible";
      infoPopup.style.transform = "translateY(0)";
    });

    infoButton.addEventListener("mouseleave", () => {
      infoButton.style.background = "rgba(121, 130, 246, 0.2)";
      infoButton.style.transform = "scale(1)";
      // Delay hiding to allow user to move cursor to popup
      setTimeout(() => {
        if (!infoPopup.matches(':hover')) {
          infoPopup.style.opacity = "0";
          infoPopup.style.visibility = "hidden";
          infoPopup.style.transform = "translateY(10px)";
        }
      }, 100);
    });

    // Keep popup visible when hovering over it
    infoPopup.addEventListener("mouseenter", () => {
      infoPopup.style.opacity = "1";
      infoPopup.style.visibility = "visible";
      infoPopup.style.transform = "translateY(0)";
    });

    infoPopup.addEventListener("mouseleave", () => {
      infoPopup.style.opacity = "0";
      infoPopup.style.visibility = "hidden";
      infoPopup.style.transform = "translateY(10px)";
    });

    // Add to document
    document.body.appendChild(infoButton);
    document.body.appendChild(infoPopup);

}
