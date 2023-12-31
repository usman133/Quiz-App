const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const game = document.getElementById("game");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

//Fetching questions from the JSON file
fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple").then(res => {
    return res.json();
})
.then(loadedQuestions => {
   questions = loadedQuestions.results.map(loadedQuestion => {
    const formattedQuestion = {
        question: loadedQuestion.question
    };

    const answerChoices = [... loadedQuestion.incorrect_answers];
    formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
    answerChoices.splice(
        formattedQuestion.answer - 1,0,loadedQuestion.correct_answer
    );

    answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
    });

    return formattedQuestion;
   });

   startGame();
})
.catch(err => {
    console.error(err);
});

//CONSTANTS
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 3;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [ ... questions];
    getNewQuestion();
    // To unide the game
    game.classList.remove("hidden");

    //To hide the loader
    loader.classList.add("hidden");
};

getNewQuestion = () => {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS){
        
        localStorage.setItem("mostRecentScore", score);
        //go to the end page
        return window.location.assign("/end.html");

    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;

    // Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];

        // Assign classes to correct and incorrect choices
        const classToApply = selectedAnswer == currentQuestion.answer ? 'correct': 'incorrect';
        selectedChoice.parentElement.classList.add(classToApply);

        // if the answer is correct, increment the score by the correct bonus set
        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }

        // Adds a one second delay after the question is answered
        setTimeout(() => {
        selectedChoice.parentElement.classList.remove(classToApply);
        getNewQuestion();
        }, 1000);
    });
});

incrementScore = num => {
    score += num;
    scoreText.innerText = score;
};



