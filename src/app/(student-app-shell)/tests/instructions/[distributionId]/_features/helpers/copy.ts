export const INSTRUCTION_COPY = {
    page: {
        title: "Test Instructions",
        subtitle:
            "Please read the following instructions carefully before starting the test.",
    },

    status: {
        scheduled: "This test has not started yet.",
        ended: "This test has already ended.",
    },

    general: {
        title: "General Instructions",
        rules: [
            "Do not refresh or close the browser during the test.",
            "Your answers are saved automatically when you move between questions.",
            "The test timer will continue even if you lose connection.",
            "You may navigate freely between questions and sections during the test.",
        ],
    },

    legend: {
        title: "Question Status Legend",
        notVisited: "Not Visited",
        notAnswered: "Visited but Not Answered",
        answered: "Answered",
        review: "Marked for Review",
        answeredReview:
            "Answered and Marked for Review (Will Be Considered for Evaluation)",
    },

    section: {
        instructionsHeader: "Instructions for This Section",
        markingHeader: "Marking Scheme",
    },

    startGate: {
        checkbox:
            "I have read and understood the instructions given above and agree to follow them.",
        start: "Start Test",
        locked: "Start Locked",
    },
}
