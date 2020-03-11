// More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

    // the link to your model provided by Teachable Machine export panel
    //const URL = "https://teachablemachine.withgoogle.com/models/tY4guYBx/";

    const URL_face = "https://teachablemachine.withgoogle.com/models/4bilP6h6/";//Add model to recognize the presence of a face
    const URL_gender= "https://teachablemachine.withgoogle.com/models/ozOWNmZ-/";//Add model to recognize the gender
    

    //URL for male and female frame classification
    const URL_male = "https://teachablemachine.withgoogle.com/models/ibO0d9La/";
    const URL_female = "https://teachablemachine.withgoogle.com/models/ZiDXOblP/";

    let model,model1,model2,model3,model4;
    let maxPredictions,maxPredictions1,maxPredictions2,maxPredictions3,maxPredictions4, webcam, gender; 
    let labelContainer; // declared by designer................................REMOVE!!
    let threshold_face = 0.60;
    let status = 0;
    let flag = true;
    let cl1=[0], cl2=[0], cl3=[0];
    let prediction;
    let modelURL,metadataURL;
    let face_shape = "";
    

     // Load the model data along with the respective metadata
        //const modelURL = URL + "model.json";
        //const metadataURL = URL + "metadata.json";

    const model_faceURL = URL_face + "model.json";
    const metadata_faceURL = URL_face + "metadata.json";

    const model_genderURL = URL_gender + "model.json";
    const metadata_genderURL = URL_gender + "metadata.json";

    const model_maleURL = URL_male + "model.json";
    const metadata_maleURL = URL_male + "metadata.json";

    const model_femaleURL = URL_female + "model.json";
    const metadata_femaleURL = URL_female + "metadata.json";

    // Load the image model and setup the webcam
    (function(){
        setTimeout(init,2000);
    })()

    async function init() 
    {
        
        //PLEASE WAIT, MODEL IS LOADING


        //console.log("init is called"); // uncomment to debug
        // Convenience function to setup a webcam
        modelURL = model_faceURL;
        metadataURL = metadata_faceURL;
        model1 = await tmImage.load(modelURL, metadataURL);
        maxPredictions1 = model1.getTotalClasses();
        //console.log(maxPredictions1);

        modelURL = model_genderURL;
        metadataURL = metadata_genderURL;
        model2 = await tmImage.load(modelURL, metadataURL);
        maxPredictions2 = model2.getTotalClasses();


        //LOOK AT THE CAMERA.

        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(370, 370, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        webcam.update();
        window.requestAnimationFrame(loop);

        
        if(document.getElementById("webcam-container").firstChild)
        {
            document.getElementById("webcam-container").replaceChild(webcam.canvas);
        }
        else
        {
            document.getElementById("webcam-container").appendChild(webcam.canvas);
        }
        // above line shows webcam image by displaying webcam canvas in the container
        
        /*labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) 
        { 
            // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }*/
        
}

async function loop() 
{
    //console.log(status)
    if (status == 0)// to check if a face is present in frame
    {
        
       var x= document.getElementById("facenoface");
       x.textContent="FACE DETECTED";
       x.style.color="white";

        //load model face
        if(flag==true)
        {
            
            model = model1;
            maxPredictions = maxPredictions1;
            //console.log(maxPredictions);
            flag = false;
        }
        //model = await tmImage.load(model_faceURL, metadata_faceURL);
        //maxPredictions = model.getTotalClasses();
        webcam.update();
        await predict();
        //prediction = await predict();
        if(prediction[0].probability >= threshold_face)
        {
            status = 1;
            flag = true;
        }
    }
    else if (status == 1) // for gender prediction
    {
        if(flag==true)
        {
            model = model2;
            maxPredictions=maxPredictions2;
            setTimeout(increment,3000);
            flag = false;
        }
        updandpred_gender();
    }
    else if (status == 2) // once timeout is reached check the gender
    {
        var y= document.getElementById("sex");

        if(((cl1.reduce((a,b) => a += b)/cl1.length)>((cl2.reduce((a,b) => a += b))/cl2.length)))
        {
            increment();
            gender="female";
            y.textContent="GENDER: FEMALE";
            y.style.color="white";
             // gender is identified as male________________ check
        }
        else
        {
            increment(); 
            gender="male";
            console.log("Gender: male detected");
            y.textContent="GENDER: MALE";
            y.style.color="white";
            // gender is identified as female________________ check

        }
        cl1=cl2=[0];
    }
    else if (status == 3 && gender=="male")
    {
        //load model male
        if(flag==true)
        {
            modelURL = model_maleURL;
            metadataURL = metadata_maleURL;
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();


            setTimeout(increment,3000);
            flag = false;
        }
        updandpred_frame();
    }
    else if (status == 3 && gender == "female")
    {
        //load model female
        if(flag==true)
        {
            modelURL = model_femaleURL;
            metadataURL = metadata_femaleURL;
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            setTimeout(increment,3000);
            flag = false;
        }
        updandpred_frame();
    }
    else if(status == 4) // find the right frame for the face
    {
        
        let cir = (cl1.reduce((a,b) => a += b))/cl1.length;
        let rec = (cl2.reduce((a,b) => a += b))/cl2.length;
        let vsh = (cl3.reduce((a,b) => a += b))/cl3.length;
        var z= document.getElementById("sex");

        if (cir > rec && rec > vsh) 
        {
                face_shape = "circular";
                z.textContent="FACE SHAPE: CIRCULAR";
                z.style.color="white";
        } 
        else if (rec > vsh) 
        {
                face_shape = "rectangle";
                z.textContent="FACE SHAPE: RECTANGULAR";
                z.style.color="white";
        } 
        else 
        {
                face_shape = "v-shape";
                z.textContent="FACE SHAPE: V-SHAPE";
                z.style.color="white";
        }
        console.log("face shape:", face_shape);

        var ft= document.getElementById("frameType");
        if(gender=="male")
        {
            switch(face_shape) 
            {
                case "circular":
                    frame= "round";
                    ft.innerHTML="AIRFLEX";
                    break;
                case "rectangle":
                    frame= "square";
                    ft.innerHTML="WAYFARER";

                    break;
                case "v-shape":
                    frame= "frameless";
                    ft.innerHTML="FRAMELESS";

                    break;
                default:
                    frame = "no detection";
                    ft.innerHTML="NO DETECTION";

            }
        }
        else if(gender = "female")
        {
             switch(face_shape) 
            {
                case "circular":
                    frame= "round";
                    ft.innerHTML="ROUND";
                    break;
                case "rectangle":
                    frame= "square";
                    ft.innerHTML="AVIATOR";
                    break;
                case "v-shape":
                    frame= "cat-eye";
                    ft.innerHTML="CAT EYE";
                    break;
                default:
                    frame = "no detection";
                    ft.innerHTML="NO DETECTION";
            }
        }
        status++;
        
    }
    else if(status==5) // stop the classification and exit the loop
    {
        stopclass();
    }
    if(status!=6) // as long as the status has not incremented to the 6th state
    {
    window.requestAnimationFrame(loop);
    }
}


function stopclass()// execute when classification is complete
{
    webcam.stop();
    status++;
    console.log(gender);
    console.log(face_shape);
    console.log(frame);
}

async function updandpred_gender()
{
    webcam.update();
    await predict();
    cl1.push(prediction[0].probability);
    cl2.push(prediction[1].probability);
}


async function updandpred_frame()
{
    webcam.update();
    await predict();
    //console.log(maxPredictions);
    cl1.push(prediction[0].probability);
    cl2.push(prediction[1].probability);
    cl3.push(prediction[2].probability);
}


function increment()
{
    status++;
    flag = true;
}

// run the webcam image through the image model
async function predict() 
{
    // predict can take in an image, video or canvas html element
    
    prediction = await model.predict(webcam.canvas);

    /*for (let i = 0; i < maxPredictions; i++) 
    {
        const classPrediction =
        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
        //const a = console.log(prediction[0].probability);
        //const b = console.log(prediction[1].probability);
    }*/
}
