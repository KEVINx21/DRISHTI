// Load the Teachable Machine models
const modelURLs = {
    model1: "https://teachablemachine.withgoogle.com/models/A7R5vUPU_/",
    model2: "https://teachablemachine.withgoogle.com/models/TXIExi8iT/", // Add the URL for Model 2
    model3: "https://teachablemachine.withgoogle.com/models/z588a6qaI/", // Add the URL for Model 3
    model4: "https://teachablemachine.withgoogle.com/models/6zTre34YS/"  // Add the URL for Model 4
};

let model, webcam, successfulPredictionsList, unsuccessfulPredictionsList;

// Function to initialize the selected model
async function initModel(modelName) {
    const URL = modelURLs[modelName];
    if (!URL) {
        console.error("Model URL not found for", modelName);
        return;
    }

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);

    // Setup webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup();
    await webcam.play();

    // Append webcam container to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    // Show model info
    const modelInfo = document.createElement("div");
    modelInfo.innerHTML = `<p>Selected Model: ${modelName}</p>`;
    document.getElementById("model-info").innerHTML = '';
    document.getElementById("model-info").appendChild(modelInfo);
    document.getElementById("model-info").style.display = 'block';
}

// Event listener for model selection buttons
document.querySelectorAll('.btn-model').forEach(button => {
    button.addEventListener('click', function() {
        const modelName = this.getAttribute('data-model');
        initModel(modelName);
    });
});

// Function to start the prediction loop
async function startPredictionLoop() {
    if (!model) {
        console.error("Model not initialized!");
        return;
    }

    loop();
}

// Main prediction loop
async function loop() {
    webcam.update(); // Update webcam frame
    await predict();
    requestAnimationFrame(loop);
}

// Function to make predictions using the model
async function predict() {
    if (!model) return;

    const prediction = await model.predict(webcam.canvas);
    successfulPredictionsList.innerHTML = '';
    unsuccessfulPredictionsList.innerHTML = '';

    for (let i = 0; i < prediction.length; i++) {
        const classPrediction = prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(2) + '%';
        const predictionItem = document.createElement("li");
        predictionItem.classList.add("prediction-item");
        predictionItem.innerText = classPrediction;

        // Highlight predictions with green text for successful predictions and red for unsuccessful predictions
        if (prediction[i].probability >= 0.8) {
            predictionItem.classList.add('text-success');
            successfulPredictionsList.appendChild(predictionItem);
        } else if (prediction[i].probability < 0.5) {
            predictionItem.classList.add('text-danger');
            unsuccessfulPredictionsList.appendChild(predictionItem);
        }
    }
}
